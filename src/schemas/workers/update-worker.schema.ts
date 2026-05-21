import { z } from "zod";

export const updateWorkerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  teamId: z.string().nullable().optional(),
});

export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;
