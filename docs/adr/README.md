# Architecture Decision Records (ADRs)

Short, dated records of **why** we made a non-obvious technical decision, so we
don't re-litigate them. One file per decision, numbered.

## Index

| # | Decision | Status |
|---|---|---|
| [0001](0001-evolution-vs-cloud-api.md) | WhatsApp gateway: Evolution API (Baileys), not Cloud API (yet) | Accepted |
| [0002](0002-rate-limiting-upstash.md) | Rate limiting via Upstash Redis (Vercel KV) + in-memory fallback | Accepted |
| [0003](0003-per-funnel-whatsapp-instance.md) | WhatsApp instance is chosen per funnel | Superseded |
| [0004](0004-defer-csp.md) | Defer Content-Security-Policy | Accepted |
| [0005](0005-external-inbox.md) | Link an external inbox, don't build a chat | Accepted |

## Template

```md
# NNNN — Title

- **Status:** Proposed | Accepted | Superseded by ADR-XXXX
- **Date:** YYYY-MM-DD

## Context
What forces are at play (constraints, requirements, trade-offs)?

## Decision
What we decided to do.

## Consequences
What becomes easier/harder; follow-ups; how to revisit.
```
