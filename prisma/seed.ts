import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Creates (or resets) the single admin user. This is the *only* thing this
 * seed does: cardápio, galeria, avaliações and novidades are the
 * restaurant's real content, entered through the admin panel — seeding demo
 * rows for them would mean inventing content on a real client's site.
 *
 * ⚠️ SECURITY: this seed falls back to the password `changeme123` when
 * `SEED_ADMIN_PASSWORD` is not set in the environment — and `npm run
 * db:seed` (`prisma db seed`) is expected to run as part of standing up a
 * new deploy. Set `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD` before seeding
 * a real environment, or rotate the password afterwards with
 * `npm run db:set-admin` (reads `ADMIN_EMAIL` / `ADMIN_PASSWORD`). Shipping
 * with the default password is the most concrete security risk in this
 * project today — do not let it reach a public deploy.
 */
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
