import { z } from "zod";

export const assignWorkerSchema = z.object({
  teamId: z.string().min(1),
  userIds: z.array(z.string().min(1)).min(1),
  leaderId: z.string().min(1),
}).refine((d) => d.userIds.includes(d.leaderId), {
  message: "Leader must be one of the selected members",
  path: ["leaderId"],
});

export type AssignWorkerInput = z.infer<typeof assignWorkerSchema>;
