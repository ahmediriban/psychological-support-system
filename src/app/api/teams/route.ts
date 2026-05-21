import { deleteTeam, getTeams } from "../../../lib/teams";
import { getCurrentUserWithRole } from "../../../lib/auth";
import { Role } from "../../../generated/prisma/enums";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const teams = await getTeams();

    // WORKER sees only their own team
    if (user.role === Role.USER) {
      const own = teams.filter((t) => t.id === user.teamId);
      return NextResponse.json(own);
    }

    return NextResponse.json(teams);
  } catch {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
