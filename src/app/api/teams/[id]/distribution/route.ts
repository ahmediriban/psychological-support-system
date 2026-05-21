import { getTeamDistributionHistory } from "../../../../../lib/teams";
import { getCurrentUserWithRole } from "../../../../../lib/auth";
import { Role } from "../../../../../generated/prisma/enums";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (user.role === Role.USER && user.teamId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const distributions = await getTeamDistributionHistory(id);
    return NextResponse.json(distributions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch distributions" }, { status: 500 });
  }
}
