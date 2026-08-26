# Architecture

How the n8x system fits together. For coding conventions see
[`AGENTS.md`](../AGENTS.md); for operations see [`RUNBOOK.md`](RUNBOOK.md).

## Big picture

```
                        ┌──────────────────────── Vercel (gru1) ────────────────────────┐
  Visitor ── HTTPS ──▶  │  Next.js 16 (App Router, RSC, Turbopack)                       │
                        │   • (marketing)  public site, SEO, JSON-LD                     │
                        │   • admin        login + session-guarded dashboard             │
                        │   server actions ── Prisma ─┐                                  │
                        └─────────────────────────────┼──────────────────────────────────┘
                                                       │ (pooled, pgbouncer, conn_limit=1)
                          Supabase Postgres  ◀─────────┘   DIRECT_URL (5432) for migrations
                                                       │
        external services (server-side only) ◀─────────┤
          • Evolution API (WhatsApp)  api.metodon8n.com.br  → send / instance mgmt
          • Upstash Redis (Vercel KV) per-IP rate limiting (in-memory fallback)
          • External inbox (link)     metodon8n / Chatwoot / Evo CRM  (no custom chat)
```

- **Hosting:** app on **Vercel** (region `gru1`), DB on **Supabase** (`sa-east-1`),
  domain at Hostinger. The app is **serverless** — no long-lived processes, so
  anything needing a persistent connection (Evolution, an inbox) is external.
- **Cache:** content reads go through the data-access layer with `unstable_cache`
  + tags; admin writes call `updateTag(...)`. On Vercel the cache is distributed,
  so admin edits propagate across instances.

## Layers

| Layer | Where | Notes |
|---|---|---|
| Routing / i18n | `src/proxy.ts`, `src/i18n/*` | next-intl, locale prefix `as-needed`; proxy excludes `/api` |
| Pages (RSC) | `src/app/[locale]/**` | route groups: `(marketing)`, `admin` |
| Server actions | `src/app/actions/**` | the write/command layer (auth-gated for admin) |
| Data access (DAL) | `src/lib/queries.ts`, `src/lib/admin-queries.ts` | cached public reads; admin reads |
| Integrations | `src/lib/evolution.ts`, `rate-limit.ts` | server-only |
| Validation | `src/lib/validations/*` (zod) | shared client form + server boundary |
| Config | `src/config/site.ts` | white-label brand + theme |

## Data model (Prisma — 8 models)

- **Marketing content:** `MenuCategory`, `MenuItem` (os pratos), `GalleryPhoto`,
  `Information`, `Testimonial` — localized JSON fields resolved per request.
  `Testimonial` is a verifiable review (`source`/`sourceUrl` link back to where
  it was posted, e.g. Google) and renders on the page only — it never feeds
  the `Restaurant` JSON-LD (`src/components/json-ld.tsx`): Google forbids
  self-serving `Review`/`aggregateRating` about your own business on your own
  site.
- **Naming convention:** these model names are deliberately English while the
  routes they back are Portuguese — `Information` serves `/novidades`,
  `Testimonial` serves `/admin/testimonials` (label "Depoimentos"),
  `GalleryPhoto`/`MenuCategory`/`MenuItem` serve `/galeria`/`/gastronomia`.
  Public surface and the i18n catalog (`pt.json`) are Portuguese; models,
  file names, functions, cache tags and Storage folders stay English. See
  `AGENTS.md` for the rationale.
- **Leads:** `Lead` (contact), `LeadNotificationConfig` (which instance +
  WhatsApp group receives new-lead notifications).
- **Auth:** `AdminUser` (admin login session).

## Cardápio digital

O QR Code das mesas aponta para **`/cardapio`** — rota curta de propósito:
endereço longo gera um código mais denso e mais difícil de ler com a câmera.

**Vitrine e cardápio são conteúdos diferentes na mesma tabela.** `MenuItem.kind`
separa os três papéis:

| `kind` | Onde aparece | Preço |
| --- | --- | --- |
| `SHOWCASE` | `/gastronomia` — a vitrine institucional, com foto curada | nenhum |
| `BUFFET` | `/cardapio`, na aba do dia | da seção: `R$ 105,90/kg` |
| `PASTA` | `/cardapio`, seção de massas | da seção: `R$ 41,90` |

Sem essa marca as duas páginas mostram a mesma coisa — foi exatamente o que
aconteceu na carga inicial dos pratos, antes do `SHOWCASE` existir.

**Um prato vale para vários dias.** `MenuItem.weekdays` é uma lista (1 = segunda
… 5 = sexta); vazia significa permanente, servido todos os dias. Frango grelhado
sai segunda, quarta e quinta com **um cadastro só** — um por dia significaria
corrigir a mesma descrição três vezes. Os dias são normalizados na validação,
então a página do prato lê "Segunda, Quarta e Quinta", nunca fora de ordem.

**Preço nunca no prato.** Os dois valores vivem em `src/config/menu.ts` e são
sempre atribuídos à seção: o buffet é cobrado pelo peso do que o cliente montar
e a massa tem valor fechado. Um número no card faria o cliente somar pratos.

**A semana inteira vai no HTML; a troca de dia é local.** Quem escaneia o código
na mesa costuma estar num 4G ruim, e uma requisição por aba seria pior que
mandar tudo de uma vez. As grades inativas usam `hidden`, então o navegador nem
baixa as imagens delas. O dia de hoje vem de `useSyncExternalStore`
(`components/cardapio/day-tabs.tsx`) e **não** de um efeito: a página é estática,
e ler o relógio no servidor congelaria "hoje" no momento do build.

**Descrição curta e longa são campos separados** (`description` e
`descriptionLong`): a curta vai no card e a longa na página do prato. Um campo
só obrigaria a truncar texto na grade.

Cobertura em `e2e/cardapio.spec.ts` — preço fora do card, troca de dia com uma
grade por vez, prato multi-dia aparecendo em todos os dias que declara.

## Lead notification

A contact-form submission is persisted first (durable), then best-effort
pushed to a WhatsApp group via `notifyLead()` (`src/lib/lead-notify.ts`):
rate-limit → validate → persist `Lead` → notify. The notify step runs in
`next/server`'s `after()`, so a slow/failing WhatsApp send never delays or
fails the visitor's submission. `LeadNotificationConfig` holds the target
instance and group; the admin can also forward a lead manually.

## Key decisions

Recorded as ADRs in [`docs/adr/`](adr/): Evolution vs Cloud API, Upstash for
rate limiting, selectable WhatsApp instance, CSP deferred, external inbox
instead of a custom one.
