# Runbook (operations)

Operational, manual-step playbooks for the integrations that keep this system
running. For local restore/snapshot see [`../SNAPSHOT.md`](../SNAPSHOT.md); for
the production deploy basics see SNAPSHOT.md too.

> ⚠️ Secrets (DB password, API keys, tokens) live in Vercel env vars and the
> local `.env`. Never paste them into commits, chats or screenshots.

## Environment variables

| Var | Where | Notes |
|---|---|---|
| `DATABASE_URL` | Vercel + local | Supabase **pooled** (6543) `?pgbouncer=true`. Mark **Sensitive** on Vercel. ⚠️ Do **not** add `connection_limit=1` — PgBouncer already pools, and `=1` breaks the build's concurrent prerender (`P2024`). |
| `DIRECT_URL` | Vercel + local | Supabase **session pooler** (5432), migrations only. |
| `SESSION_SECRET` | Vercel + local | JWT session signing. |
| `NEXT_PUBLIC_SITE_URL` | Vercel + local | Inlined at build — set before the first build. |
| `EVOLUTION_BASE_URL` / `EVOLUTION_API_KEY` | server | Evolution server + global key. |
| `EVOLUTION_INSTANCE` | server | Default WhatsApp instance (per-funnel override wins). |
| `WHATSAPP_INBOX_URL` | server | External conversation inbox link (metodon8n / Chatwoot). |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Vercel (Upstash) | Rate-limit store. Absent locally → in-memory fallback. |

**Editing a Sensitive var on Vercel:** the value is write-only — you must re-paste
the whole value (it can't be partially edited). Then **Redeploy**.

## Google Calendar — removido

A integração existia apenas para os endings do tipo MEETING dos funis e saiu
junto com eles em agosto de 2026. Não há mais OAuth para reconectar, nem
`GOOGLE_*` para configurar na Vercel.

## WhatsApp (Evolution) instances

Admin → `Funis → Instâncias WhatsApp` (`/admin/funnels/whatsapp`):

- **Create** an instance → scan the **QR** with WhatsApp → it polls until
  connected (`open`).
- **Reconnect / Logout / Delete** per instance.
- Each funnel picks its instance in the editor (empty = default `EVOLUTION_INSTANCE`).
- **Conversations** are not rebuilt here — the "Conversas" button opens the
  external inbox (`WHATSAPP_INBOX_URL`). See ADR-0005.

> Instance management requires the **global** Evolution API key. With an
> instance-scoped key, `fetchInstances`/`create` may be forbidden.

## Rate limiting (Upstash / Vercel KV)

- Provision: Vercel → project → **Storage → Create Database → Upstash (Redis)**,
  connect to the project with prefix `KV` (creates `KV_REST_API_URL/TOKEN`).
  Keep **Sensitive** on; don't enable the Development environment (Sensitive vars
  can't be pulled locally — local uses the in-memory fallback).
- Limits (per IP, sliding window): `submitFunnel` 5/min, `getFunnelSlots` 20/min.
  Adjust in `src/lib/rate-limit.ts` call sites. The limiter **fails open**.

## Deploy

1. Merge `Development → main`. Vercel builds from `main` (region `gru1`):
   `prisma migrate deploy && next build` (see `vercel.json`). Migrations apply
   automatically — author them locally with `prisma migrate dev` first.
2. Verify the new env vars exist before the build needs them.
3. Post-deploy: check the security response headers in DevTools → Network
   (`strict-transport-security`, `x-frame-options`, …) on a real (HTTPS) page.

## Local development

```bash
docker compose up -d   # Postgres (container n8x-marketing-db, host port 5433)
npm install
npm run db:restore     # exact snapshot, OR db:migrate + seeds (see SNAPSHOT.md)
npm run dev            # http://localhost:3000
```

Set the official admin: `ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:set-admin`.

## CSP (pending)

Content-Security-Policy is **not** set yet. Adding it requires a nonce middleware
(inline JSON-LD + Next hydration scripts) and per-page testing — treat as its own
task. See ADR-0004 and `security-review`.
