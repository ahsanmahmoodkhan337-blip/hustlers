import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
const connectionString = process.env.DATABASE_URL

let prismaInstance: PrismaClient

if (connectionString) {
  console.log('Using PrismaPg adapter');
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prismaInstance = new PrismaClient({ adapter })
} else {
  console.log('Using default PrismaClient');
  prismaInstance = new PrismaClient()
}

export const prisma = globalForPrisma.prisma || prismaInstance

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
