import { deleteTeam, getTeams } from "../../../lib/teams";
import { getCurrentUserWithRole } from "../../../lib/auth";
import { Role } from "../../../generated/prisma/enums";
import { ITEM_CATEGORIES, type ItemCategoryEnum } from "../../../schemas/items/create-item.schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rawCategory = searchParams.get("category");
  const category = ITEM_CATEGORIES.includes(rawCategory as ItemCategoryEnum)
    ? (rawCategory as ItemCategoryEnum)
    : undefined;

  try {
    const teams = await getTeams(category);

    if (user.role === Role.USER) {
      const own = teams.filter((t) => t.id === user.teamId);
      return NextResponse.json(own);
    }

    return NextResponse.json(teams);
  } catch {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
