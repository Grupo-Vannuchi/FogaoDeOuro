# Contributing

Thanks for working on n8x. This guide is the human-facing companion to
[`AGENTS.md`](AGENTS.md) (which both people and AI agents must follow).

## Setup

```bash
docker compose up -d   # Postgres (container n8x-marketing-db, host port 5433)
npm install
cp .env.example .env    # if needed; a dev .env may already be present
npm run db:restore      # exact snapshot — or db:migrate + db:seed (see SNAPSHOT.md)
npm run dev             # http://localhost:3000  (admin at /admin)
```

Both paths give you the same thing: the schema plus **one admin user and no
content**. The site starts empty and shows its empty-state messages — that is
correct, not a broken setup. Content (cardápio, galeria, avaliações, novidades)
is entered through the admin; nothing seeds it.

## Workflow

1. **Branch:** work on `Development` (or a feature branch off it). `main` is
   production — Vercel deploys from it.
2. **Commit only when asked.** The agreed rule: an agent **asks before
   committing**; the human runs `git push`. Don't push or merge to `main`
   unprompted.
3. **Validate before you call it done:**
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```
   **CI** (GitHub Actions, `.github/workflows/ci.yml`) runs these same gates on
   every PR and push to `Development`/`main` — only merge a PR with a green check.
4. **Migrations:** `npm run db:migrate` (`prisma migrate dev`) **locally only**;
   production runs `prisma migrate deploy` in the Vercel build.

## Commit messages

Conventional Commits: `type(scope): summary`.

- `feat` new capability · `fix` bug · `chore` tooling/config · `refactor`,
  `docs`, `perf`, `style` as usual. Scope is usually `leads`, `admin`, `seo`, …
- When an AI agent helped, end the message with:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  ```
- Keep one logical change per commit. If a change spans features, split it.

## Project board ("Desenvolvimento Vannuchi")

Tasks use the title format `[ÁREA] - verbo de ação + tarefa`:

| ÁREA | Meaning |
|---|---|
| **CRE** | Create something new from scratch |
| **IMP** | Integrate / wire up something that already exists (e.g. an API) |
| **UPD** | Improve / evolve something that exists and works |
| **CRX** | Fix a bug / wrong behavior |
| **RMV** | Remove code / feature / resource |

Also set the **Área** field on the board. New issues should use the
[task template](.github/ISSUE_TEMPLATE/task.md); PRs use the
[PR template](.github/PULL_REQUEST_TEMPLATE.md).

## Conventions cheatsheet

- **i18n:** the site is **Portuguese-only**; every UI string goes in
  `src/messages/pt.json`. There is no `en.json`.
- **Validation:** `zod` schemas in `src/lib/validations/*`, reused on client + server.
- **Data:** read through `src/lib/queries.ts` (cached) / `admin-queries.ts`; write
  through server actions that call `updateTag(...)`.
- **Secrets / security / Prisma / React rules:** see [`AGENTS.md`](AGENTS.md).
- **Operations** (Google, WhatsApp, env, deploy): see [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

## Documentation map

- [`README.md`](README.md) — overview, stack, customization.
- [`AGENTS.md`](AGENTS.md) — conventions & rules (read before coding).
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the system fits together.
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — operations & integrations.
- [`docs/adr/`](docs/adr/) — architecture decision records.
- [`docs/TESTING.md`](docs/TESTING.md) — testing strategy & rollout plan.
- [`SECURITY.md`](SECURITY.md) — security policy & checklist.
- [`SNAPSHOT.md`](SNAPSHOT.md) — restore/snapshot & first production deploy.
