import { z } from "zod";

export const assignTeamSchema = z.object({
  workerId: z.string().min(1),
  teamId: z.string().min(1),
});

export type AssignTeamInput = z.infer<typeof assignTeamSchema>;
