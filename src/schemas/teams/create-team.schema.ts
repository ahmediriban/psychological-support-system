import { z } from "zod";
import { ITEM_CATEGORIES } from "../items/create-item.schema";

export const createTeamSchema = z.object({
  name: z.string().min(2),
  category: z.enum(ITEM_CATEGORIES),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
