type Role = "ADMIN" | "SUPERVISOR" | "USER"

interface SessionUser {
  id: string
  email: string
  role: Role
  teamId?: string | null
}

export function requireRole(user: SessionUser, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: requires one of [${roles.join(", ")}]`)
  }
}

export function requireAdmin(user: SessionUser) {
  requireRole(user, ["ADMIN"])
}

export function requireSupervisor(user: SessionUser) {
  requireRole(user, ["ADMIN", "SUPERVISOR"])
}

export function canAccessTeam(user: SessionUser, teamId: string): boolean {
  if (user.role === "ADMIN") return true
  return user.teamId === teamId
}

export function requireTeamAccess(user: SessionUser, teamId: string) {
  if (!canAccessTeam(user, teamId)) {
    throw new Error(`Forbidden: no access to team ${teamId}`)
  }
}
