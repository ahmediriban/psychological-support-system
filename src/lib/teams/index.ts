import type { ItemCategoryEnum } from "../../schemas/items/create-item.schema";
import { prisma } from "../prisma";

// ─── Basic CRUD ───────────────────────────────────────────────────────────────

export async function createTeam(data: { name: string; categories: ItemCategoryEnum[] }) {
  return prisma.team.create({ data: data as any });
}

export async function getTeamById(id: string) {
  return prisma.team.findUnique({ where: { id } })
}

export async function listTeams() {
  return prisma.team.findMany({
    orderBy: { name: "asc" } as any,
  });
}

export async function updateTeam(id: string, data: { name: string; categories: ItemCategoryEnum[] }) {
  return prisma.team.update({ where: { id }, data: data as any });
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

export async function getTeams() {
  return prisma.team.findMany({
    orderBy: { name: "asc" } as any,
    include: {
      users: {
        where: { role: "USER" } as any,
        select: { id: true, name: true, email: true, teamId: true, isTeamLeader: true },
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

export async function assignWorkerToTeam(teamId: string, userIds: string[], leaderId: string) {
  // Clear all current members from this team
  await (prisma.user as any).updateMany({
    where: { teamId },
    data: { teamId: null, isTeamLeader: false },
  });
  // Assign all new members (non-leaders first)
  await (prisma.user as any).updateMany({
    where: { id: { in: userIds } },
    data: { teamId, isTeamLeader: false },
  });
  // Mark the leader
  return prisma.user.update({
    where: { id: leaderId },
    data: { isTeamLeader: true } as any,
  });
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

export async function searchTeamStock(teamId: string, q: string, limit: number, category?: ItemCategoryEnum) {
  const itemFilter: Record<string, unknown> = {};
  if (q) itemFilter.name = { contains: q, mode: "insensitive" };
  if (category) itemFilter.category = category;
  const where: Record<string, unknown> = { teamId, quantity: { gt: 0 } };
  if (Object.keys(itemFilter).length > 0) where.item = itemFilter;
  return prisma.stock.findMany({
    where: where as any,
    include: { item: true } as any,
    orderBy: { item: { name: "asc" } } as any,
    take: limit,
  });
}

const TEAM_USAGE_INCLUDE = {
  item: true,
  user: { select: { id: true, name: true, email: true } },
  team: {
    select: {
      users: {
        where: { isTeamLeader: true },
        select: { id: true, name: true, email: true },
        take: 1,
      },
    },
  },
};

function toUsageEntry(log: any) {
  return {
    ...log,
    teamLeader: log.team?.users?.[0] ?? null,
  };
}

export async function getTeamUsageHistory(teamId: string) {
  const logs = await prisma.usageLog.findMany({
    where: { teamId } as any,
    include: TEAM_USAGE_INCLUDE as any,
    orderBy: { createdAt: "desc" } as any,
    take: 100,
  });
  return logs.map(toUsageEntry);
}

export async function getTeamUsageHistoryPaged(teamId: string, page: number, pageSize: number) {
  const where = { teamId };
  const [logs, total] = await Promise.all([
    prisma.usageLog.findMany({
      where: where as any,
      include: TEAM_USAGE_INCLUDE as any,
      orderBy: { createdAt: "desc" } as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.usageLog.count({ where: where as any }),
  ]);
  return { data: logs.map(toUsageEntry), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
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

// ─── Export (date-range, no pagination cap) ───────────────────────────────────

export async function getTeamUsageByDateRange(teamId: string, from: Date, to: Date) {
  const logs = await prisma.usageLog.findMany({
    where: { teamId, createdAt: { gte: from, lte: to } } as any,
    include: TEAM_USAGE_INCLUDE as any,
    orderBy: { createdAt: "desc" } as any,
  });
  return logs.map(toUsageEntry);
}

export async function getTeamDistributionByDateRange(teamId: string, from: Date, to: Date) {
  return prisma.stockTransaction.findMany({
    where: { teamId, type: "GIVE", createdAt: { gte: from, lte: to } } as any,
    include: { item: true } as any,
    orderBy: { createdAt: "desc" } as any,
  });
}
