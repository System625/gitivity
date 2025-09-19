import { PrismaClient } from "../app/generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized database connection configuration
function getDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL

  if (process.env.NODE_ENV === "production") {
    // Optimized production settings for Vercel
    const params = new URLSearchParams({
      connection_limit: '5',        // Lower limit for serverless
      pool_timeout: '10',           // Faster timeout
      pgbouncer: 'true',           // Enable connection pooling
      connect_timeout: '10',        // Connection timeout
      statement_timeout: '30000',   // 30 second query timeout
      idle_timeout: '300'           // 5 minute idle timeout
    })

    return `${baseUrl}?${params.toString()}`
  }

  return baseUrl
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "info", "warn"]
      : ["error"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    // Additional optimizations
    errorFormat: "minimal",
    transactionOptions: {
      timeout: 10000, // 10 second transaction timeout
      maxWait: 5000,  // 5 second max wait for transaction
    },
  })

// Connection cleanup for serverless environments
if (process.env.NODE_ENV === "production") {
  // Graceful shutdown
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}