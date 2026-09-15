import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MenuBackdrop, TEXTO_SOLTO_APOIO } from "@/components/cardapio/menu-backdrop";
import { MenuSection } from "@/components/cardapio/menu-section";
import { MenuHero } from "@/components/cardapio/menu-hero";
import { DayTabs } from "@/components/cardapio/day-tabs";
import { DishRow } from "@/components/cardapio/dish-row";
import { PastaCarousel } from "@/components/cardapio/pasta-carousel";
import { PastaBuilder } from "@/components/cardapio/pasta-builder";
import { DrinkGroupList } from "@/components/cardapio/drink-list";
import { DessertList } from "@/components/cardapio/dessert-list";
import { WineList } from "@/components/cardapio/wine-list";
import { PriceCallout } from "@/components/cardapio/price-callout";
import { getBuffetDishes, getPastaDishes } from "@/lib/queries";
import {
  pastaPhotos,
  drinkGroups,
  WEEKDAYS,
  formatBRL,
  menuPricing,
} from "@/config/menu";
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
      {/* Decorativo, fixo, atrás de tudo — não entra na ordem de leitura nem
          na de tabulação. Ver o docblock de `MenuBackdrop` para o porquê do
          fundo e o histórico das quinze tentativas anteriores — é também de
          lá que vem a cor do texto solto desta página e a obrigação de fixar
          os `bg-card` com `text-card-foreground`.

          Não repita aqui a descrição do fundo: ela já ficou obsoleta uma vez
          (estes comentários descreviam a chama da v12 enquanto o kraft da v15
          estava no ar). O fundo muda; `MenuBackdrop` é a fonte. */}
      <MenuBackdrop />

      <MenuHero />

      {/* 1 — O buffet do dia. Sem foto: são dezenas de pratos que mudam toda
             semana, e nenhuma imagem representa "quarta-feira". A curva vira
             divisória e a seção abre direto no letreiro. */}
      <MenuSection title={t("title")} subtitle={t("subtitle")}>
        <div className="mt-10">
          <PriceCallout />
        </div>

        {/* Estados vazios soltos sobre o fundo v15 (`MenuBackdrop`, papel
            kraft + formas em laranja) — `TEXTO_SOLTO_APOIO`, não
            `text-muted-foreground`: nenhum dos dois mora dentro de um
            `bg-card`, e `text-muted-foreground` não foi medido contra este
            fundo. */}
        {buffet.length === 0 ? (
          <p className="mt-12 text-center" style={{ color: TEXTO_SOLTO_APOIO }}>
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
                    <p key={day} className="text-center" style={{ color: TEXTO_SOLTO_APOIO }}>
                      {t("emptyDay")}
                    </p>
                  );
                }
                return (
                  // `text-card-foreground`: fixa o texto de cada prato contra
                  // o creme do cartão — sem isto herdaria o creme do texto
                  // solto da página (ver `MenuBackdrop`) e sumiria.
                  <ul
                    key={day}
                    className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground"
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
      </MenuSection>

      {/* 2 — A ilha de massas. O carrossel entra na coluna de leitura, como
             qualquer foto de seção: a ilha tem mais de um formato, e uma foto
             só a venderia como se tivesse um. */}
      <MenuSection
        id="massas"
        title={`${t("pastaLabel")} — ${formatBRL(menuPricing.pasta)}`}
        subtitle={t("pastaNote")}
      >
        <div className="mt-8">
          <PastaCarousel
            photos={pastaPhotos.map((f) => ({
              image: f.photo,
              alt: t("dishImageAlt", { name: f.name }),
            }))}
            labels={{
              carousel: t("pastaCarousel"),
              prev: t("pastaPrevPhoto"),
              next: t("pastaNextPhoto"),
              goTo: t("pastaGoToPhoto", { n: "{n}" }),
            }}
          />
        </div>

        {pasta.length > 0 ? (
          <ul className="mt-10 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
            {pasta.map((dish) => (
              <DishRow key={dish.id} dish={dish} />
            ))}
          </ul>
        ) : null}

        <PastaBuilder />
      </MenuSection>

      {/* 3 — Sobremesas. */}
      <MenuSection
        photo={{
          src: "/sobremesas/petit-gateau-largo.webp",
          alt: t("dessertsPhotoAlt"),
        }}
        title={t("dessertsLabel")}
        subtitle={t("dessertsNote")}
      >
        <DessertList />
      </MenuSection>

      {/* 4, 5 e 6 — Uma seção por grupo de bebida, como no impresso: cada
             página de lá é um grupo, com sua foto e seu letreiro.

             A âncora `bebidas` fica no primeiro grupo. Nada no site aponta
             para ela, mas link externo indexado não aparece numa busca do
             repositório, e manter o `id` custa zero. */}
      {drinkGroups.map((grupo, i) => {
        const foto = "photo" in grupo ? grupo.photo : undefined;
        const alt = "altKey" in grupo ? grupo.altKey : undefined;
        return (
          <MenuSection
            key={grupo.labelKey}
            id={i === 0 ? "bebidas" : undefined}
            photo={foto && alt ? { src: foto, alt: t(alt) } : undefined}
            title={t(grupo.labelKey)}
            /* A ressalva de que bebida não entra no quilo vale para os três
               grupos, e repeti-la em cada um viraria ruído. Fica no primeiro. */
            subtitle={i === 0 ? t("drinksNote") : undefined}
          >
            <DrinkGroupList group={grupo} />
          </MenuSection>
        );
      })}

      {/* 7 — A carta de vinhos. */}
      <MenuSection
        photo={{
          src: "/bebidas/carta-de-vinhos.webp",
          alt: t("winesPhotoAlt"),
        }}
        title={t("winesLabel")}
        subtitle={t("winesNote")}
      >
        <WineList />
      </MenuSection>
    </>
  );
}
