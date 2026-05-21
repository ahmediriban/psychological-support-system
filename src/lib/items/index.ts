import { prisma } from "../prisma"

export async function createItem(data: { name: string; unit?: string }) {
  return prisma.item.create({ data: data as any })
}

export async function getItemById(id: string) {
  return prisma.item.findUnique({ where: { id } })
}

export async function listItems() {
  return prisma.item.findMany({ orderBy: { name: "asc" } as any })
}

export async function updateItem(
  id: string,
  data: { name?: string; unit?: string | null }
) {
  return prisma.item.update({ where: { id }, data: data as any })
}

export async function deleteItem(id: string) {
  return prisma.item.delete({ where: { id } })
}
