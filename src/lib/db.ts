import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const connectionString = process.env.DATABASE_URL

let prismaInstance: PrismaClient

if (connectionString) {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prismaInstance = new PrismaClient({ adapter })
} else {
  prismaInstance = new PrismaClient()
}

export const prisma = globalForPrisma.prisma || prismaInstance

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
