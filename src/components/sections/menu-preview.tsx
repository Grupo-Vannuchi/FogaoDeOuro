import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { fillYears } from "@/config/site";
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
const VAGAS = 4;

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
const DESTAQUES = [
  "buffet-de-saladas",
  "ilha-de-massas",
  // A carne entrou em 25/09, a pedido do cliente, e a ordem é a dele:
  // buffet, massas, carne, sobremesa — a sequência de um almoço.
  // `carnes-na-brasa` e não picanha/maminha/fraldinha: aquelas estão
  // cadastradas SEM foto, e `getMenu` filtra prato sem imagem, então
  // apontar para elas deixaria a vaga vazia sem nenhum erro.
  "carnes-na-brasa",
  "pudim",
];

export async function MenuPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.gastronomia");
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
      {/* Era uma linha `justify-between` com `sm:items-end`: título à esquerda,
          botão à direita. Aquilo foi desenhado para um apoio de UMA LINHA. Com
          os três parágrafos de 24/09 o `items-end` passou a alinhar o botão
          pelo rodapé da coluna mais alta, e ele ficava boiando sozinho no canto
          inferior direito, ao lado de meia seção vazia — o texto num filete de
          `max-w-xl` e 600px de nada à direita dele.

          Agora é um bloco só: sobrancelha, título, os três parágrafos e o
          botão, todos na mesma largura e na mesma borda esquerda dos cards. Já
          se tentou dividir em duas colunas, título de um lado e texto do
          outro — o título é curto e o texto é alto, então o vão apenas mudava
          de lugar, do lado direito da seção para baixo do título.

          `t.raw` no subtítulo: desde 24/09 essa chave é uma LISTA de
          parágrafos, e `t()` só devolve string. As outras seções que usam
          `SectionHeader` seguem passando string, e nada muda nelas. */}
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        // `fillYears`: o texto cita os anos de casa, e o número sai de
        // `foundedYear`. Escrito fixo, erraria em janeiro e contradiria o
        // selo do hero, que calcula. Mesmo tratamento que os slides já têm.
        subtitle={(t.raw("subtitle") as string[]).map((p) => fillYears(p))}
        align="left"
        /* Vai para /experiencia, não para o cardápio: esta seção se chama
           "A experiência", e o rótulo agora diz isso. Trocado em 15/09 junto
           com o CTA do hero, que assumiu o caminho do cardápio — os dois
           estavam cruzados, cada um levando para o destino do outro. O rótulo
           saiu de `common.viewAllMenu` (removido, sem outro consumidor) para
           uma chave da própria seção: uma chave "comum" que só um lugar usa e
           que descreve o destino errado é pior que nenhuma. */
        action={
          <Link
            href="/experiencia"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {t("cta")}
            <ArrowRight className="size-4" />
          </Link>
        }
      />
      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal as="li" key={item.id} delay={(i % 3) * 90} className="h-full">
            <MenuItemCard item={item} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
