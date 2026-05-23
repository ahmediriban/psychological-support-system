import { z } from "zod";
import { ITEM_CATEGORIES } from "./create-item.schema";

export const bulkImportRowSchema = z.object({
  name: z.string().min(2),
  unit: z.string().optional(),
  quantity: z.number().int().min(1),
  category: z.enum(ITEM_CATEGORIES),
});

export const bulkImportSchema = z.object({
  items: z.array(bulkImportRowSchema).min(1),
});

export type BulkImportRow = z.infer<typeof bulkImportRowSchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
