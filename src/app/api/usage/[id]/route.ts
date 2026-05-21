import { getUsageById } from "../../../../lib/usage";
import { getCurrentUserWithRole } from "../../../../lib/auth";
import { Role } from "../../../../generated/prisma/enums";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const record = await getUsageById(id);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Workers can only view records for their own team
    if (user.role === Role.USER && record.teamId !== user.teamId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Failed to fetch usage record" }, { status: 500 });
  }
}
