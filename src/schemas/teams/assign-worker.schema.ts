import { z } from "zod";

export const assignWorkerSchema = z.object({
  teamId: z.string().min(1),
  userId: z.string().min(1),
});

export type AssignWorkerInput = z.infer<typeof assignWorkerSchema>;
