import { getWorkers } from "../../../../lib/teams";
import { getCurrentUserWithRole } from "../../../../lib/auth";
import { Role } from "../../../../generated/prisma/enums";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const workers = await getWorkers();
    return NextResponse.json(workers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 });
  }
}
