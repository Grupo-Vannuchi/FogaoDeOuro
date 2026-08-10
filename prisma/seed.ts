import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildInformations } from "./seed-informations";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, name: "Admin", passwordHash, role: "ADMIN" },
  });
  console.log(`✓ Admin user ready: ${email}`);
}

async function main() {
  await seedAdmin();

  // The marketing "Informações" catalog. No demo Services/Projects/Clients/
  // Testimonials/Team/Stats are seeded — those are managed entirely via the
  // admin CMS.
  const informations = buildInformations();
  for (const i of informations) {
    await prisma.information.upsert({
      where: { slug: i.slug },
      update: i,
      create: i,
    });
  }
  console.log(`✓ ${informations.length} informations`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
