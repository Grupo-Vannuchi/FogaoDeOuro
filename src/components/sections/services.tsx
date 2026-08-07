import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ServiceCard } from "@/components/service-card";
import { buttonVariants } from "@/components/ui/button";
import { getServices } from "@/lib/queries";
import type { Locale } from "@/i18n/routing";

export async function Services({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.services");
  const tc = await getTranslations("common");
  const services = await getServices(locale, { featuredOnly: true, take: 8 });

  if (services.length === 0) return null;

  return (
    <Section id="services" className="bg-muted/30">
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
        {services.map((service, i) => (
          <Reveal as="li" key={service.id} delay={(i % 3) * 90} className="h-full">
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
