# 0002 — Rate limiting via Upstash Redis (Vercel KV) + in-memory fallback

- **Status:** Accepted
- **Date:** 2026-06

## Context

`submitFunnel` is public and expensive (writes a lead, books a meeting, sends
WhatsApp), so it needs per-IP rate limiting. The app is **serverless** on Vercel:
an in-memory counter lives in one ephemeral instance and resets on cold start, so
it can't enforce a real limit across instances.

## Decision

Use **Upstash Redis** (provisioned through the Vercel Marketplace as "KV",
env `KV_REST_API_URL` / `KV_REST_API_TOKEN`) with `@upstash/ratelimit`
(sliding window). `src/lib/rate-limit.ts` uses Upstash **when configured** and
falls back to an in-memory window otherwise (local dev). The limiter **fails
open** — it never takes the funnel down.

## Consequences

- ✅ Durable, shared across instances; free tier covers the load; zero-config swap
  via env presence.
- ⚠️ The KV vars are **Sensitive** on Vercel and so aren't pulled to local dev →
  local uses the weaker in-memory fallback (acceptable for dev).
- Limits live at the call sites (`submitContactLead` 5/min).
