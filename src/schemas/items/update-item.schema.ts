import { z } from "zod";
import { ITEM_CATEGORIES, USAGE_TYPES } from "./create-item.schema";

export const updateItemSchema = z.object({
  name: z.string().min(2).optional(),
  unit: z.string().nullable().optional(),
  category: z.enum(ITEM_CATEGORIES).optional(),
  usageType: z.enum(USAGE_TYPES).optional(),
  totalQuantity: z.number().int().min(0).optional(),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
