import { z } from "zod";
import { ITEM_CATEGORIES } from "./create-item.schema";

export const updateItemSchema = z.object({
  name: z.string().min(2).optional(),
  unit: z.string().nullable().optional(),
  category: z.enum(ITEM_CATEGORIES).optional(),
  totalQuantity: z.number().int().min(0).optional(),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
