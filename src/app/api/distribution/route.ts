import { createDistribution, getDistributions } from "../../../lib/distribution";
import { getCurrentUserWithRole } from "../../../lib/auth";
import { Role } from "../../../generated/prisma/enums";
import { createDistributionSchema } from "../../../schemas/distribution/create-distribution.schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAuthedUser() {
  return getCurrentUserWithRole(await headers());
}

export async function GET() {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === Role.USER) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const distributions = await getDistributions();
    return NextResponse.json(distributions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch distributions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createDistributionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  try {
    const distribution = await createDistribution(parsed.data, user.id);
    return NextResponse.json(distribution, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "ITEM_NOT_FOUND") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (err instanceof Error && err.message === "TEAM_NOT_FOUND") {
      return NextResponse.json({ error: "One or more teams not found" }, { status: 404 });
    }
    if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json({ error: "INSUFFICIENT_STOCK" }, { status: 422 });
    }
    return NextResponse.json({ error: "Failed to create distribution" }, { status: 500 });
  }
}
