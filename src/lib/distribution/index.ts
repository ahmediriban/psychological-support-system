import { prisma } from "../prisma";
import type { DistributionMeta, DistributionRecord } from "../../types/distribution";

type TeamEntry = { teamId: string; quantity: number };

type CreateDistributionData = {
  itemId: string;
  teams: TeamEntry[];
  note?: string;
};

// ─── Read helpers ─────────────────────────────────────────────────────────────

export async function getDistributions(): Promise<DistributionRecord[]> {
  const logs = await prisma.auditLog.findMany({
    where: { action: "DISTRIBUTION" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return logs.map((log) => ({
    id: log.id,
    createdAt: log.createdAt.toISOString(),
    metadata: log.metadata as unknown as DistributionMeta,
    user: log.user,
  }));
}

export async function getDistributionById(id: string): Promise<DistributionRecord | null> {
  const log = await prisma.auditLog.findFirst({
    where: { id, action: "DISTRIBUTION" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!log) return null;
  return {
    id: log.id,
    createdAt: log.createdAt.toISOString(),
    metadata: log.metadata as unknown as DistributionMeta,
    user: log.user,
  };
}

// ─── Write helpers (called inside transaction) ───────────────────────────────

async function applyDistributionToTeams(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  itemId: string,
  teams: TeamEntry[],
  note?: string
) {
  // All teams are written in parallel — different rows so no deadlock risk
  await Promise.all(
    teams.map((entry) =>
      Promise.all([
        (tx.stock as any).upsert({
          where: { itemId_teamId: { itemId, teamId: entry.teamId } },
          create: { itemId, teamId: entry.teamId, quantity: entry.quantity },
          update: { quantity: { increment: entry.quantity } },
        }),
        (tx.stockTransaction as any).create({
          data: {
            itemId,
            teamId: entry.teamId,
            type: "GIVE",
            quantity: entry.quantity,
            note: note ?? null,
          },
        }),
      ])
    )
  );
}

async function createDistributionLog(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  meta: DistributionMeta,
  createdById: string
) {
  return (tx.auditLog as any).create({
    data: {
      userId: createdById,
      action: "DISTRIBUTION",
      entity: "StockTransaction",
      metadata: meta as any,
    },
  });
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export async function createDistribution(
  data: CreateDistributionData,
  createdById: string
): Promise<DistributionRecord> {
  const [item, teams] = await Promise.all([
    prisma.item.findUnique({
      where: { id: data.itemId },
      select: { id: true, name: true, unit: true, totalQuantity: true },
    }),
    prisma.team.findMany({
      where: { id: { in: data.teams.map((t) => t.teamId) } } as any,
      select: { id: true, name: true },
    }),
  ]);

  if (!item) throw new Error("ITEM_NOT_FOUND");

  const teamMap = new Map(teams.map((t) => [t.id, t.name]));
  const missingTeam = data.teams.find((t) => !teamMap.has(t.teamId));
  if (missingTeam) throw new Error("TEAM_NOT_FOUND");

  const totalQuantity = data.teams.reduce((sum, t) => sum + t.quantity, 0);
  if (totalQuantity > (item as any).totalQuantity) throw new Error("INSUFFICIENT_STOCK");

  const meta: DistributionMeta = {
    itemId: item.id,
    itemName: item.name,
    itemUnit: item.unit ?? null,
    teams: data.teams.map((t) => ({
      teamId: t.teamId,
      teamName: teamMap.get(t.teamId)!,
      quantity: t.quantity,
    })),
    totalQuantity,
    note: data.note,
  };

  const log = await prisma.$transaction(async (tx) => {
    await Promise.all([
      applyDistributionToTeams(tx as any, data.itemId, data.teams, data.note),
      (tx.item as any).update({
        where: { id: data.itemId },
        data: { totalQuantity: { decrement: totalQuantity } },
      }),
    ]);
    return createDistributionLog(tx as any, meta, createdById);
  });

  return {
    id: log.id,
    createdAt: log.createdAt.toISOString(),
    metadata: meta,
    user: { id: createdById, name: null, email: "" },
  };
}
