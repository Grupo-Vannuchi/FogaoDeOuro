import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
    // `robots.txt` only *asks* crawlers to stay away; this meta tag is what
    // actually keeps an already-fetched page out of the results. Both are
    // driven by the same switch, which defaults to closed — so the field is
    // added while the site is unpublished and disappears entirely once
    // `SITE_INDEXABLE=true`. Spread, not assigned: the surrounding metadata
    // (title template, description, openGraph) must survive untouched, and an
    // indexable build must emit no robots directive at all.
    ...(env.SITE_INDEXABLE
      ? {}
      : { robots: { index: false, follow: false } as const }),
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

  /*
   * Sem a prop `messages`, o `NextIntlClientProvider` serializa o CATALOGO
   * INTEIRO no payload de toda pagina. A namespace `admin` sao 10.815 bytes —
   * 45% do catalogo — de textos de login, erros do Evolution, confirmacoes de
   * exclusao e dicas de campo do cardapio. Baixados por quem so quer ver o
   * cardapio, e de novo a cada navegacao interna.
   *
   * Nao e problema de seguranca: sao rotulos, nao dados. E peso morto, e num
   * site de restaurante quem paga e o celular de quem esta parado na calcada
   * decidindo onde almocar.
   *
   * O painel recebe o catalogo completo nos proprios provedores dele.
   */
  const mensagensPublicas = Object.fromEntries(
    Object.entries(await getMessages()).filter(([chave]) => chave !== "admin"),
  );

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full`}
    >
      <head>
        <ThemeStyle />
      </head>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={mensagensPublicas}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
