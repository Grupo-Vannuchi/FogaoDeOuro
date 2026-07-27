import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { resolveLocale } from "@/i18n/routing";

/** Funnels are unlisted lead-capture pages — never indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Minimal shell for funnel pages: no marketing header/footer/WhatsApp button.
 * Locale + providers come from the root [locale] layout that wraps this group.
 */
export default async function FunnelsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  return (
    <main className="flex min-h-screen flex-col">
      {children}
      <Analytics />
      <SpeedInsights />
    </main>
  );
}
