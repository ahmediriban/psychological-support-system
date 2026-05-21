import { z } from "zod";

export const updateItemSchema = z.object({
  name: z.string().min(2).optional(),
  unit: z.string().nullable().optional(),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
