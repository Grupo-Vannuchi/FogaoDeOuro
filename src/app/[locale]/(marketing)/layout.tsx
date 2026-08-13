import { setRequestLocale } from "next-intl/server";
import { AttributionCapture } from "@/components/attribution-capture";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsappButton } from "@/components/layout/whatsapp-button";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/json-ld";
import { getInformations, getMenuCategoryLinks } from "@/lib/queries";
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
  const [categories, informations] = await Promise.all([
    getMenuCategoryLinks(locale),
    getInformations(locale),
  ]);
  const categoryLinks = categories.map((c) => ({ slug: c.slug, title: c.name }));
  const informationLinks = informations.map((i) => ({
    slug: i.slug,
    title: i.title,
    icon: i.icon,
  }));

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Header serviceLinks={categoryLinks} informationLinks={informationLinks} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsappButton />
      {/* Sem Vercel Analytics / Speed Insights: era infraestrutura da agência,
          não do restaurante. Se um dia entrar, o parágrafo correspondente da
          Política de Privacidade (`src/content/legal.ts`) precisa voltar junto —
          declarar a coleta é obrigação de LGPD, não cortesia. */}
      <AttributionCapture />
    </>
  );
}
