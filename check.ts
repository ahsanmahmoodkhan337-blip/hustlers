import { prisma } from './src/lib/db';
async function main() {
  const count = await prisma.scenario.count();
  console.log('Scenario Count:', count);
  const scenarios = await prisma.scenario.findMany({ select: { title: true } });
  console.log('Titles:', scenarios.map(s => s.title));
}
main().catch(console.error).finally(() => prisma.$disconnect());
