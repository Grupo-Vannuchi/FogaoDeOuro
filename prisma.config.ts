import { existsSync } from "node:fs";
import path from "node:path";

import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration. Replaces the `package.json#prisma` block, which is
 * deprecated in Prisma 6 and removed in Prisma 7 — the CLI warned about it on
 * every command, including the `prisma migrate deploy` that runs in the Vercel
 * build.
 *
 * ⚠️ Loading the `.env` by hand is NOT optional, and NOT a stylistic choice.
 * From the moment a Prisma config file exists, the CLI stops reading `.env` on
 * its own: it prints "Prisma config detected, skipping environment variable
 * loading." and moves on. Without the block below, `DATABASE_URL` and
 * `DIRECT_URL` would be undefined for every local `prisma` command —
 * `migrate status`, `generate` (which `postinstall` runs), `db seed`, `studio`.
 *
 * Vercel and GitHub Actions inject those as real environment variables and have
 * no `.env` file at all, so the guard is a no-op there. `process.loadEnvFile`
 * does not overwrite variables already present in the environment, which is the
 * same precedence the Prisma CLI applied before this file existed.
 *
 * `__dirname` (not `process.cwd()`) so the path stays right when the CLI is
 * pointed at this file from elsewhere with `--config`.
 */
const envPath = path.join(__dirname, ".env");

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

export default defineConfig({
  migrations: {
    /**
     * Moved from `package.json#prisma.seed`; the command itself is unchanged.
     * Read the security warning at the top of `prisma/seed.ts` before running
     * it against anything that is not a throwaway database.
     */
    seed: "tsx prisma/seed.ts",
  },
});
