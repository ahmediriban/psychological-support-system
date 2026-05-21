import { getDistributionById } from "../../../../lib/distribution";
import { getCurrentUserWithRole } from "../../../../lib/auth";
import { Role } from "../../../../generated/prisma/enums";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === Role.USER) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const distribution = await getDistributionById(id);
    if (!distribution) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(distribution);
  } catch {
    return NextResponse.json({ error: "Failed to fetch distribution" }, { status: 500 });
  }
}
