import { resolveLocale } from "@/i18n/routing";
import { localeMetadata } from "@/lib/seo";
import { richTags } from "@/i18n/rich";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { buttonVariants } from "@/components/ui/button";
import { ReserveButton } from "@/components/reserve-button";
import { PortfolioPreview } from "@/components/sections/portfolio-preview";
import { fillYears, siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    ...localeMetadata(locale, "/experiencia"),
  };
}

/** Brand-checkmarked list used to render the bullet groups on this page. */
function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex flex-col gap-3">
      {items.map((item, i) => (
        <Reveal as="li" key={item} delay={(i % 6) * 60} className="flex gap-3">
          <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Check className="size-4" />
          </span>
          <span className="text-pretty leading-relaxed text-muted-foreground">
            {item}
          </span>
        </Reveal>
      ))}
    </ul>
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tc = await getTranslations("common");

  const practiceItems = t.raw("practice.items") as string[];
  const servicesItems = t.raw("services.items") as string[];
  // A bullet mentions how long the house has been open; `fillYears` resolves it
  // from `foundedYear` so it can't drift out of sync with the rest of the site.
  // Wrapped rather than passed by reference: `.map` would feed the index in as
  // `fillYears`'s second argument.
  const audienceItems = (t.raw("audience.items") as string[]).map((item) =>
    fillYears(item),
  );
  const timingItems = t.raw("timing.items") as string[];
  const contactParagraphs = t.raw("contactCta.paragraphs") as string[];

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle", { foundedYear: siteConfig.foundedYear })}
      />

      <Section>
        <p className="max-w-3xl text-pretty text-xl leading-relaxed">
          {t.rich("lead", richTags)}
        </p>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t("practice.title")}</h2>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {t.rich("practice.intro", richTags)}
            </p>
            <CheckList items={practiceItems} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("services.title")}</h2>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {t.rich("services.intro", richTags)}
            </p>
            <CheckList items={servicesItems} />
          </div>
        </div>
      </Section>

      <Section className="border-y border-border bg-muted/30">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t("audience.title")}</h2>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {t.rich("audience.intro", richTags)}
            </p>
            <CheckList items={audienceItems} />
            <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {t.rich("audience.note", richTags)}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t("timing.title")}</h2>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {t.rich("timing.intro", richTags)}
            </p>
            <CheckList items={timingItems} />
            <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {t.rich("timing.note", richTags)}
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t("whyFullService.title")}
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              {t.rich("whyFullService.p1", richTags)}
            </p>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              {t.rich("whyFullService.p2", richTags)}
            </p>
          </div>
        </div>
      </Section>

      <section className="py-20 sm:py-section">
        <Container>
          <Reveal className="relative overflow-hidden rounded-2xl bg-brand px-6 py-16 text-brand-foreground sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-2xl"
            />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                {t("contactCta.title")}
              </h2>
              <div className="mt-5 flex flex-col gap-3">
                {contactParagraphs.map((p, i) => (
                  <p key={i} className="text-pretty leading-relaxed opacity-90">
                    {p}
                  </p>
                ))}
              </div>
              <p className="mt-6 text-lg font-semibold">
                {t("contactCta.tagline")}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/contato"
                  className={buttonVariants({
                    variant: "accent",
                    size: "lg",
                    className: "group",
                  })}
                >
                  {tc("talkToUs")}
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <ReserveButton
                  variant="outline"
                  size="lg"
                  className="border-white/40 text-brand-foreground hover:bg-white/10"
                  label={tc("reserveTable")}
                />
              </div>
            </div>
          </Reveal>
          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
            {t("disclaimer")}
          </p>
        </Container>
      </section>

      {/* §3.3 do briefing: a galeria do salão vive dentro desta página — não é
          item de menu. O time não aparece: a direção visual do cliente proíbe
          rostos de funcionários e clientes. */}
      <PortfolioPreview locale={locale} />
    </>
  );
}
