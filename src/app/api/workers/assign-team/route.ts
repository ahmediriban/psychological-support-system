import { assignWorkerToTeam } from "../../../../lib/workers";
import { getCurrentUserWithRole } from "../../../../lib/auth";
import { Role } from "../../../../generated/prisma/enums";
import { assignTeamSchema } from "../../../../schemas/workers/assign-team.schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = assignTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  try {
    const worker = await assignWorkerToTeam(parsed.data.workerId, parsed.data.teamId);
    return NextResponse.json(worker);
  } catch {
    return NextResponse.json({ error: "Failed to assign team" }, { status: 500 });
  }
}
