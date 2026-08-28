import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { MenuItemCard } from "@/components/menu-item-card";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeader } from "@/components/ui/section";
import { getMenu } from "@/lib/queries";
import { resolveLocale } from "@/i18n/routing";
import { localeMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "gastronomia" });
  return {
    title: t("title"),
    description: t("subtitle"),
    ...localeMetadata(locale, "/gastronomia"),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("gastronomia");
  const categories = await getMenu(locale);

  return (
    <>
      {/* A foto do buffet no cabeçalho: a página fala de comida, e a faixa
          era só texto sobre fundo liso. */}
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        image="/ambiente/buffet.webp"
        imageAlt={t("headerAlt")}
      />

      {/* Ponte para o cardápio digital — a mesma página do QR Code das mesas.
          Fica no topo porque quem abre "Nossa Gastronomia" procurando o que é
          servido hoje deve chegar lá num toque, sem rolar as categorias. */}
      <Section className="pb-0 sm:pb-0">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-bold tracking-tight">
              {t("menuCtaTitle")}
            </h2>
            <p className="mt-1 text-pretty text-muted-foreground">
              {t("menuCtaText")}
            </p>
          </div>
          <Link
            href="/cardapio"
            className={buttonVariants({ size: "lg", className: "shrink-0" })}
          >
            {t("menuCtaButton")}
          </Link>
        </div>
      </Section>

      {categories.length === 0 ? (
        <Section>
          <p className="text-center text-muted-foreground">{t("empty")}</p>
        </Section>
      ) : (
        categories.map((category) => (
          <Section key={category.id} id={category.slug}>
            <SectionHeader
              title={category.name}
              subtitle={category.description}
              align="left"
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item, i) => (
                <Reveal key={item.id} delay={(i % 3) * 90} className="h-full">
                  <MenuItemCard item={item} />
                </Reveal>
              ))}
            </div>
          </Section>
        ))
      )}
    </>
  );
}
