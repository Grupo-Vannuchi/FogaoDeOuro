import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, CreditCard, MapPin, Landmark } from "lucide-react";
import { resolveLocale } from "@/i18n/routing";
import { localeMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ReserveButton } from "@/components/reserve-button";
import { fullAddress, siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "reservas" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    ...localeMetadata(locale, "/reservas"),
  };
}

type BestTime = { when: string; what: string; alt: string };

/**
 * Uma foto de ambiente por faixa de horário, casada por índice com `bestTime`
 * no catálogo — mesmo pareamento que o hero faz entre foto e copy. A escolha
 * ilustra o que o texto promete: buffet cheio às 11h, gente se servindo no
 * pico, salão vazio depois das 13h30. Trocar a ordem aqui sem trocar lá
 * desencontra imagem e legenda.
 */
const slotImages = [
  "/ambiente/horario-11h.webp",
  "/ambiente/horario-11h30.webp",
  "/ambiente/horario-13h30.webp",
];

/** One line of the "practical information" list. */
function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-pretty text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

export default async function ReservasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("reservas");

  const bestTime = t.raw("bestTime") as BestTime[];
  const { openingHours, contact } = siteConfig;
  const hours = `${t("hoursTitle")}`;

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* 5.1 — Horários + "melhor momento para você" */}
      <Section>
        {/* O salão antes dos horários: quem abre esta página está decidindo se
            vem, e a foto responde "que lugar é esse?" antes de qualquer texto.
            É a maior imagem da rota, e a primeira — daí o `priority`. */}
        <Image
          src="/ambiente/salao.webp"
          alt={t("salaoAlt")}
          width={1600}
          height={900}
          priority
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="mb-12 aspect-[16/9] w-full rounded-2xl object-cover sm:aspect-[21/9]"
        />
        <SectionHeader
          title={t("hoursTitle")}
          subtitle={t("bestTimeTitle")}
          align="left"
        />
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {bestTime.map((slot, i) => (
            <Reveal
              as="li"
              key={slot.when}
              delay={i * 90}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              {/* 16:9 nos três, para os cards ficarem da mesma altura mesmo
                  com legendas de comprimentos diferentes. */}
              <Image
                src={slotImages[i]}
                alt={slot.alt}
                width={800}
                height={450}
                sizes="(min-width: 640px) 33vw, 100vw"
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="flex flex-col gap-2 p-6">
                <span className="text-xl font-bold text-brand">{slot.when}</span>
                <span className="text-pretty leading-relaxed text-muted-foreground">
                  {slot.what}
                </span>
              </div>
            </Reveal>
          ))}
        </ol>
        <div className="mt-10">
          <ReserveButton size="lg" />
        </div>
      </Section>

      {/* 5.2 — Reservas para grupos e eventos */}
      <Section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {t("groupsTitle")}
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {t("groupsCopy")}
          </p>
          <div className="mt-8 flex justify-center">
            <ReserveButton size="lg" message={t("groupsMessage")} />
          </div>
        </div>
      </Section>

      {/* 5.3 — Informações práticas */}
      <Section>
        <SectionHeader title={t("practicalTitle")} align="left" />
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <Fact icon={Clock} label={t("hoursLabel")} value={hours} />
          <Fact icon={CreditCard} label={t("paymentsLabel")} value={t("payments")} />
          <Fact icon={MapPin} label={t("addressLabel")} value={fullAddress()} />
          <Fact icon={Landmark} label={t("accessLabel")} value={t("access")} />
        </div>
        <p className="sr-only">
          {`${openingHours.opens}–${openingHours.closes} · ${contact.phone}`}
        </p>
      </Section>
    </>
  );
}
