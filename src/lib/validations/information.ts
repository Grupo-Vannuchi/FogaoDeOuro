import { z } from "zod";
import { locales, defaultLocale, type Locale } from "@/i18n/routing";

/**
 * Validation for the admin informations editor. Describes the *stored* shape of
 * an information entry (bilingual JSON maps + scalar columns); the client form
 * collects flatter values and maps them to this shape before submitting, and the
 * server action re-validates with the same schema as a security boundary.
 *
 * Localized fields are built from `locales` so adding a locale needs no change
 * here: the default locale is required, the others may be left blank (the public
 * site falls back to the default locale via `localize`). Mirrors the menu
 * schema — see `src/lib/validations/menu.ts`.
 */

/** `{ pt: string, en: string }` — default locale required, others optional. */
const localizedText = z.object(
  Object.fromEntries(
    locales.map((l) => [
      l,
      l === defaultLocale
        ? z.string().trim().min(1, "Required").max(300)
        : z.string().trim().max(300),
    ]),
  ) as Record<Locale, z.ZodString>,
);

/** `{ pt: string[], en: string[] }` — an ordered list of paragraphs per locale. */
const localizedRichText = z.object(
  Object.fromEntries(
    locales.map((l) => [
      l,
      l === defaultLocale
        ? z.array(z.string().trim().min(1)).min(1, "Add at least one paragraph")
        : z.array(z.string().trim().min(1)),
    ]),
  ) as Record<Locale, z.ZodArray<z.ZodString>>,
);

/** Lowercase, hyphen-separated slug (e.g. "company-history"). */
const slug = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

export const informationSchema = z.object({
  slug,
  icon: z.string().trim().min(1).max(50),
  image: z.string().trim().max(500),
  order: z.coerce.number().int().min(0).max(9999),
  title: localizedText,
  description: localizedText,
  content: localizedRichText,
  featured: z.boolean(),
  published: z.boolean(),
});

export type InformationInput = z.infer<typeof informationSchema>;
