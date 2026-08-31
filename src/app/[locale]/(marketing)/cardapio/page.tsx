import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section, SectionHeader } from "@/components/ui/section";
import { MenuHero } from "@/components/cardapio/menu-hero";
import { DayTabs } from "@/components/cardapio/day-tabs";
import { DishRow } from "@/components/cardapio/dish-row";
import { PastaBuilder } from "@/components/cardapio/pasta-builder";
import { DrinkList } from "@/components/cardapio/drink-list";
import { DessertList } from "@/components/cardapio/dessert-list";
import { PriceCallout } from "@/components/cardapio/price-callout";
import { getBuffetDishes, getPastaDishes } from "@/lib/queries";
import { pastaPhotos, WEEKDAYS, formatBRL, menuPricing } from "@/config/menu";
import { resolveLocale } from "@/i18n/routing";
import { localeMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "cardapio" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    ...localeMetadata(locale, "/cardapio"),
  };
}

export default async function CardapioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("cardapio");

  // Independentes: buscar em sequência só somaria latência.
  const [buffet, pasta] = await Promise.all([
    getBuffetDishes(locale),
    getPastaDishes(locale),
  ]);

  const labels = Object.fromEntries(
    WEEKDAYS.map((d) => [d, t(`weekday${d}` as "weekday1")]),
  );

  /** Um prato sem dias marcados é permanente: sai todos os dias. */
  const dishesOf = (day: number) =>
    buffet.filter((d) => d.weekdays.length === 0 || d.weekdays.includes(day));

  return (
    <>
      <MenuHero />

      {/* Coluna estreita e centralizada: um cardápio é lido de cima a baixo,
          não varrido em grade. `max-w-3xl` mantém a linha na faixa confortável
          de leitura mesmo num monitor largo. */}
      <Section containerClassName="max-w-3xl">
        <SectionHeader title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-10">
          <PriceCallout />
        </div>

        {buffet.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="mt-12">
            <DayTabs
              labels={labels}
              todayLabel={t("today")}
              selectorLabel={t("daySelectorLabel")}
            >
              {WEEKDAYS.map((day) => {
                const dishes = dishesOf(day);
                if (dishes.length === 0) {
                  return (
                    <p key={day} className="text-center text-muted-foreground">
                      {t("emptyDay")}
                    </p>
                  );
                }
                return (
                  <ul
                    key={day}
                    className="overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    {dishes.map((dish) => (
                      <DishRow key={dish.id} dish={dish} />
                    ))}
                  </ul>
                );
              })}
            </DayTabs>
          </div>
        )}
      </Section>

      {/* Massas: seção própria porque o preço é outro. */}
      <Section
        id="massas"
        className="border-t border-border bg-muted/30"
        containerClassName="max-w-3xl"
      >
        {/* O preço vai no próprio título da seção: quem rola até aqui não
            deve precisar voltar ao topo para lembrar quanto custa. */}
        <SectionHeader
          title={`${t("pastaLabel")} — ${formatBRL(menuPricing.pasta)}`}
          subtitle={t("pastaNote")}
          align="left"
        />

        {/* Pratos de massa cadastrados no admin, quando houver. O passo a
            passo abaixo é o serviço da ilha e vem do cardápio impresso. */}
        {pasta.length > 0 ? (
          <ul className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
            {pasta.map((dish) => (
              <DishRow key={dish.id} dish={dish} />
            ))}
          </ul>
        ) : null}

        <PastaBuilder
          photos={pastaPhotos.map((f) => ({
            image: f.photo,
            alt: t("dishImageAlt", { name: f.name }),
          }))}
        />
      </Section>

      {/* Sobremesas: sempre disponíveis, não pertencem a um dia. Entram no
          preço do buffet — são servidas no mesmo balcão —, então a seção não
          repete valor nenhum. */}
      <Section containerClassName="max-w-3xl">
        <SectionHeader
          title={t("dessertsLabel")}
          subtitle={t("dessertsNote")}
          align="left"
        />
        {/* A vitrine abre a seção, como a foto do prato abre as massas: mesma
            faixa 16/9, mesmo canto arredondado. O arquivo já vem cortado
            nessa proporção — deixar o `object-cover` recortar no navegador
            cortava a vitrine pelas pontas. */}
        <Image
          src="/ambiente/sobremesas.webp"
          alt={t("dessertsImageAlt")}
          width={1600}
          height={900}
          loading="lazy"
          sizes="(min-width: 1280px) 768px, 100vw"
          className="mt-10 aspect-[16/9] w-full rounded-2xl object-cover"
        />

        <DessertList />
      </Section>

      {/* Bebidas: a segunda seção com preço por item, junto das proteínas da
          ilha. Fecha a página porque é o que se pede por último. */}
      <Section
        id="bebidas"
        className="border-t border-border bg-muted/30"
        containerClassName="max-w-3xl"
      >
        <SectionHeader
          title={t("drinksLabel")}
          subtitle={t("drinksNote")}
          align="left"
        />
        <DrinkList />
      </Section>
    </>
  );
}
