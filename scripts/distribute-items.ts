/**
 * One-time distribution script.
 * - Non-HYGIENE items: split 50/50 between both teams
 * - HYGIENE items: 100% to team cmpittsn90000f1qxzxw0oejx
 *
 * Run: bun scripts/distribute-items.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const HYGIENE_TEAM_ID = "cmpittsn90000f1qxzxw0oejx";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── 1. Resolve teams ───────────────────────────────────────────────────────
  const allTeams = await (prisma.team as any).findMany({
    select: { id: true, name: true },
  });

  if (allTeams.length !== 2) {
    throw new Error(`Expected exactly 2 teams, found ${allTeams.length}: ${allTeams.map((t: any) => `${t.name}(${t.id})`).join(", ")}`);
  }

  const hygieneTeam = allTeams.find((t: any) => t.id === HYGIENE_TEAM_ID);
  const otherTeam   = allTeams.find((t: any) => t.id !== HYGIENE_TEAM_ID);

  if (!hygieneTeam) throw new Error(`Hygiene team ${HYGIENE_TEAM_ID} not found in DB`);

  console.log(`Teams: "${hygieneTeam.name}" (hygiene) | "${otherTeam.name}" (other)`);

  // ── 2. Resolve admin user for audit logs ───────────────────────────────────
  const admin = await (prisma.user as any).findFirst({
    where: { role: "ADMIN" },
    select: { id: true, name: true },
  });
  if (!admin) throw new Error("No ADMIN user found");
  console.log(`Using admin: ${admin.name ?? admin.id}`);

  // ── 3. Fetch all items with available stock ────────────────────────────────
  const items = await (prisma.item as any).findMany({
    where: { totalQuantity: { gt: 0 } },
    select: { id: true, name: true, unit: true, category: true, totalQuantity: true },
  });

  console.log(`\nFound ${items.length} items with available stock\n`);

  let distributed = 0;
  let skipped = 0;

  for (const item of items) {
    const qty: number = item.totalQuantity;

    let entries: Array<{ teamId: string; teamName: string; quantity: number }> = [];

    if (item.category === "HYGIENE") {
      // All to hygiene team
      entries = [{ teamId: HYGIENE_TEAM_ID, teamName: hygieneTeam.name, quantity: qty }];
    } else {
      // 50/50 split — remainder goes to hygiene team (first team)
      const half = Math.floor(qty / 2);
      const remainder = qty - half;
      entries = [
        { teamId: hygieneTeam.id, teamName: hygieneTeam.name, quantity: remainder },
        { teamId: otherTeam.id,   teamName: otherTeam.name,   quantity: half },
      ];
    }

    // Remove zero-quantity entries
    const validEntries = entries.filter((e) => e.quantity > 0);
    if (validEntries.length === 0) { skipped++; continue; }

    const totalDistributed = validEntries.reduce((s, e) => s + e.quantity, 0);

    const meta = {
      itemId:        item.id,
      itemName:      item.name,
      itemUnit:      item.unit ?? null,
      itemCategory:  item.category,
      teams:         validEntries.map((e) => ({ teamId: e.teamId, teamName: e.teamName, quantity: e.quantity })),
      totalQuantity: totalDistributed,
      note:          "Bulk initial distribution",
    };

    await prisma.$transaction(async (tx: any) => {
      // Upsert stock + create transaction for each team
      await Promise.all(
        validEntries.map((e) =>
          Promise.all([
            tx.stock.upsert({
              where:  { itemId_teamId: { itemId: item.id, teamId: e.teamId } },
              create: { itemId: item.id, teamId: e.teamId, quantity: e.quantity },
              update: { quantity: { increment: e.quantity } },
            }),
            tx.stockTransaction.create({
              data: {
                itemId:   item.id,
                teamId:   e.teamId,
                type:     "GIVE",
                quantity: e.quantity,
                note:     "Bulk initial distribution",
              },
            }),
          ])
        )
      );

      // Decrement item available quantity
      await tx.item.update({
        where: { id: item.id },
        data:  { totalQuantity: { decrement: totalDistributed } },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId:   admin.id,
          action:   "DISTRIBUTION",
          entity:   "StockTransaction",
          metadata: meta,
        },
      });
    });

    const summary = validEntries.map((e) => `${e.teamName}: ${e.quantity}`).join(" | ");
    console.log(`✓ ${item.name.padEnd(40)} [${item.category}]  ${summary}`);
    distributed++;
  }

  console.log(`\nDone. Distributed: ${distributed}, Skipped (zero qty): ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
