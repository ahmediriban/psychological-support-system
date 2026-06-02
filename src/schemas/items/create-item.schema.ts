import { z } from "zod";

export const ITEM_CATEGORIES = ["MATERIALS_STATIONERY", "FIRST_AID", "HYGIENE", "PRINTING"] as const;
export type ItemCategoryEnum = (typeof ITEM_CATEGORIES)[number];

export const USAGE_TYPES = ["SINGLE_USE", "MULTI_USE"] as const;
export type UsageTypeEnum = (typeof USAGE_TYPES)[number];

export const createItemSchema = z.object({
  name: z.string().min(2),
  unit: z.string().optional(),
  category: z.enum(ITEM_CATEGORIES),
  usageType: z.enum(USAGE_TYPES),
  totalQuantity: z.number().int().min(1),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
