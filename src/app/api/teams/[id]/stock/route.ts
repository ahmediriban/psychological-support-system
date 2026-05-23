import { getTeamStockSummary, searchTeamStock } from "../../../../../lib/teams";
import { getCurrentUserWithRole } from "../../../../../lib/auth";
import { Role } from "../../../../../generated/prisma/enums";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

const SEARCH_LIMIT = 10;

export async function GET(req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (user.role === Role.USER && user.teamId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const isSearch = searchParams.has("q");

  try {
    if (isSearch) {
      const results = await searchTeamStock(id, q, SEARCH_LIMIT);
      return NextResponse.json(results);
    }

    const stock = await getTeamStockSummary(id);
    return NextResponse.json(stock);
  } catch {
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}
