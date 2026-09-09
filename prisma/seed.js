const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const nom = process.env.ADMIN_NAME?.trim() || "Administrateur";

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis pour créer un administrateur.",
    );
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD doit contenir au moins 12 caractères.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hashedPassword,
      nom,
    },
  });
  console.log(`Administrateur créé ou déjà présent : ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
