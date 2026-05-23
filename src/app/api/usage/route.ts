import { createUsage, getAllUsage, getAllUsagePaged, getUsageByTeam, getUsageByTeamPaged } from "../../../lib/usage";
import { getCurrentUserWithRole } from "../../../lib/auth";
import { Role } from "../../../generated/prisma/enums";
import { createUsageSchema } from "../../../schemas/usage/create-usage.schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAuthedUser() {
  return getCurrentUserWithRole(await headers());
}

export async function GET(req: NextRequest) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const teamId = searchParams.get("teamId");
  const rawPage = searchParams.get("page");
  const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : null;
  const PAGE_SIZE = 12;

  try {
    if (user.role === Role.USER) {
      if (!user.teamId) return NextResponse.json(page !== null ? { data: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0 } : []);
      if (page !== null) return NextResponse.json(await getUsageByTeamPaged(user.teamId, page, PAGE_SIZE));
      return NextResponse.json(await getUsageByTeam(user.teamId));
    }

    if (teamId) {
      if (page !== null) return NextResponse.json(await getUsageByTeamPaged(teamId, page, PAGE_SIZE));
      return NextResponse.json(await getUsageByTeam(teamId));
    }

    if (page !== null) return NextResponse.json(await getAllUsagePaged(page, PAGE_SIZE));
    return NextResponse.json(await getAllUsage());
  } catch {
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === Role.SUPERVISOR) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createUsageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  // Workers can only log usage for their own team
  if (user.role === Role.USER && parsed.data.teamId !== user.teamId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const record = await createUsage(parsed.data, user.id);
    return NextResponse.json(record, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NO_STOCK") {
      return NextResponse.json(
        { error: "This team has no stock for the selected item" },
        { status: 409 }
      );
    }
    if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { error: "Quantity exceeds available team stock" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create usage record" }, { status: 500 });
  }
}
