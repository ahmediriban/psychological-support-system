import { deleteTeam, getTeamWithUsers } from "../../../../lib/teams";
import { getCurrentUserWithRole } from "../../../../lib/auth";
import { Role } from "../../../../generated/prisma/enums";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // WORKER can only access their own team
  if (user.role === Role.USER && user.teamId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const team = await getTeamWithUsers(id);
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(team);
  } catch {
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // WORKER can only access their own team
  if (user.role === Role.USER && user.teamId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await deleteTeam(id);
    return NextResponse.json({ message: "Team deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
  }
}
