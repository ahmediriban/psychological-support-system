import { bulkImportItems } from "../../../../lib/items";
import { getCurrentUserWithRole } from "../../../../lib/auth";
import { Role } from "../../../../generated/prisma/enums";
import { bulkImportSchema } from "../../../../schemas/items/bulk-import.schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUserWithRole(await headers());
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = bulkImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const results = await bulkImportItems(parsed.data.items);
    return NextResponse.json({ imported: results.length });
  } catch(err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to import items" }, { status: 500 });
  }
}
