import { locales, type Locale } from "@/i18n/routing";
import type { GalleryPhotoInput } from "@/lib/validations/gallery";

/**
 * Ponte entre o formulário da galeria e a forma armazenada (número como texto,
 * mapa localizado). Sem "use client" nem "server-only" — os dois lados importam.
 */

type LocalizedStrings = Record<Locale, string>;

function blankLocalized(): LocalizedStrings {
  return Object.fromEntries(locales.map((l) => [l, ""])) as LocalizedStrings;
}

function readLocalized(value: unknown): LocalizedStrings {
  const obj = (value ?? {}) as Record<string, unknown>;
  return Object.fromEntries(
    locales.map((l) => [l, typeof obj[l] === "string" ? (obj[l] as string) : ""]),
  ) as LocalizedStrings;
}

function trimLocalized(value: LocalizedStrings): LocalizedStrings {
  return Object.fromEntries(
    locales.map((l) => [l, value[l].trim()]),
  ) as LocalizedStrings;
}

export type GalleryPhotoFormValues = {
  image: string;
  caption: LocalizedStrings;
  order: string;
  published: boolean;
};

export function emptyGalleryPhotoForm(): GalleryPhotoFormValues {
  return {
    image: "",
    caption: blankLocalized(),
    order: "0",
    published: true,
  };
}

type GalleryPhotoRow = {
  image: string;
  caption: unknown;
  order: number;
  published: boolean;
};

export function photoToForm(p: GalleryPhotoRow): GalleryPhotoFormValues {
  return {
    image: p.image,
    caption: readLocalized(p.caption),
    order: String(p.order),
    published: p.published,
  };
}

export function photoFormToInput(
  values: GalleryPhotoFormValues,
): GalleryPhotoInput {
  return {
    image: values.image.trim(),
    caption: trimLocalized(values.caption),
    order: Number(values.order),
    published: values.published,
  };
}
