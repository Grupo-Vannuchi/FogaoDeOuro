import { getTranslations } from "next-intl/server";
import { formatBRL, pastaChoices } from "@/config/menu";
import { TEXTO_SOLTO, TEXTO_SOLTO_APOIO } from "@/components/cardapio/menu-backdrop";

/**
 * Como se monta um prato na ilha de massas.
 *
 * O cardápio de papel apresenta isso como uma sequência — massa, preparo,
 * molho, ingredientes — e a sequência é a informação: o cliente escolhe nessa
 * ordem, na frente do cozinheiro.
 *
 * ── A composição ──────────────────────────────────────────────────────────
 *
 * O carrossel de fotos não mora mais aqui: ele abre a `MenuSection` da ilha,
 * dentro da coluna de leitura (até 14/09 ele sangrava de ponta a ponta — o
 * cliente recusou o sangramento na página inteira, não só nesta seção). O
 * que resta é a trilha numerada, com a linha ligando um passo ao seguinte. A
 * trilha não é enfeite:
 * ela desenha o que a seção está dizendo, que é uma ordem, e sobrevive ao
 * celular sem virar outra coisa — no desktop e no telefone continua a mesma
 * coluna, só muda a largura das etiquetas.
 *
 * As opções usam a mesma linha do resto do cardápio — moldura única, fio fino
 * entre uma e outra, nome em serifa. Antes eram etiquetas arredondadas, e a
 * seção parecia de outro site: numa página inteira de listas, um bloco de
 * pílulas é a coisa que não pertence. Como parágrafo separado por ponto médio,
 * que foi o desenho anterior a esse, elas liam como descrição — dava para ler,
 * não para escolher.
 *
 * As classes da linha são as mesmas de `DishRow` de propósito. O nome, porém,
 * é `<p>` e não `<h3>`: lá ele encabeça uma descrição, aqui não há descrição
 * nenhuma para encabeçar — um título sozinho seria um cabeçalho vazio para
 * quem navega por eles.
 *
 * O alinhamento é à esquerda de ponta a ponta. Centralizado, o título flutuava
 * sobre uma lista que começa na margem e o olho voltava ao centro a cada bloco.
 *
 * Os ingredientes aparecem como quantidade, nunca como lista: mudam toda
 * semana, e um nome impresso no site vira promessa que a cozinha não cumpre num
 * dia de entrega ruim. Mesma decisão do cardápio impresso. Por isso o passo 4 é
 * o único sem etiquetas — a frase é o conteúdo.
 */
