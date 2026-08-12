import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { MenuItemCard } from "@/components/menu-item-card";
import { buttonVariants } from "@/components/ui/button";
import { getMenu } from "@/lib/queries";
import type { Locale } from "@/i18n/routing";

export async function MenuPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.services");
  const tc = await getTranslations("common");
  const categories = await getMenu(locale);
  const items = categories.flatMap((category) => category.items).slice(0, 8);

  if (items.length === 0) return null;

  return (
    <Section id="gastronomia" className="bg-muted/30">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          align="left"
        />
        <Link
          href="/gastronomia"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {tc("viewAllServices")}
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal as="li" key={item.id} delay={(i % 3) * 90} className="h-full">
            <MenuItemCard item={item} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
