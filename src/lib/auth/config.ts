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
  plugins: [admin({ defaultRole: "USER", adminRoles: ["ADMIN"], adminUserIds: ["DdJWsqWdFjNNCxhh6voOCAFpU5jdeCp7"] }), nextCookies()],
})
