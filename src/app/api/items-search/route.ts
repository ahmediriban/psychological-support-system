import { searchItemsWithAvailable } from "../../../lib/items";
import { getCurrentUserWithRole } from "../../../lib/auth";
import { Role } from "../../../generated/prisma/enums";
import { ITEM_CATEGORIES, type ItemCategoryEnum } from "../../../schemas/items/create-item.schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const LIMIT = 10;

export async function GET(req: NextRequest) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === Role.USER) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  const rawCategory = searchParams.get("category");
  const category = ITEM_CATEGORIES.includes(rawCategory as ItemCategoryEnum)
    ? (rawCategory as ItemCategoryEnum)
    : undefined;

  try {
    const items = await searchItemsWithAvailable(q, category, LIMIT);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to search items" }, { status: 500 });
  }
}
