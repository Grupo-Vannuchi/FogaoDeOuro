import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Scale, UtensilsCrossed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { ReserveButton } from "@/components/reserve-button";
import { getDishBySlug } from "@/lib/queries";
import { formatBRL, menuPricing } from "@/config/menu";
import { resolveLocale } from "@/i18n/routing";
import { localeMetadata } from "@/lib/seo";

type Params = { locale: string; slug: string };

/**
 * Os slugs não são prerenderizados: são dezenas, mudam sempre que o restaurante
 * mexe no cardápio, e a página só é aberta por quem tocou num card. Mesma
 * decisão já tomada em `/novidades/[slug]`.
 */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  const dish = await getDishBySlug(slug, locale);
  if (!dish) return {};

  return {
    title: dish.name,
    description: dish.description || dish.descriptionLong,
    ...localeMetadata(locale, `/cardapio/${slug}`),
  };
}

export default async function DishPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  setRequestLocale(locale);

  const dish = await getDishBySlug(slug, locale);
  if (!dish) notFound();

  const t = await getTranslations("cardapio");

  const isBuffet = dish.kind === "BUFFET";
  const priceLabel = isBuffet ? t("buffetLabel") : t("pastaLabel");
  const priceValue = isBuffet
    ? `${formatBRL(menuPricing.buffetPerKg)}/kg`
    : formatBRL(menuPricing.pasta);
  const PriceIcon = isBuffet ? Scale : UtensilsCrossed;

  const days =
    dish.weekdays.length > 0
      ? dish.weekdays.map((d) => t(`weekday${d}` as "weekday1")).join(", ")
      : null;

  return (
    <Container className="py-12 sm:py-16">
      <Link
        href="/cardapio"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("backToMenu")}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        <div className="min-w-0">
          {dish.image ? (
            <Image
              src={dish.image}
              alt={t("dishImageAlt", { name: dish.name })}
              width={1200}
              height={800}
              priority
              sizes="(min-width: 1024px) 700px, 100vw"
              className="aspect-[3/2] w-full rounded-2xl object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex aspect-[3/2] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-brand/10 text-brand"
            >
              <UtensilsCrossed className="size-10" />
              <span className="text-sm font-medium">{t("noPhoto")}</span>
            </div>
          )}

          <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-brand">
            {dish.category.name}
          </p>
          <h1 className="mt-2 text-balance font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            {dish.name}
          </h1>

          {/* A longa é a da página; sem ela, a curta do card serve. */}
          {dish.descriptionLong || dish.description ? (
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              {dish.descriptionLong || dish.description}
            </p>
          ) : null}

          {dish.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {dish.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          {/* O preço é da seção, nunca do prato: o buffet vai pelo peso do que
              o cliente montar, e a massa tem valor fechado. */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
              <PriceIcon className="size-5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {priceLabel}
            </p>
            <p className="font-serif text-2xl font-bold tabular-nums text-brand">
              {priceValue}
            </p>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              {isBuffet ? t("buffetNote") : t("pastaNote")}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">
              {days ? t("availableOn") : t("availableEveryday")}
            </p>
            {days ? (
              <p className="mt-1 text-pretty font-medium">{days}</p>
            ) : null}
          </div>

          <ReserveButton size="lg" />
        </aside>
      </div>
    </Container>
  );
}
