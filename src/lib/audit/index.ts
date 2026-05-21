import { prisma } from "../prisma"

export async function logAudit(data: {
  userId: string
  action: string
  entity: string
  entityId?: string
  metadata?: Record<string, unknown>
}) {
  return prisma.auditLog.create({ data: data as any })
}

export async function getAuditLogs(limit = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" } as any,
    take: limit,
    include: { user: true } as any,
  })
}

export async function getUserAuditLogs(userId: string) {
  return prisma.auditLog.findMany({
    where: { userId } as any,
    orderBy: { createdAt: "desc" } as any,
  })
}

export async function getEntityAuditLogs(entity: string, entityId?: string) {
  return prisma.auditLog.findMany({
    where: { entity, ...(entityId ? { entityId } : {}) } as any,
    orderBy: { createdAt: "desc" } as any,
  })
}

export async function auditAction(params: {
  userId: string
  action: string
  entity: string
  entityId?: string
  metadata?: Record<string, unknown>
}) {
  return logAudit(params)
}
