import { listItemsPagedWithAvailable, listItemsWithAvailable } from "../../../../lib/items";
import { getCurrentUserWithRole } from "../../../../lib/auth";
import { Role } from "../../../../generated/prisma/enums";
import { ITEM_CATEGORIES, type ItemCategoryEnum } from "../../../../schemas/items/create-item.schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === Role.USER) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const rawCategory = searchParams.get("category");
  const category = ITEM_CATEGORIES.includes(rawCategory as ItemCategoryEnum)
    ? (rawCategory as ItemCategoryEnum)
    : undefined;

  const rawPage = searchParams.get("page");
  const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : null;

  try {
    if (page !== null) {
      const result = await listItemsPagedWithAvailable(category, page, PAGE_SIZE);
      return NextResponse.json(result);
    }

    const items = await listItemsWithAvailable(category);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch available quantities" }, { status: 500 });
  }
}
