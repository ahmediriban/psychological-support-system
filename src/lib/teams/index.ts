import { prisma } from "../prisma"

// ─── Basic CRUD ───────────────────────────────────────────────────────────────

export async function createTeam(data: { name: string }) {
  return prisma.team.create({ data: data as any })
}

export async function getTeamById(id: string) {
  return prisma.team.findUnique({ where: { id } })
}

export async function listTeams() {
  return prisma.team.findMany({ orderBy: { name: "asc" } as any })
}

export async function updateTeam(id: string, name: string) {
  return prisma.team.update({ where: { id }, data: { name } as any })
}

export async function deleteTeam(id: string) {
  // Delete all stocks associated with the team
  await prisma.stock.deleteMany({ where: { teamId: id } });

  // Delete all usages associated with the team
  await prisma.usageLog.deleteMany({ where: { teamId: id } });

  // Delete all transactions associated with the team
  await prisma.stockTransaction.deleteMany({ where: { teamId: id } });

  // Finally, delete the team itself
  return prisma.team.delete({ where: { id } });
}

// ─── Teams list with summary (for /teams page) ────────────────────────────────

export async function getTeams() {
  return prisma.team.findMany({
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
  })
}

export async function getTeamUsageHistory(teamId: string) {
  return prisma.usageLog.findMany({
    where: { teamId } as any,
    include: { item: true, user: true } as any,
    orderBy: { createdAt: "desc" } as any,
    take: 100,
  })
}

export async function getTeamDistributionHistory(teamId: string) {
  return prisma.stockTransaction.findMany({
    where: { teamId, type: "GIVE" } as any,
    include: { item: true } as any,
    orderBy: { createdAt: "desc" } as any,
    take: 100,
  })
}
