import { getTeamUsageHistory, getTeamUsageHistoryPaged } from "../../../../../lib/teams";
import { getCurrentUserWithRole } from "../../../../../lib/auth";
import { Role } from "../../../../../generated/prisma/enums";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

const PAGE_SIZE = 12;

export async function GET(req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (user.role === Role.USER && user.teamId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rawPage = req.nextUrl.searchParams.get("page");
  const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : null;

  try {
    if (page !== null) {
      const result = await getTeamUsageHistoryPaged(id, page, PAGE_SIZE);
      return NextResponse.json(result);
    }
    const usage = await getTeamUsageHistory(id);
    return NextResponse.json(usage);
  } catch {
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
