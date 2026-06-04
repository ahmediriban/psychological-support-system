import { getTeamUsageByDateRange, getTeamDistributionByDateRange } from "../../../../../lib/teams";
import { getCurrentUserWithRole } from "../../../../../lib/auth";
import { Role } from "../../../../../generated/prisma/enums";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (user.role === Role.USER && user.teamId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const fromStr = req.nextUrl.searchParams.get("from");
  const toStr = req.nextUrl.searchParams.get("to");

  const fromDate = fromStr ? new Date(fromStr) : new Date(now.getFullYear(), now.getMonth(), 1);
  const toDate = toStr ? new Date(toStr) : new Date(now);
  toDate.setHours(23, 59, 59, 999);

  try {
    const [usage, distribution] = await Promise.all([
      getTeamUsageByDateRange(id, fromDate, toDate),
      getTeamDistributionByDateRange(id, fromDate, toDate),
    ]);
    return NextResponse.json({ usage, distribution });
  } catch {
    return NextResponse.json({ error: "Failed to fetch export data" }, { status: 500 });
  }
}
