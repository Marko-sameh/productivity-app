const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Deleting impacts...");
  await prisma.impact.deleteMany();
  console.log("Deleting deployments...");
  await prisma.deployment.deleteMany();
  console.log("Deleting commits...");
  await prisma.commit.deleteMany();
  console.log("Done!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
