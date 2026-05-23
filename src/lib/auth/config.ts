import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { admin } from "better-auth/plugins"
import { prisma } from "../prisma"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin({ defaultRole: "USER", adminRoles: ["ADMIN"], adminUserIds: ["F1iKZOXBLAHKMmX2NhMKUgkq9Q8VXsAn", "IKTgQR2UMtJ7K6XEk31AEqrBFg3m7oBD"] }), nextCookies()],
})
