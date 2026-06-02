import type { ItemCategoryEnum } from "../../schemas/items/create-item.schema";
import { prisma } from "../prisma";

// ─── Basic CRUD ───────────────────────────────────────────────────────────────

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
  return prisma.$transaction([
    prisma.usageLog.deleteMany({ where: { itemId: id } }),
    prisma.stockTransaction.deleteMany({ where: { itemId: id } }),
    prisma.stock.deleteMany({ where: { itemId: id } }),
    prisma.item.delete({ where: { id } }),
  ]);
}

export async function bulkImportItems(
  rows: { name: string; unit?: string; category: ItemCategoryEnum; quantity: number }[]
) {
  return Promise.all(
    rows.map((row) =>
      (prisma.item as any).upsert({
        where: { name: row.name },
        create: {
          name: row.name,
          unit: row.unit ?? null,
          category: row.category,
          totalQuantity: row.quantity,
        },
        update: {
          totalQuantity: { increment: row.quantity },
        },
      })
    )
  );
}

// ─── List/search with available quantity ──────────────────────────────────────
// totalQuantity IS the available quantity — it decrements on every distribution.

export async function listItemsWithAvailable(category?: ItemCategoryEnum) {
  const items = await listItems(category);
  return (items as any[]).map((item) => ({ ...item, availableQuantity: item.totalQuantity }));
}

export async function listItemsPagedWithAvailable(
  category: ItemCategoryEnum | undefined,
  page: number,
  pageSize: number
) {
  const where = category ? ({ category } as any) : undefined;
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { name: "asc" } as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.item.count({ where }),
  ]);
  return {
    data: (items as any[]).map((item) => ({ ...item, availableQuantity: item.totalQuantity })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function searchItemsWithAvailable(
  q: string,
  category: ItemCategoryEnum | undefined,
  limit: number
) {
  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (q) where.name = { contains: q, mode: "insensitive" };
  const items = await prisma.item.findMany({
    where: where as any,
    orderBy: { name: "asc" } as any,
    take: limit,
  });
  return (items as any[]).map((item) => ({ ...item, availableQuantity: item.totalQuantity }));
}
