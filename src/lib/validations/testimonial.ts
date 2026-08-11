import { z } from "zod";
import { locales, defaultLocale, type Locale } from "@/i18n/routing";

/**
 * Validation for the admin testimonials editor. A testimonial (customer
 * review) has an author, optional avatar, a 1–5 star rating, a bilingual
 * quote, the source it was published on (e.g. "Google"), an optional link to
 * the review at that source, and the usual order/published flags.
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

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(1).max(120),
  avatarUrl: z.union([url, z.literal("")]),
  rating: z.coerce.number().int().min(1).max(5),
  quote: localizedText(1000),
  source: z.string().trim().min(1).max(60),
  sourceUrl: z.union([url, z.literal("")]),
  order: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
