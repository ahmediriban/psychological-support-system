import { prisma } from "../prisma"
import { hashPassword } from "../auth"

type Role = "ADMIN" | "SUPERVISOR" | "USER"

export async function createUser(data: {
  email: string
  name?: string
  password: string
  role?: Role
  teamId?: string
}) {
  const hashed = await hashPassword(data.password)
  return prisma.user.create({
    data: { ...data, password: hashed } as any,
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: Role; teamId?: string | null }
) {
  return prisma.user.update({ where: { id }, data: data as any })
}

export async function assignUserToTeam(userId: string, teamId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { teamId } as any,
  })
}

export async function changeUserRole(userId: string, role: Role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role } as any,
  })
}

export async function listUsers(filters?: { teamId?: string; role?: Role }) {
  return prisma.user.findMany({
    where: filters as any,
    orderBy: { createdAt: "asc" },
  })
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } })
}
