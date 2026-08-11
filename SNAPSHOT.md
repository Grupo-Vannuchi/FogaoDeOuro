# System snapshot — restore / "initiate the system"

This repo has a saved restore point: the committed code **plus** an exact database
dump at [`prisma/backups/snapshot.sql`](prisma/backups/snapshot.sql).

Snapshot contents (data): 1 admin user, **150 informations**, **8 services**,
**10 portfolio projects** and **13 clients** — all with **real cover/logo images**
(Google Drive `lh3.googleusercontent.com` URLs set via the admin). No
testimonials/team/stats.

Git tag for this exact state: **`snapshot-2026-06-09`** (moves to the latest save).

> ⚠️ **This dump is outdated.** `prisma/backups/snapshot.sql` predates the
> `MenuCategory`/`MenuItem`/`GalleryPhoto` tables (cardápio and galeria) and
> still contains data for `Service`/`Project`/`Client`/`Stat`/`TeamMember`,
> which no longer exist in the schema. `npm run db:restore` **drops and
> recreates** the database from this file, so restoring today loses the
> cardápio and galeria content. A fresh `npm run db:dump` would fix this, but
> that call belongs to the project owner, not this task.

## Initiate the system (bring it back exactly)

```bash
docker compose up -d          # start Postgres (container n8x-marketing-db, host port 5433)
npm install                   # only if node_modules is missing
npm run db:generate           # generate the Prisma client
npm run db:restore            # load prisma/backups/snapshot.sql (exact data, drops + recreates)
npx prisma migrate deploy     # bring the schema back up to date (cardápio + galeria tables)
npm run dev                   # http://localhost:3000
```

Admin login: `admin@example.com` / `changeme123` at `/admin`.

> Requires the local `.env` with `DATABASE_URL` (git-ignored, stays on the machine).
> To restore onto a *different* machine, recreate `.env` first.

## Rebuild data from seeds instead of the dump (optional)

If you'd rather regenerate the data from code (e.g. fresh DB, no dump):

```bash
npm run db:migrate            # apply schema
npm run db:seed               # admin user + 150 informations
```

There is no seed script for cardápio (`MenuCategory`/`MenuItem`) or galeria
(`GalleryPhoto`) — load that content through the admin after seeding.

## Re-save a new snapshot later

```bash
npm run db:dump               # overwrites prisma/backups/snapshot.sql
git add -A && git commit -m "snapshot: <what changed>"
```

## Production deploy — Supabase (DB) + Vercel (app)

Prisma uses **two** connections: `DATABASE_URL` (runtime) and `DIRECT_URL`
(migrations) — see `.env.example` and `prisma/schema.prisma`.

1. **Supabase**: create the project; from Connect → ORMs → Prisma,
   take the **pooled** URL (port 6543, with `?pgbouncer=true`) for `DATABASE_URL`
   and the **session pooler** URL (port 5432) for `DIRECT_URL`. URL-encode special
   chars in the password (e.g. `@` → `%40`). Region used: `sa-east-1` (São Paulo).
2. **Load data into Supabase** (once), either:
   - exact dump: `psql "<DIRECT_URL>" -f prisma/backups/snapshot.sql`, or
   - from code: `npx prisma migrate deploy` then run the seeders (see above).
3. **Vercel**: import the GitHub repo. Build runs `prisma generate` (postinstall);
   [`vercel.json`](vercel.json) pins the app to the `gru1` (São Paulo) region —
   same as Supabase — and runs `prisma migrate deploy` before `next build`. Set the
   env vars (`DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`)
   in Project Settings → Environment Variables. `NEXT_PUBLIC_SITE_URL` is inlined
   at build time, so set it before the first build.
4. **Domain**: point `n8xmarketing.com.br` (registered at Hostinger) at Vercel —
   add the domain in Vercel Project → Settings → Domains and set the DNS records it
   shows in the Hostinger DNS zone. Update `NEXT_PUBLIC_SITE_URL` to the final URL.

> On Vercel the content cache (`revalidateTag`/`updateTag`) is handled by Vercel's
> distributed cache, so admin edits propagate across all serverless instances — no
> single-instance constraint like a self-hosted Node process would have.
