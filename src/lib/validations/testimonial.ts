import { z } from "zod";
import { locales, defaultLocale, type Locale } from "@/i18n/routing";

/**
 * Validation for the admin testimonials editor. A testimonial (customer
 * review) has an author, optional avatar, a 1–5 star rating, a bilingual
 * quote, the source it was published on (e.g. "Google"), an optional link to
 * the review at that source — restricted to `http`/`https`, see `linkUrl` —
 * and the usual order/published flags.
 *
 * The client form collects flat string values and maps them to this shape
 * before submitting; the server action re-validates with the same schema as a
 * security boundary.
 */

/** Build a `{ pt, en }` text validator: default locale required, others optional. */
function localizedText(max: number) {
  return z.object(
    Object.fromEntries(
      locales.map((l) => [
        l,
        l === defaultLocale
          ? z.string().trim().min(1, "Required").max(max)
          : z.string().trim().max(max),
      ]),
    ) as Record<Locale, z.ZodString>,
  );
}

const url = z.string().trim().url().max(500);

/**
 * Schemes allowed in a link the public site renders. Zod's `.url()` is a
 * `new URL()` in a try/catch, and `new URL()` happily parses `javascript:`,
 * `data:` and `vbscript:` — so `.url()` alone lets a hostile scheme reach the
 * `href` of the review link in `components/sections/testimonials.tsx`.
 *
 * Defence in depth, not a live hole: only an authenticated admin writes the
 * field. React helps, but only partly — its sanitiser knows `javascript:` and
 * nothing else, so `data:` and `vbscript:` would render untouched. Validation
 * is the layer that should say no to all three, so it says no.
 */
const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:"]);

/** True only for an absolute `http`/`https` URL. Never throws: `new URL()`
 * rejects anything that is not a URL at all, and `.url()` already reported it. */
function isSafeLink(value: string): boolean {
  try {
    return SAFE_LINK_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** `url` plus the scheme restriction. The message is a default, like the
 * others in this file: no admin form uses `zodResolver`, so schema messages
 * never surface — the form folds any rejection into `admin.*.error.invalid`. */
const linkUrl = url.refine(isSafeLink, "URL must use http or https");

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(1).max(120),
  avatarUrl: z.union([url, z.literal("")]),
  rating: z.coerce.number().int().min(1).max(5),
  quote: localizedText(1000),
  source: z.string().trim().min(1).max(60),
  sourceUrl: z.union([linkUrl, z.literal("")]),
  order: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
