import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(2),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
