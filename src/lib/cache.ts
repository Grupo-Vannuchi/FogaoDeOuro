/**
 * Cache tags for on-demand revalidation of CMS-managed public content.
 *
 * Each content type has exactly one tag, shared by every query that reads it
 * (see `@/lib/queries`) and every admin action that mutates it (see
 * `@/app/actions/*`). This is the single source of truth — a write tags-out the
 * data, and Next revalidates every cached page that read it, regardless of path.
 */
export const tags = {
  services: "services",
  informations: "informations",
  projects: "projects",
  testimonials: "testimonials",
  team: "team",
  stats: "stats",
  clients: "clients",
  /** WhatsApp instances fetched from the (slow) Evolution server. */
  whatsappInstances: "whatsapp-instances",
  /** WhatsApp groups of an Evolution instance. */
  whatsappGroups: "whatsapp-groups",
} as const;

/**
 * Safety-net lifetime for cached content (1 day). On-demand `revalidateTag` is
 * the primary refresh mechanism; this only bounds staleness if a tag is ever
 * missed. Long by design — see the CMS guidance in the Next.js caching docs.
 */
export const CONTENT_REVALIDATE_SECONDS = 86400;
