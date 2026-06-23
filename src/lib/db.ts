import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// Helper to make sure PrismaClient works across hot reloads in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
