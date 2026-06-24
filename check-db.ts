import { prisma } from './src/lib/db';

async function main() {
  const count = await prisma.scenario.count();
  const scenarios = await prisma.scenario.findMany({
    select: { title: true }
  });
  console.log('Count:', count);
  console.log('Scenarios:', scenarios.map(s => s.title));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
