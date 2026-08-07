import { setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AttributionCapture } from "@/components/attribution-capture";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsappButton } from "@/components/layout/whatsapp-button";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/json-ld";
import { getInformations, getProjects, getServices } from "@/lib/queries";
import { resolveLocale } from "@/i18n/routing";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);

  // The gallery is no longer a top-level menu item, so the header only needs
  // the gastronomy children — one query fewer on every marketing page.
  const [services, informations] = await Promise.all([
    getServices(locale),
    getInformations(locale),
  ]);
  const serviceLinks = services.map((s) => ({ slug: s.slug, title: s.title }));
  const informationLinks = informations.map((i) => ({
    slug: i.slug,
    title: i.title,
    icon: i.icon,
  }));

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Header serviceLinks={serviceLinks} informationLinks={informationLinks} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsappButton />
      {/* Public-site analytics only — the admin layout is intentionally excluded
          so internal usage doesn't pollute visitor/CWV stats. */}
      <Analytics />
      <SpeedInsights />
      <AttributionCapture />
    </>
  );
}
