import { deleteItem, updateItem } from "../../../../lib/items";
import { getCurrentUserWithRole } from "../../../../lib/auth";
import { Role } from "../../../../generated/prisma/enums";
import { updateItemSchema } from "../../../../schemas/items/update-item.schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAuthedUser() {
  return getCurrentUserWithRole(await headers());
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  try {
    const item = await updateItem(id, parsed.data);
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    await deleteItem(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
