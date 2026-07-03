import { PrismaClient } from '@prisma/client'

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_TQ76ivbWHdlq@ep-silent-breeze-atigzgya-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const prisma = new PrismaClient()

async function main() {
  const requests = await prisma.request.findMany({ where: { approved: true }, take: 1 });
  console.log(JSON.stringify(requests, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());