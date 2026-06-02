import { z } from "zod";

export const ITEM_CATEGORIES = ["MATERIALS_STATIONERY", "FIRST_AID", "HYGIENE", "PRINTING", "HOSPITALITY"] as const;
export type ItemCategoryEnum = (typeof ITEM_CATEGORIES)[number];

export const createItemSchema = z.object({
  name: z.string().min(2),
  unit: z.string().optional(),
  category: z.enum(ITEM_CATEGORIES),
  totalQuantity: z.number().int().min(1),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
