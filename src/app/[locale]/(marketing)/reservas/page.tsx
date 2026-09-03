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
 * Uma foto por faixa de horário, casada por índice com `bestTime` no catálogo
 * — mesmo pareamento que o hero faz entre foto e copy. Trocar a ordem aqui sem
 * trocar lá desencontra imagem e legenda.
 *
 * A do card das 13h era o salão visto de um ângulo que pegava a porta do
 * banheiro ao fundo — o cliente vetou.
 *
 * A substituta não podia ser outro buffet (o card do meio já é um) nem outro
 * salão: o do topo da página e o do fundo da seção de eventos já ocupam essa
 * família, e uma terceira sala na mesma rolagem lê como repetição. Sobra a
 * carne, que ainda não aparece em lugar nenhum daqui — e a fileira fica prato,
 * buffet, carne, que é também a ordem em que se monta o prato.
 */
const slotImages = [
  "/ambiente/horario-11h.webp",
  "/ambiente/horario-11h30.webp",
  "/ambiente/picanha-na-brasa.webp",
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
      {/* Faixa na cor da marca: esta página é a que fecha a visita — quem
          chega aqui vem reservar —, e o creme de sempre a deixava igual às
          demais. */}
      <PageHeader title={t("title")} subtitle={t("subtitle")} tone="brand" />

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

      {/* 5.2 — Reservas para grupos e eventos.
           A seção fala do salão, então o salão é o fundo — e o fundo precisa
           mostrar MESAS. Já queimamos dois recortes aqui: o do bambu, que sob o
           véu virava uma planta escura à esquerda e nada à direita, e o do
           salão dos fundos, vetado pelo cliente por mostrar a porta do banheiro.
           Este é o salão comprido, com as fileiras de mesas e a prateleira de
           vinhos — o único enquadramento do acervo que sustenta "180 lugares".
           Contraste medido sob o véu: 14,9:1 no título, 10,5:1 no parágrafo, e
           9,7:1 no pior ponto da faixa onde o texto cai. A foto entra por trás
           do conteúdo com `fill`: o `Container` não é posicionado, então ela se
           resolve contra a `<section>`, que ganhou `relative` — e sangra de
           ponta a ponta em vez de respeitar as margens do texto.
           `alt=""` porque é decoração: o texto ao lado já diz "salão de 180
           lugares", e um leitor de tela repetindo isso só atrapalha. */}
      <Section className="relative isolate overflow-hidden border-y border-border">
        <Image
          src="/ambiente/salao-mesas.webp"
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          className="-z-20 object-cover"
        />
        {/* O véu não é estética: sem ele o texto claro cai sobre a parede
            creme da foto e o contraste despenca. O tom é o mesmo dos
            cabeçalhos das outras páginas. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[#171615]/80" />
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("groupsTitle")}
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-white/85">
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
