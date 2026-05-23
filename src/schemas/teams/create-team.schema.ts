import { z } from "zod";
import { ITEM_CATEGORIES } from "../items/create-item.schema";

export const createTeamSchema = z.object({
  name: z.string().min(2),
  categories: z
    .array(z.enum(ITEM_CATEGORIES))
    .min(1, "At least one category required")
    .max(4, "At most 4 categories allowed"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
