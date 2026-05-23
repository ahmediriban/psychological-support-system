import type { ItemCategoryEnum } from "../../schemas/items/create-item.schema";
import { prisma } from "../prisma";

// ─── Basic CRUD ───────────────────────────────────────────────────────────────

export async function createTeam(data: { name: string; category: ItemCategoryEnum }) {
  return prisma.team.create({ data: data as any });
}

export async function getTeamById(id: string) {
  return prisma.team.findUnique({ where: { id } })
}

export async function listTeams(category?: ItemCategoryEnum) {
  return prisma.team.findMany({
    where: category ? ({ category } as any) : undefined,
    orderBy: { name: "asc" } as any,
  });
}

export async function updateTeam(id: string, name: string) {
  return prisma.team.update({ where: { id }, data: { name } as any })
}

export async function deleteTeam(id: string) {
  await Promise.all([
    prisma.stock.deleteMany({ where: { teamId: id } }),
    prisma.usageLog.deleteMany({ where: { teamId: id } }),
    prisma.stockTransaction.deleteMany({ where: { teamId: id } }),
  ]);
  return prisma.team.delete({ where: { id } });
}

// ─── Teams list with summary (for /teams page) ────────────────────────────────

export async function getTeams(category?: ItemCategoryEnum) {
  return prisma.team.findMany({
    where: category ? ({ category } as any) : undefined,
    orderBy: { name: "asc" } as any,
    include: {
      users: {
        where: { role: "USER" } as any,
        take: 1,
        select: { id: true, name: true, email: true, teamId: true },
      },
      _count: {
        select: { stocks: true, usages: true },
      },
    } as any,
  })
}

// ─── Team detail with users ───────────────────────────────────────────────────

export async function getTeamWithUsers(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true, teamId: true },
      },
    } as any,
  })
}

// ─── Workers ──────────────────────────────────────────────────────────────────

export async function getTeamUsers(teamId: string) {
  return prisma.user.findMany({
    where: { teamId } as any,
    orderBy: { createdAt: "asc" },
  })
}

export async function getWorkers() {
  return prisma.user.findMany({
    where: { role: "USER" } as any,
    select: { id: true, name: true, email: true, teamId: true },
    orderBy: { name: "asc" } as any,
  })
}

// ─── Worker assignment ────────────────────────────────────────────────────────

export async function assignUserToTeam(userId: string, teamId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { teamId } as any,
  })
}

export async function assignWorkerToTeam(teamId: string, userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { teamId } as any,
  })
}

export async function removeUserFromTeam(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { teamId: null } as any,
  })
}

// ─── Team data summaries ──────────────────────────────────────────────────────

export async function getTeamStockSummary(teamId: string) {
  return prisma.stock.findMany({
    where: { teamId } as any,
    include: { item: true } as any,
    orderBy: { item: { name: "asc" } } as any,
  });
}

export async function searchTeamStock(teamId: string, q: string, limit: number) {
  const where: Record<string, unknown> = { teamId, quantity: { gt: 0 } };
  if (q) where.item = { name: { contains: q, mode: "insensitive" } };
  return prisma.stock.findMany({
    where: where as any,
    include: { item: true } as any,
    orderBy: { item: { name: "asc" } } as any,
    take: limit,
  });
}

export async function getTeamUsageHistory(teamId: string) {
  return prisma.usageLog.findMany({
    where: { teamId } as any,
    include: { item: true, user: true } as any,
    orderBy: { createdAt: "desc" } as any,
    take: 100,
  })
}

export async function getTeamUsageHistoryPaged(teamId: string, page: number, pageSize: number) {
  const where = { teamId };
  const [data, total] = await Promise.all([
    prisma.usageLog.findMany({
      where: where as any,
      include: { item: true, user: true } as any,
      orderBy: { createdAt: "desc" } as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.usageLog.count({ where: where as any }),
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getTeamDistributionHistory(teamId: string) {
  return prisma.stockTransaction.findMany({
    where: { teamId, type: "GIVE" } as any,
    include: { item: true } as any,
    orderBy: { createdAt: "desc" } as any,
    take: 100,
  })
}

export async function getTeamDistributionHistoryPaged(teamId: string, page: number, pageSize: number) {
  const where = { teamId, type: "GIVE" };
  const [data, total] = await Promise.all([
    prisma.stockTransaction.findMany({
      where: where as any,
      include: { item: true } as any,
      orderBy: { createdAt: "desc" } as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.stockTransaction.count({ where: where as any }),
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
