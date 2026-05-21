import { createUsage, getAllUsage, getUsageByTeam } from "../../../lib/usage";
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

  const teamId = req.nextUrl.searchParams.get("teamId");

  try {
    if (user.role === Role.USER) {
      // Workers only see their own team's history
      if (!user.teamId) return NextResponse.json([]);
      const usage = await getUsageByTeam(user.teamId);
      return NextResponse.json(usage);
    }

    // ADMIN / SUPERVISOR: optional teamId filter
    if (teamId) {
      const usage = await getUsageByTeam(teamId);
      return NextResponse.json(usage);
    }

    const usage = await getAllUsage();
    return NextResponse.json(usage);
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
