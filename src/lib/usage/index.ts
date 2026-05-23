import { prisma } from "../prisma";
import type { UsageRecord } from "../../types/usage";

type CreateUsageData = {
  itemId: string;
  teamId: string;
  quantity: number;
  purpose: string;
  location?: string;
};

const USAGE_INCLUDE = {
  item: { select: { id: true, name: true, unit: true } },
  team: { select: { id: true, name: true } },
  user: { select: { id: true, name: true, email: true } },
};

function toRecord(log: any): UsageRecord {
  return {
    id: log.id,
    teamId: log.teamId,
    team: log.team,
    itemId: log.itemId,
    item: log.item,
    quantity: log.quantity,
    purpose: log.purpose,
    location: log.location ?? null,
    user: log.user ?? null,
    createdAt:
      log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt,
  };
}

// ─── Stock check (exposed for validation before the transaction) ──────────────

export async function applyUsageToStock(itemId: string, teamId: string) {
  return prisma.stock.findUnique({
    where: { itemId_teamId: { itemId, teamId } } as any,
    select: { quantity: true },
  });
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getUsageByTeam(teamId: string): Promise<UsageRecord[]> {
  const logs = await prisma.usageLog.findMany({
    where: { teamId } as any,
    include: USAGE_INCLUDE as any,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return logs.map(toRecord);
}

export async function getUsageByTeamPaged(teamId: string, page: number, pageSize: number) {
  const where = { teamId };
  const [logs, total] = await Promise.all([
    prisma.usageLog.findMany({
      where: where as any,
      include: USAGE_INCLUDE as any,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.usageLog.count({ where: where as any }),
  ]);
  return { data: logs.map(toRecord), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getAllUsage(): Promise<UsageRecord[]> {
  const logs = await prisma.usageLog.findMany({
    include: USAGE_INCLUDE as any,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return logs.map(toRecord);
}

export async function getAllUsagePaged(page: number, pageSize: number) {
  const [logs, total] = await Promise.all([
    prisma.usageLog.findMany({
      include: USAGE_INCLUDE as any,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.usageLog.count(),
  ]);
  return { data: logs.map(toRecord), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getUsageById(id: string): Promise<UsageRecord | null> {
  const log = await prisma.usageLog.findUnique({
    where: { id },
    include: USAGE_INCLUDE as any,
  });
  return log ? toRecord(log) : null;
}

// ─── Write (atomic: stock decrement + USE transaction + usage log) ────────────

export async function createUsage(
  data: CreateUsageData,
  userId: string
): Promise<UsageRecord> {
  // Validate stock BEFORE locking rows — gives a clear error before the transaction starts
  const stock = await prisma.stock.findUnique({
    where: { itemId_teamId: { itemId: data.itemId, teamId: data.teamId } } as any,
    select: { quantity: true },
  });

  if (!stock || stock.quantity === 0) throw new Error("NO_STOCK");
  if (stock.quantity < data.quantity) throw new Error("INSUFFICIENT_STOCK");

  const log = await prisma.$transaction(async (tx) => {
    // Decrement stock — using update (not upsert) ensures the row must exist
    await (tx as any).stock.update({
      where: { itemId_teamId: { itemId: data.itemId, teamId: data.teamId } },
      data: { quantity: { decrement: data.quantity } },
    });

    // Immutable USE transaction record (mirrors distribution's GIVE pattern)
    await (tx as any).stockTransaction.create({
      data: {
        itemId: data.itemId,
        teamId: data.teamId,
        type: "USE",
        quantity: data.quantity,
        note: data.purpose,
      },
    });

    // Business-layer usage log
    return (tx as any).usageLog.create({
      data: {
        itemId: data.itemId,
        teamId: data.teamId,
        userId,
        quantity: data.quantity,
        purpose: data.purpose,
        location: data.location ?? null,
      },
      include: USAGE_INCLUDE,
    });
  });

  return toRecord(log);
}
