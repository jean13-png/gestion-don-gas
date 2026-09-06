const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('TOSjea13#', 10);
  await prisma.admin.upsert({
    where: { email: 'tossajean13@gmail.com' },
    update: {},
    create: {
      email: 'tossajean13@gmail.com',
      passwordHash: hashedPassword,
      nom: 'TOSSA Jean',
    },
  });
  console.log('Admin seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
