import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeader } from "@/components/ui/section";
import { DayTabs } from "@/components/cardapio/day-tabs";
import { DishCard } from "@/components/cardapio/dish-card";
import { PriceCallout } from "@/components/cardapio/price-callout";
import { getBuffetDishes, getPastaDishes } from "@/lib/queries";
import {
  WEEKDAYS,
  formatBRL,
  menuPricing,
  pastaChoices,
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
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <Section>
        <PriceCallout />

        {buffet.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">{t("empty")}</p>
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
                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {dishes.map((dish, i) => (
                      <li key={dish.id}>
                        {/* Só a primeira linha da segunda-feira entra como
                            prioritária: é o que aparece na tela ao abrir o QR
                            Code. As demais grades nascem escondidas e o
                            navegador nem baixa as imagens delas. */}
                        <DishCard dish={dish} priority={day === 1 && i < 3} />
                      </li>
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
      >
        {/* O preço vai no próprio título da seção: quem rola até aqui não
            deve precisar voltar ao topo para lembrar quanto custa. */}
        <SectionHeader
          title={`${t("pastaLabel")} — ${formatBRL(menuPricing.pasta)}`}
          subtitle={t("pastaNote")}
          align="left"
        />

        {pasta.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pasta.map((dish) => (
              <li key={dish.id}>
                <DishCard dish={dish} />
              </li>
            ))}
          </ul>
        ) : null}

        {/* As listas de massas e molhos vivem em `config/menu.ts` e hoje estão
            vazias — o cliente ainda não passou os nomes. Enquanto estiverem,
            não se renderiza grade vazia: mostra-se o que é verdade. */}
        {pastaChoices.shapes.length > 0 || pastaChoices.sauces.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {(
              [
                ["pastaShapes", pastaChoices.shapes],
                ["pastaSauces", pastaChoices.sauces],
              ] as const
            ).map(([key, list]) =>
              list.length > 0 ? (
                <div
                  key={key}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <h3 className="font-serif text-lg font-bold">{t(key)}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {list.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        ) : pasta.length === 0 ? (
          <p className="mt-8 max-w-2xl text-pretty text-muted-foreground">
            {t("pastaEmpty")}
          </p>
        ) : null}
      </Section>
    </>
  );
}
