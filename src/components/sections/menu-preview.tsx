import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { MenuItemCard } from "@/components/menu-item-card";
import { buttonVariants } from "@/components/ui/button";
import { getMenu } from "@/lib/queries";
import type { Locale } from "@/i18n/routing";

/**
 * Quantos pratos a seção mostra.
 *
 * Três: uma linha cheia na grade de três colunas, a pedido do cliente em
 * 09/09. Eram nove — três linhas —, e a home ficava com uma vitrine de
 * catálogo no meio do caminho para as seções que convertem. Quem quer ver
 * tudo tem o botão para o cardápio ao lado do título.
 *
 * Qualquer múltiplo de três funciona. Fora disso a última linha fica pela
 * metade, com um vão à direita que lê como card faltando.
 */
const VAGAS = 3;

/**
 * Os pratos que abrem a vitrine, na ordem.
 *
 * **Escolha editorial, e por isso escrita aqui.** Com nove vagas o rodízio por
 * categoria se resolvia sozinho; com três, o que aparece é a primeira
 * impressão da casa, e o resultado automático trazia a foto mais fraca do
 * acervo na primeira posição.
 *
 * A sequência conta buffet → massa → sobremesa, que é a ordem em que se monta
 * o prato, e nenhuma das três se repete em outra página. A do meio é a ilha de
 * massas de propósito: o cliente pediu as massas mais visíveis, e a home é
 * onde a maioria começa.
 *
 * Slug que não existir mais é ignorado sem quebrar nada, e o rodízio antigo
 * completa as vagas que sobrarem — trocar a foto no admin continua bastando.
 */
const DESTAQUES = ["buffet-de-saladas", "ilha-de-massas", "pudim"];

export async function MenuPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.gastronomia");
  const tc = await getTranslations("common");
  const categories = await getMenu(locale);

  /**
 * Um de cada categoria por vez, em rodadas, até fechar as vagas.
 *
 * Concatenar as categorias e cortar os primeiros dava a vitrine inteira de uma
 * categoria só — as carnes, depois o buffet, e nenhuma sobremesa. A seção
 * promete "tudo o que espera por você" e mostrava um canto só da cozinha. Em
 * rodadas, as vagas se distribuem sozinhas e continuam se distribuindo quando
 * o restaurante trocar as fotos.
 */
  const todos = categories.flatMap((c) => c.items);

  // Os escolhidos primeiro, na ordem em que estão escritos. Um slug que sumiu
  // do admin simplesmente não entra.
  const items = DESTAQUES.map((slug) =>
    todos.find((item) => item.slug === slug),
  ).filter((item) => item !== undefined);

  // Rodízio por categoria para o que sobrar — um de cada por vez, para as
  // vagas não caírem todas na mesma categoria.
  for (let rodada = 0; items.length < VAGAS; rodada += 1) {
    const daRodada = categories
      .map((c) => c.items[rodada])
      .filter((item) => item !== undefined && !items.includes(item));
    if (daRodada.length === 0) break; // acabaram os pratos
    items.push(...daRodada.slice(0, VAGAS - items.length));
  }

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
          href="/cardapio"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {tc("viewAllMenu")}
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
