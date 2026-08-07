import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeStyle } from "@/components/theme-style";
import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";
import { baseOpenGraph } from "@/lib/seo";
import { locales, routing, resolveLocale } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
/**
 * Display face for headings — the client's direction asks for "serifada
 * elegante nos títulos + sans limpa no corpo". Self-hosted by `next/font`, so
 * it costs no extra connection and can't shift layout (`display: swap` plus a
 * matched fallback metric are handled by Next).
 */
const playfair = Playfair_Display({
  // Not `--font-serif`: that name is the Tailwind theme token in globals.css,
  // and pointing it at itself would be circular.
  variable: "--font-serif-display",
  subsets: ["latin"],
  display: "swap",
});

/** Pre-render every locale at build time. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: {
      default: t("defaultTitle", { brand: siteConfig.name }),
      template: t("titleTemplate", { brand: siteConfig.name }),
    },
    description: t("description"),
    keywords: t("keywords"),
    applicationName: siteConfig.name,
    // og/twitter title + description are intentionally omitted: Next derives
    // them from each page's `title`/`description`, so every route gets its own
    // social copy instead of the site default. `baseOpenGraph` is the single
    // source for type/siteName/locale + the shared OG image, reused by every
    // page's `localeMetadata` so the shallow metadata merge never drops them.
    openGraph: baseOpenGraph(locale),
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for this locale (next-intl).
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <ThemeStyle />
        {/* Applies a saved theme choice before first paint so the page never
            flashes the wrong palette. No stored choice (or "system") leaves the
            attribute off, so the OS preference wins. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
