import { prisma } from "../prisma"

export async function getStockByTeamAndItem(teamId: string, itemId: string) {
  return prisma.stock.findUnique({
    where: { itemId_teamId: { itemId, teamId } } as any,
    include: { item: true, team: true } as any,
  })
}

export async function getTeamStock(teamId: string) {
  return prisma.stock.findMany({
    where: { teamId } as any,
    include: { item: true } as any,
    orderBy: { item: { name: "asc" } } as any,
  })
}

export async function getItemStockAcrossTeams(itemId: string) {
  return prisma.stock.findMany({
    where: { itemId } as any,
    include: { team: true } as any,
  })
}

export async function increaseStock(
  teamId: string,
  itemId: string,
  amount: number
) {
  if (amount <= 0) throw new Error("Amount must be positive")
  return prisma.stock.upsert({
    where: { itemId_teamId: { itemId, teamId } } as any,
    create: { itemId, teamId, quantity: amount } as any,
    update: { quantity: { increment: amount } } as any,
  })
}

export async function decreaseStock(
  teamId: string,
  itemId: string,
  amount: number
) {
  if (amount <= 0) throw new Error("Amount must be positive")
  await assertStockAvailable(teamId, itemId, amount)
  return prisma.stock.update({
    where: { itemId_teamId: { itemId, teamId } } as any,
    data: { quantity: { decrement: amount } } as any,
  })
}

export async function validateStockAvailability(
  teamId: string,
  itemId: string,
  requiredQuantity: number
): Promise<boolean> {
  const stock = await getStockByTeamAndItem(teamId, itemId)
  return !!(stock && (stock as any).quantity >= requiredQuantity)
}

export async function assertStockAvailable(
  teamId: string,
  itemId: string,
  requiredQuantity: number
) {
  const available = await validateStockAvailability(teamId, itemId, requiredQuantity)
  if (!available) throw new Error(`Insufficient stock for item ${itemId} in team ${teamId}`)
}

export function assertNoNegativeStock(currentQuantity: number, amount: number) {
  if (currentQuantity - amount < 0) {
    throw new Error("Stock cannot go below zero")
  }
}
