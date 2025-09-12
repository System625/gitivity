import { PrismaClient } from "../app/generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
    datasources: {
      db: {
        url: process.env.NODE_ENV === "production" 
          ? `${process.env.DATABASE_URL}?connection_limit=10&pool_timeout=20&pgbouncer=true`
          : process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma