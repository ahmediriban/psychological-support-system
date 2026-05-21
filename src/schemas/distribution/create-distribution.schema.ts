import { z } from "zod";

export const distributionTeamEntrySchema = z.object({
  teamId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const createDistributionSchema = z.object({
  itemId: z.string().min(1),
  teams: z.array(distributionTeamEntrySchema).min(1),
  note: z.string().optional(),
});

export type CreateDistributionInput = z.infer<typeof createDistributionSchema>;
