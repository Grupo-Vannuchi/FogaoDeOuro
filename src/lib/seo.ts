import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

/**
 * Absolute URL for a path in a given locale. The default locale is served
 * without a prefix ("/"), other locales are prefixed ("/en") — matching the
 * `localePrefix: "as-needed"` routing config.
 */
export function localizedUrl(locale: string, path = ""): string {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return `${base}${prefix}${path}`;
}

/** hreflang language → URL map for a path across every supported locale. */
export function languageAlternates(path = ""): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, localizedUrl(l, path)]));
}

/**
 * Resolve a stored asset reference (which may be a relative path like
 * `/uploads/x.jpg` or an already-absolute `https://…` URL) to an absolute URL.
 * JSON-LD and social images must be absolute, unlike `next/image` `src` values.
 */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * `alternates` block for a page's `generateMetadata`: a self-referencing
 * canonical for the current locale plus hreflang links for every locale.
 * Pass the page's path without the locale prefix, e.g. `"/experiencia"` (home = "").
 */
export function localeAlternates(locale: Locale, path = "") {
  return {
    canonical: localizedUrl(locale, path),
    languages: languageAlternates(path),
  };
}

/**
 * The shared Open Graph block (type/siteName/locale + the default social image).
 * Single source of truth: the root layout and every page spread this so Next's
 * shallow metadata merge — which makes a page's `openGraph` REPLACE the layout's
 * rather than deep-merge it — never drops the image/type/siteName/locale.
 * `overrides` carries the per-page bits (e.g. `url`, `type: "article"`, a
 * page-specific `images`).
 */
export function baseOpenGraph(
  locale: Locale,
  overrides: Partial<OpenGraph> = {},
): OpenGraph {
  return {
    type: "website",
    siteName: siteConfig.name,
    locale,
    images: [
      {
        url: `${localizedUrl(locale)}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    ...overrides,
  } as OpenGraph;
}

/**
 * The `alternates` + `openGraph` block for a page's `generateMetadata`: a
 * self-referencing canonical for the locale, plus a complete Open Graph object
 * (via `baseOpenGraph`) with the page's own `url`. Spread into the returned
 * metadata: `...localeMetadata(locale, "/experiencia")`. Pass `ogOverrides` for
 * per-page Open Graph (e.g. `{ type: "article" }`).
 */
export function localeMetadata(
  locale: Locale,
  path = "",
  ogOverrides: Partial<OpenGraph> = {},
) {
  return {
    alternates: localeAlternates(locale, path),
    openGraph: baseOpenGraph(locale, {
      url: localizedUrl(locale, path),
      ...ogOverrides,
    }),
  };
}
