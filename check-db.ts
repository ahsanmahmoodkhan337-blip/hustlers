import { prisma } from './src/lib/db'

async function main() {
  const scenarios = await prisma.scenario.findMany();
  console.log(JSON.stringify(scenarios, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
