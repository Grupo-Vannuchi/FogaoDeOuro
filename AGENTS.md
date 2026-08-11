<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Working in this repo (agents & humans)

**This is the site of the Fogão de Ouro**, a restaurant in the Centro Histórico of
Santos/SP. The repo is a **fork of the N8X Marketing site** (an agency) that was
re-skinned for the restaurant — so anything that still smells like an agency
(portfolio, services-as-offerings, careers) is either already renamed or
on its way out. The rebrand decisions and their rationale live in
[`docs/superpowers/specs/`](docs/superpowers/specs/); read that before undoing
something that looks odd.

Project conventions distilled from real lessons in this codebase and from the
team's coding skills (`prisma-patterns`, `react-patterns`, `react-performance`,
`security-review`, `nextjs-turbopack`). These rules exist because we hit the
bugs they prevent. Follow them.

## Golden rules (read first)

- **Branch:** develop on `Development`. **Ask before committing**; the human
  does the `git push` manually. Don't push or merge to `main` unless asked.
- **Validate every change** before declaring it done:
  `npm run typecheck && npm run lint && npm run build`. Report failures honestly.
- **Never send secrets to the client.** Keys (Evolution, Google, Upstash, DB)
  stay server-side. No `NEXT_PUBLIC_*` for secrets.
- **Portuguese only.** Every UI string goes in `src/messages/pt.json`. There is
  no `en.json` — the restaurant serves the Centro de Santos and has no
  English-speaking audience. Don't reintroduce a second locale casually.
- **Never invent client data.** Razão social, CNPJ, the LGPD officer's e-mail and
  the final domain are still unknown; `src/content/legal.ts` marks them with
  `«PENDENTE: …»` on purpose. Filling those with a plausible guess — or with the
  agency's old values — is a legal problem, not a cosmetic one.
- Use the dedicated tools/skills. When touching DB, React, security or Next.js,
  the matching skill encodes deeper rules — these are the project-specific subset.

## Where things live

```
src/
  app/[locale]/(marketing)/   public site: / · /experiencia · /gastronomia ·
                              /galeria · /reservas · /contato · /informations ·
                              /privacy · /terms
  app/[locale]/admin/         login + (dashboard) session-guarded admin
  app/actions/                server actions (whatsapp, auth, …)
  components/                 ui, sections, admin
  config/site.ts              ⭐ white-label brand + theme + opening hours
  lib/                        env, prisma, queries (DAL), auth, rate-limit, evolution,
                              validations
  messages/                   pt.json (typed catalog)
  proxy.ts                    Next 16 proxy (next-intl locale negotiation; excludes /api)
prisma/                       schema.prisma + migrations + seeds + backups/snapshot.sql
docs/                         ARCHITECTURE, RUNBOOK, ADRs, SEO audit, superpowers/specs
```

**Routes are renamed, and the rename is three coupled edits.** The `NavKey` type
in `config/site.ts`, the `nav` keys in `messages/pt.json` and the folder names
under `(marketing)/` must agree. "Nossa Gastronomia" is backed by
`MenuCategory`/`MenuItem`, and the gallery is backed by `GalleryPhoto`. The
agency-era models (`Service`, `Project`, `Client`, `Stat`, `TeamMember`) and
their admin, DAL and seeds are gone — the admin now has exactly six sections:
Visão geral, Cardápio, Galeria, Novidades, Avaliações and Contatos.

**Reservations go straight to WhatsApp.** There is no booking backend.
`whatsappLink()` returns `null` while no number is configured, and every caller
must handle that — `ReserveButton` degrades to a `tel:` link. Don't "fix" the
null by hardcoding a number.

## Prisma (database) — skill: `prisma-patterns`

- **Serverless connection pool:** in production `DATABASE_URL` uses the Supabase
  pooler (port 6543) with `?pgbouncer=true` — PgBouncer already caps real DB
  connections. **Do not force `connection_limit=1`** on it: it starves the
  build's concurrent prerendering (`P2024` pool timeout across the 400+ static
  pages). `DIRECT_URL` (port 5432) is migrations-only and stays unpooled.
- **Migrations:** `prisma migrate deploy` in CI/prod (the Vercel build runs it);
  `prisma migrate dev` **only** on the local Docker DB (it can reset data).
  Never edit a migration file after it has been applied (checksum break).
- **No external calls inside `$transaction`** (5s timeout) — book meetings / send
  WhatsApp *outside* the transaction. Use the array form for independent ops.
