import { prisma } from "../prisma"

type StockTransactionType = "GIVE" | "USE" | "RETURN"

export async function createStockTransaction(data: {
  teamId: string
  itemId: string
  type: StockTransactionType
  quantity: number
  note?: string
}) {
  return prisma.stockTransaction.create({ data: data as any })
}

export async function getTransactionsByTeam(teamId: string) {
  return prisma.stockTransaction.findMany({
    where: { teamId } as any,
    include: { item: true, team: true } as any,
    orderBy: { createdAt: "desc" } as any,
  })
}

export async function getTransactionsByItem(itemId: string) {
  return prisma.stockTransaction.findMany({
    where: { itemId } as any,
    include: { item: true, team: true } as any,
    orderBy: { createdAt: "desc" } as any,
  })
}

export async function getAllTransactions(filters?: {
  teamId?: string
  itemId?: string
  type?: StockTransactionType
}) {
  return prisma.stockTransaction.findMany({
    where: filters as any,
    include: { item: true, team: true } as any,
    orderBy: { createdAt: "desc" } as any,
  })
}

export async function logGiveTransaction(
  teamId: string,
  itemId: string,
  quantity: number,
  note?: string
) {
  return createStockTransaction({ teamId, itemId, type: "GIVE", quantity, note })
}

export async function logUseTransaction(
  teamId: string,
  itemId: string,
  quantity: number,
  note?: string
) {
  return createStockTransaction({ teamId, itemId, type: "USE", quantity, note })
}

export async function logReturnTransaction(
  teamId: string,
  itemId: string,
  quantity: number,
  note?: string
) {
  return createStockTransaction({ teamId, itemId, type: "RETURN", quantity, note })
}
