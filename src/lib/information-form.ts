import { locales, type Locale } from "@/i18n/routing";
import type { InformationInput } from "@/lib/validations/information";

/**
 * Bridges the admin informations form and the stored information shape.
 *
 * The form works with flat, text-friendly values (numbers as strings);
 * `formToInput` maps those to the structured `InformationInput` the server
 * expects, and `informationToForm` does the reverse so the edit form can be
 * pre-filled. Kept free of "use client" / "server-only" so both sides can import
 * it. Mirrors `src/lib/menu-form.ts`.
 */

/** Localized string map, one entry per supported locale. */
type LocalizedStrings = Record<Locale, string>;

export type InformationFormValues = {
  slug: string;
  icon: string;
  image: string;
  order: string;
  featured: boolean;
  published: boolean;
  title: LocalizedStrings;
  description: LocalizedStrings;
  /** One paragraph per line, per locale. */
  content: LocalizedStrings;
};

function blankLocalized(): LocalizedStrings {
  return Object.fromEntries(locales.map((l) => [l, ""])) as LocalizedStrings;
}

function linesToArray(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Read a `LocalizedText` JSON value into a complete per-locale string map. */
function readLocalizedText(value: unknown): LocalizedStrings {
  const obj = (value ?? {}) as Record<string, unknown>;
  return Object.fromEntries(
    locales.map((l) => [l, typeof obj[l] === "string" ? (obj[l] as string) : ""]),
  ) as LocalizedStrings;
}

/** Read a `LocalizedRichText` JSON value into newline-joined paragraphs. */
function readLocalizedRich(value: unknown): LocalizedStrings {
  const obj = (value ?? {}) as Record<string, unknown>;
  return Object.fromEntries(
    locales.map((l) => {
      const arr = Array.isArray(obj[l]) ? (obj[l] as unknown[]) : [];
      return [l, arr.filter((p): p is string => typeof p === "string").join("\n")];
    }),
  ) as LocalizedStrings;
}

function trimLocalized(value: LocalizedStrings): LocalizedStrings {
  return Object.fromEntries(
    locales.map((l) => [l, value[l].trim()]),
  ) as LocalizedStrings;
}

function richFromLocalized(value: LocalizedStrings): Record<Locale, string[]> {
  return Object.fromEntries(
    locales.map((l) => [l, linesToArray(value[l])]),
  ) as Record<Locale, string[]>;
}

/** Blank form, used by the "new information" page. Defaults to published. */
export function emptyInformationForm(): InformationFormValues {
  return {
    slug: "",
    icon: "",
    image: "",
    order: "0",
    featured: false,
    published: true,
    title: blankLocalized(),
    description: blankLocalized(),
    content: blankLocalized(),
  };
}

/** Information row (the bilingual fields arrive as opaque JSON). */
type InformationRow = {
  slug: string;
  icon: string;
  image: string;
  order: number;
  featured: boolean;
  published: boolean;
  title: unknown;
  description: unknown;
  content: unknown;
};

/** Pre-fill the form from a stored information entry (edit page). */
export function informationToForm(information: InformationRow): InformationFormValues {
  return {
    slug: information.slug,
    icon: information.icon,
    image: information.image,
    order: String(information.order),
    featured: information.featured,
    published: information.published,
    title: readLocalizedText(information.title),
    description: readLocalizedText(information.description),
    content: readLocalizedRich(information.content),
  };
}

/** Map flat form values to the structured input the server validates. */
export function formToInput(values: InformationFormValues): InformationInput {
  return {
    slug: values.slug.trim(),
    icon: values.icon.trim(),
    image: values.image.trim(),
    order: Number(values.order),
    featured: values.featured,
    published: values.published,
    title: trimLocalized(values.title),
    description: trimLocalized(values.description),
    content: richFromLocalized(values.content),
  };
}
