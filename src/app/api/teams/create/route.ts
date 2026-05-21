import { createTeam } from "../../../../lib/teams";
import { getCurrentUserWithRole } from "../../../../lib/auth";
import { Role } from "../../../../generated/prisma/enums";
import { createTeamSchema } from "../../../../schemas/teams/create-team.schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  try {
    const team = await createTeam(parsed.data);
    return NextResponse.json(team, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
