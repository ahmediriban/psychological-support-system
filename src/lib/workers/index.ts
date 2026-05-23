import { auth } from "../auth/config";
import { prisma } from "../prisma";

const WORKER_SELECT = {
  id: true,
  name: true,
  email: true,
  teamId: true,
  createdAt: true,
  updatedAt: true,
  team: { select: { id: true, name: true } },
} as const;

export async function createWorker(
  data: { name: string; email: string; password: string; teamId?: string },
  requestHeaders: Headers
) {
  const created = await auth.api.createUser({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      data: {
        role: "USER",
        teamId: data.teamId ?? null,
      },
    },
    headers: requestHeaders,
  });

  return prisma.user.findUniqueOrThrow({
    where: { id: created.user.id },
    select: WORKER_SELECT,
  });
}

export async function getWorkers() {
  return prisma.user.findMany({
    where: { role: "USER" } as any,
    select: WORKER_SELECT,
    orderBy: { name: "asc" } as any,
  });
}

export async function getWorkerById(id: string) {
  return prisma.user.findFirst({
    where: { id, role: "USER" } as any,
    select: WORKER_SELECT,
  });
}

export async function updateWorker(
  id: string,
  data: { name?: string; email?: string; teamId?: string | null }
) {
  return prisma.user.update({
    where: { id },
    data: data as any,
    select: WORKER_SELECT,
  });
}

export async function deleteWorker(id: string) {
  return prisma.user.delete({ where: { id } });
}

export async function assignWorkerToTeam(workerId: string, teamId: string) {
  return prisma.user.update({
    where: { id: workerId },
    data: { teamId } as any,
    select: WORKER_SELECT,
  });
}
