import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Wheat } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { MenuHero } from "@/components/cardapio/menu-hero";
import { DayTabs } from "@/components/cardapio/day-tabs";
import { DishRow } from "@/components/cardapio/dish-row";
import { PastaBuilder } from "@/components/cardapio/pasta-builder";
import { DrinkList } from "@/components/cardapio/drink-list";
import { DessertList } from "@/components/cardapio/dessert-list";
import { WineList } from "@/components/cardapio/wine-list";
import { WinePhotos } from "@/components/cardapio/wine-photos";
import { PriceCallout } from "@/components/cardapio/price-callout";
import { getBuffetDishes, getPastaDishes } from "@/lib/queries";
import { pastaPhotos, winePhotos, WEEKDAYS, formatBRL, menuPricing } from "@/config/menu";
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
        <SectionHeader
          title={t("title")}
          subtitle={t("subtitle")}
          size="lg"
        />

        {/* O "Sujeito a alterações." mora dentro do `PriceCallout`, colado em
            cada preço — não aqui embaixo, onde lia como rodapé do bloco. */}
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

      {/* Massas: seção própria porque o preço é outro — e a única faixa da
          página com a cor da marca, a pedido do cliente em 09/09.

          A ilha é o que a casa tem de mais próprio: massa feita na frente do
          cliente, cobrada à parte. No cinza das outras seções ela lia como
          mais um bloco do cardápio, e quem rolava rápido passava direto. O
          faixa clara com borda da marca e o selo de trigo dão a ela o peso que
          o cinza tirava, sem precisar de fonte maior nem de caixa alta.

          **A faixa CLAREIA, e isso é medição, não gosto.** A primeira versão
          tingia o fundo com a cor da marca. Medido: `text-muted-foreground`
          já vive em 4,52:1 sobre o creme da página — quase sem folga sobre o
          mínimo de 4,5 —, e qualquer tinta escurecendo a faixa derrubava o
          texto de apoio para 3,94:1. Com `bg-card` o mesmo texto sobe para
          5,17:1 e o título para 8,88:1, e a seção continua sendo a única
          faixa destacada da página. Escurecer aqui custa legibilidade;
          clarear não custa nada. */}
      <Section
        id="massas"
        className="border-y-2 border-brand/30 bg-card"
        containerClassName="max-w-3xl"
      >
        {/* Centralizado, a pedido do cliente em 10/09 — é a única seção da
            página assim, e é o que a separa das listas que vêm antes e depois.
            O `items-center` precisa vir daqui: o `SectionHeader` centraliza o
            próprio texto, mas o selo de trigo é irmão dele, não filho. */}
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand/15 text-brand">
            <Wheat className="size-6" aria-hidden />
          </span>
          {/* O preço vai no próprio título da seção: quem rola até aqui não
              deve precisar voltar ao topo para lembrar quanto custa. */}
          <SectionHeader
            title={`${t("pastaLabel")} — ${formatBRL(menuPricing.pasta)}`}
            subtitle={t("pastaNote")}
            size="lg"
          />
        </div>

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
          size="lg"
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
          size="lg"
        />
        <DrinkList />
      </Section>

      {/* Carta de vinhos: seção própria porque o vinho não é bebida de balcão
          — tem rótulo, safra e uma escolha por trás.

          Carrossel no lugar da foto única: uma garrafa sozinha mostrava um
          rótulo, e a carta tem dois. As fotos deslizam; os preços continuam em
          lista logo abaixo, que é onde se comparam as três doses de um mesmo
          rótulo. */}
      <Section containerClassName="max-w-3xl">
        <SectionHeader
          title={t("winesLabel")}
          subtitle={t("winesNote")}
          size="lg"
        />
        <WinePhotos
          photos={winePhotos.map((f) => ({
            image: f.photo,
            alt: t(f.altKey),
          }))}
          labels={{
            carousel: t("winesCarousel"),
            prev: t("winesPrev"),
            next: t("winesNext"),
            /* `{n}` literal: quem numera é o carrossel, no clique. */
            goTo: t("winesGoTo", { n: "{n}" }),
          }}
        />
        <WineList />
      </Section>
    </>
  );
}
