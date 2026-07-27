import { setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

  const [projects, services, informations] = await Promise.all([
    getProjects(locale),
    getServices(locale),
    getInformations(locale),
  ]);
  const portfolioLinks = projects.map((p) => ({ slug: p.slug, title: p.title }));
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
      <Header
        portfolioLinks={portfolioLinks}
        serviceLinks={serviceLinks}
        informationLinks={informationLinks}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsappButton />
      {/* Public-site analytics only — the admin layout is intentionally excluded
          so internal usage doesn't pollute visitor/CWV stats. */}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
