import { z } from "zod";

export const createUsageSchema = z.object({
  itemId: z.string().min(1),
  teamId: z.string().min(1),
  quantity: z.number().int().positive(),
  purpose: z.string().min(3),
  location: z.string().min(2).optional(),
  destroyStock: z.boolean().optional(), // multi-use only: true = decrement stock, false = log only
});

export type CreateUsageInput = z.infer<typeof createUsageSchema>;
