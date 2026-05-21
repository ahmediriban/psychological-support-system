import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(2),
  unit: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
