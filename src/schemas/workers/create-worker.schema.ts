import { z } from "zod";

export const createWorkerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  teamId: z.string().optional(),
});

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;
