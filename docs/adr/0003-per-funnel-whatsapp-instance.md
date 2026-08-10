# 0003 — WhatsApp instance is chosen per funnel

- **Status:** Superseded (2026-08) — the funnels subsystem was removed along
  with `Funnel.whatsappInstance` and `/admin/funnels/whatsapp`. The Evolution
  instance is now chosen once, in the lead-notification config
  (`/admin/leads/whatsapp`), not per funnel.
- **Date:** 2026-06

## Context

Originally a single `EVOLUTION_INSTANCE` env var drove every WhatsApp send. As
funnels grew, different campaigns may want to send from different numbers, and
instances are now created/managed from the admin panel.

## Decision

Add `Funnel.whatsappInstance` (nullable). Each funnel picks its instance in the
editor; empty means **fall back to the default** (`EVOLUTION_INSTANCE`).
`sendText(phone, msg, instance?)` resolves `instance ?? default`. The admin panel
(`/admin/funnels/whatsapp`) lists/creates/connects instances live.

## Consequences

- ✅ Different funnels can send from different numbers; the default still works
  with zero config; nothing breaks for existing funnels.
- The instance dropdown loads **client-side, non-blocking** so a slow Evolution
  server never hangs the funnel editor.
