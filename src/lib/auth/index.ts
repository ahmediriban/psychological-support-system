import crypto from "crypto"
import { promisify } from "util"
import { auth } from "./config"
import { prisma } from "../prisma"

const scryptAsync = promisify(crypto.scrypt)

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex")
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${buf.toString("hex")}`
}

export async function login(email: string, password: string) {
  return auth.api.signInEmail({
    body: { email, password },
  })
}

export async function logoutUser(): Promise<void> {
  // Session teardown is handled by better-auth on the client: authClient.signOut()
}

// Pass `await headers()` from next/headers here
export async function getCurrentUser(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders })
  return session?.user ?? null
}

export async function requireAuth(requestHeaders: Headers) {
  const user = await getCurrentUser(requestHeaders)
  if (!user) throw new Error("Unauthorized")
  return user
}

// Returns the full DB user (with role) for the current session
export async function getCurrentUserWithRole(requestHeaders: Headers) {
  const sessionUser = await getCurrentUser(requestHeaders)
  if (!sessionUser) return null
  return prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, email: true, name: true, role: true, teamId: true },
  })
}
