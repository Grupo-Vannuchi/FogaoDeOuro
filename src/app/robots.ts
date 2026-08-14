import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { defaultLocale, locales } from "@/i18n/routing";

const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

/**
 * Admin paths to keep out of the index, for every locale. The default locale is
 * served unprefixed ("/admin"), others are prefixed ("/en/admin") — matching the
 * `localePrefix: "as-needed"` routing. Derived from `locales` so adding a locale
 * never silently leaves an admin path crawlable.
 */
const adminPaths = locales.map((locale) =>
  locale === defaultLocale ? "/admin" : `/${locale}/admin`,
);

/**
 * Generative-AI crawlers. We explicitly allow them (minus admin) so the agency's
 * content is eligible for citation in AI answers (GEO/AEO) — an opt-in stance,
 * since some of these honour `Disallow` but not the `*` rule.
 */
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
];

/**
 * Pure-training AI scrapers — they ingest content to train models with no
 * citation or referral traffic back. Blocked entirely: we keep the citation/
 * search bots above open (they send traffic), but opt out of training-only
 * scraping. Note `anthropic-ai` (old training UA) is blocked while `ClaudeBot`
 * (citation) stays allowed; same for `Applebot-Extended` (training) vs the
 * normal Applebot search crawler.
 */
const trainingScrapers = [
  "Bytespider",
  "CCBot",
  "Amazonbot",
  "anthropic-ai",
  "Applebot-Extended",
  "FacebookBot",
];

export default function robots(): MetadataRoute.Robots {
  /**
   * Until the site is explicitly published (`SITE_INDEXABLE=true`), shut every
   * agent out. The site is deployed before it is ready — on a `.vercel.app`
   * host, with `«PENDENTE»` placeholders still rendering in the legal pages —
   * and an index entry under the wrong address takes weeks to remove.
   *
   * No `sitemap` and no `host` here on purpose: advertising a URL list while
   * asking not to be crawled is contradictory, and some crawlers fetch the
   * sitemap regardless of the rules above it.
   */
  if (!env.SITE_INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: adminPaths },
      { userAgent: aiCrawlers, allow: "/", disallow: adminPaths },
      { userAgent: trainingScrapers, disallow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