export async function PastaBuilder() {
  const t = await getTranslations("cardapio");

  /** Cada passo traz etiquetas **ou** uma nota — nunca os dois. */
  const passos: { titulo: string; opcoes?: string[]; nota?: string }[] = [
    { titulo: t("pastaShapes"), opcoes: [...pastaChoices.shapes] },
    { titulo: t("pastaPreparation"), opcoes: [...pastaChoices.preparation] },
    { titulo: t("pastaSauces"), opcoes: [...pastaChoices.sauces] },
    {
      titulo: t("pastaIngredients"),
      nota: t("pastaIngredientsNote", { n: pastaChoices.ingredientLimit }),
    },
  ];

  return (
    <div className="mt-10">
      {/* Texto solto direto sobre `MenuBackdrop` — daí
          `TEXTO_SOLTO`/`TEXTO_SOLTO_APOIO` e não `--foreground`/
          `text-muted-foreground`, que são medidos contra o creme do site e
          não contra o fundo do cardápio. As cores vêm importadas porque mudam
          junto com o fundo; ver o docblock de `MenuBackdrop` para a medição da
          versão no ar. Nada aqui mora dentro de um `bg-card`. */}
      <h3
        className="mt-10 font-serif text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: TEXTO_SOLTO }}
      >
        {t("pastaBuild")}
      </h3>
      <p className="mt-2 max-w-xl text-pretty" style={{ color: TEXTO_SOLTO_APOIO }}>
        {t("pastaPortionNote", { portion: pastaChoices.portion })}
      </p>

      <ol className="mt-10">
        {passos.map((passo, i) => {
          const ultimo = i === passos.length - 1;
          return (
            <li key={passo.titulo} className="flex sm:gap-5">
              {/* A trilha só existe a partir de `sm`. No celular ela custava
                  52px de recuo (círculo de 36 + vão de 16) em cada linha da
                  lista, numa tela de 390px — um quarto da largura gasto para
                  desenhar uma calha vazia. Ali o número passa a ficar na mesma
                  linha do título e o card ocupa a coluna inteira.

                  A linha vertical é `flex-1`: estica até o próximo círculo
                  sozinha, sem altura fixa que desalinhe quando as opções
                  quebram em mais linhas. */}
              {/* Os dois círculos numerados abaixo (`sm` e celular) são
                  `bg-card` sem `text-card-foreground`, ao contrário dos
                  outros desta página: já fixam a própria cor (`text-brand`)
                  em vez de herdá-la, então empilhar `text-card-foreground`
                  no mesmo elemento seria conflito, não reforço. */}
              <div className="hidden flex-col items-center sm:flex" aria-hidden>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-card font-serif text-base font-bold tabular-nums text-brand">
                  {i + 1}
                </span>
                {ultimo ? null : (
                  <span className="mt-2 w-px flex-1 bg-border" />
                )}
              </div>

              {/* `min-w-0` para as opções quebrarem em vez de empurrar a
                  coluna do número para fora. */}
              <div className={`min-w-0 flex-1 pt-1.5 ${ultimo ? "" : "pb-9"}`}>
                <h4
                  className="flex items-center gap-2.5 font-serif text-xl font-bold leading-snug sm:text-2xl"
                  style={{ color: TEXTO_SOLTO }}
                >
                  {/* O mesmo número da trilha, na versão de celular. Some em
                      `sm`, onde o círculo da calha assume. */}
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-card text-sm tabular-nums text-brand sm:hidden"
                  >
                    {i + 1}
                  </span>
                  {passo.titulo}
                </h4>
                {passo.opcoes ? (
                  // `text-card-foreground`: fundo escuro na v11 inverteu o
                  // texto solto para creme (ver `h4`/`h3` acima) — sem isto o
                  // nome de cada opção herdaria esse creme e sumiria sobre o
                  // próprio `bg-card` creme.
                  <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
                    {passo.opcoes.map((opcao) => (
                      <li
                        key={opcao}
                        className="border-b border-border px-4 py-4 last:border-b-0 sm:px-6"
                      >
                        {/* Acompanha o `DishRow`: as duas listas caem uma sob
                            a outra na mesma página, e tamanhos diferentes
                            fariam a ilha parecer menos importante que o
                            buffet. Se um mudar, o outro muda junto. */}
                        <p className="font-serif text-lg font-bold leading-snug sm:text-xl">
                          {opcao}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // Mesmo cartão do passo que tem opções, a pedido do cliente
                  // em 25/09: antes a nota caía solta sobre o `MenuBackdrop`
                  // em `TEXTO_SOLTO_APOIO`, e um passo com lista branca ao
                  // lado de um passo sem nada parecia inacabado. Dentro de
                  // `bg-card` vale `text-card-foreground` — as constantes de
                  // texto solto são para quem cai direto sobre o fundo.
                  <p className="mt-4 text-pretty rounded-2xl border border-border bg-card px-4 py-4 leading-relaxed text-card-foreground sm:px-6">
                    {passo.nota}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* A exceção à regra de "preço é da seção": estes são adicionais
          cobrados por unidade, e o cardápio impresso os lista com valor. */}
      <h3
        className="mt-12 font-serif text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: TEXTO_SOLTO }}
      >
        {t("pastaExtras")}
      </h3>
      <ul className="mt-6 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
        {pastaChoices.extras.map((extra) => (
          <li
            key={extra.name}
            className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:px-6"
          >
            <div>
              <p className="font-medium">{extra.name}</p>
              <p className="text-sm text-muted-foreground">{extra.weight}</p>
            </div>
            <p className="shrink-0 font-serif font-bold tabular-nums text-brand">
              {formatBRL(extra.price)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