- **Never return raw Prisma rows to the client.** Map to a view-model that omits
  secrets (e.g. `CurrentUser` drops `passwordHash`).
- `updateMany`/`deleteMany` return a **count, not rows**; `@updatedAt` is skipped
  on bulk writes; always pass a `where` to `deleteMany`.

## React / Next.js — skills: `react-patterns`, `react-performance`, `nextjs-turbopack`

- **Render is pure** (React Compiler is on). No `Date.now()`, `Math.random()`,
  `crypto.randomUUID()` or mutation during render — use refs, effects, or event
  handlers. No `setState` during render.
- **Stale closures kill data.** Don't read state you just set in the same handler.
  Compute the new value locally and pass it forward.
- **Kill request waterfalls.** Independent `await`s → `Promise.all`. Check cheap
  sync conditions before awaiting remote data.
- **Don't block a page render on a slow/optional integration.** Load it
  client-side and non-blocking (e.g. the WhatsApp instance manager loads
  instances in an effect, never server-side).
- **Server/client boundary:** keep Prisma, secrets and `server-only` modules on
  the server. `"use client"` only when you need state/effects/handlers.
- **Caching:** read content through the DAL (`src/lib/queries.ts`) with
  `unstable_cache` + `tags`; invalidate with `updateTag(tags.<x>)` on writes.
- **Before coding Next APIs**, read `node_modules/next/dist/docs/` — this is
  Next 16 + Turbopack, not your training data.

## Security — skill: `security-review`

- **Public endpoints** (`submitContactLead`): honeypot + **per-IP rate limit**
  (`lib/rate-limit`, Upstash with in-memory fallback) + `zod` validation as the
  server boundary. (`submitCareerLead` was removed with the careers page — one
  fewer public write endpoint.)
- **Admin** server actions gate on `getCurrentUser()`.
- **Secrets** only in env, read server-side. Never log them; redact in errors.
- **Integration state can go stale** — detect and surface it (the Evolution
  instance connection state feeds the admin WhatsApp panel). Never fail
  silently in a way that mimics a different outcome.
- **Headers** are set in `next.config.ts`. CSP is intentionally **deferred**
  (needs a nonce middleware; would break inline JSON-LD) — see ADR-0004.
- Validate user input with `zod`; rely on Prisma's parameterized queries (no raw
  SQL concatenation).

## i18n

- `next-intl`, **Portuguese only** (`locales = ["pt"]`). Add keys to
  `pt.json`. `LocalizedText` is still a `Record<Locale, string>`, so DB content
  keeps its JSON shape — there is just one key in it now. ICU braces in stored
  copy that should render literally must be escaped: `'{NOME}'`.

## Brand & theme

- **Dark-first.** The dark palette sits on bare `:root` in `theme-style.tsx`;
  light is the variant. `globals.css` mirrors that inversion for the neutral
  tokens — keep the two files agreeing about which theme is the default.
- The four client colours are amber `#E68A08` (brand — the "Ouro"), ember
  `#E04F26` (accent), graphite `#474544` and cream `#EFE9C2`. The **light theme
  darkens the amber to `#8A5206`** because the pure tone over cream is 2.14:1.
  Verify any palette change with
  `node docs/superpowers/specs/2026-08-07-palette-contrast.mjs`.
- Headings are a display serif (Playfair), body is the sans. Set in
  `globals.css` under `@layer base`, scoped to `h1`–`h3`.
- **No prices anywhere** — the client's direction forbids it, on the page *and*
  in structured data (`priceRange` is deliberately absent from the `Restaurant`
  schema, since it would surface in search results).

## Workflow & board

- Conventional commits; end the message with
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` when an agent helped.
- Tasks on the "Desenvolvimento Vannuchi" board use the title format
  `[ÁREA] - verbo + tarefa`, where ÁREA ∈ **CRE** (novo do zero) · **IMP**
  (integrar o que existe) · **UPD** (melhorar o que existe) · **CRX** (corrigir)
  · **RMV** (remover). See [`.github/ISSUE_TEMPLATE/task.md`](.github/ISSUE_TEMPLATE/task.md).

## Operations

Many integrations need manual setup/maintenance (Google reconnect + publish,
WhatsApp QR, Upstash, Vercel env vars). The steps live in
**[`docs/RUNBOOK.md`](docs/RUNBOOK.md)**; restore/snapshot lives in
[`SNAPSHOT.md`](SNAPSHOT.md).
