import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { MenuItemCard } from "@/components/menu-item-card";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeader } from "@/components/ui/section";
import { getMenu } from "@/lib/queries";
import { resolveLocale } from "@/i18n/routing";
import { localeMetadata } from "@/lib/seo";

/** 1 = segunda … 5 = sexta — indexado por `weekday - 1` para o rótulo traduzido. */
const weekdayKeys = ["weekday1", "weekday2", "weekday3", "weekday4", "weekday5"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "services" });
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
  const t = await getTranslations("services");
  const categories = await getMenu(locale);

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
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
                  <div className="flex h-full flex-col gap-2">
                    {item.weekday !== null ? (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                        <span className="sr-only">{t("weekOfTitle")}: </span>
                        {t(weekdayKeys[item.weekday - 1])}
                      </span>
                    ) : null}
                    <MenuItemCard item={item} />
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>
        ))
      )}
    </>
  );
}
