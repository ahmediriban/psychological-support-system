import type { ItemCategoryEnum } from "../../schemas/items/create-item.schema";
import { prisma } from "../prisma";

export async function createItem(data: {
  name: string;
  unit?: string;
  category: ItemCategoryEnum;
  totalQuantity: number;
}) {
  return prisma.item.create({ data: data as any });
}

export async function getItemById(id: string) {
  return prisma.item.findUnique({ where: { id } });
}

export async function listItems(category?: ItemCategoryEnum) {
  return prisma.item.findMany({
    where: category ? ({ category } as any) : undefined,
    orderBy: { name: "asc" } as any,
  });
}

export async function updateItem(
  id: string,
  data: { name?: string; unit?: string | null; category?: ItemCategoryEnum; totalQuantity?: number }
) {
  return prisma.item.update({ where: { id }, data: data as any });
}

export async function deleteItem(id: string) {
  return prisma.item.delete({ where: { id } });
}

/** Total already distributed for an item across all teams */
export async function getDistributedQuantity(itemId: string): Promise<number> {
  const result = await (prisma.stockTransaction as any).aggregate({
    where: { itemId, type: "GIVE" },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

/** Available to distribute = totalQuantity - already distributed */
export async function getAvailableQuantity(itemId: string): Promise<number> {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return 0;
  const distributed = await getDistributedQuantity(itemId);
  return Math.max(0, (item as any).totalQuantity - distributed);
}
