const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result1 = await prisma.commit.deleteMany({
    where: { message: { startsWith: 'Merged in ' } }
  });
  const result2 = await prisma.commit.deleteMany({
    where: { message: { startsWith: 'Merge ' } }
  });
  console.log('Deleted ' + (result1.count + result2.count) + ' merge commits.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
