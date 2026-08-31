import { getTranslations } from "next-intl/server";
import { formatBRL, pastaChoices } from "@/config/menu";
import {
  PastaCarousel,
  type PastaPhoto,
} from "@/components/cardapio/pasta-carousel";

/**
 * Como se monta um prato na ilha de massas.
 *
 * O cardápio de papel apresenta isso como uma sequência — massa, preparo,
 * molho, ingredientes — e a sequência é a informação: o cliente escolhe nessa
 * ordem, na frente do cozinheiro.
 *
 * ── A composição ──────────────────────────────────────────────────────────
 *
 * A foto do prato abre a seção em faixa larga; abaixo dela, uma trilha
 * numerada com a linha ligando um passo ao seguinte. A trilha não é enfeite:
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
 * As imagens vêm do banco (`getPastaPhotos`), não de `public`: são pratos da
 * casa, e trocá-las no admin troca os slides.
 *
 * Os ingredientes aparecem como quantidade, nunca como lista: mudam toda
 * semana, e um nome impresso no site vira promessa que a cozinha não cumpre num
 * dia de entrega ruim. Mesma decisão do cardápio impresso. Por isso o passo 4 é
 * o único sem etiquetas — a frase é o conteúdo.
 */
export async function PastaBuilder({ photos }: { photos: PastaPhoto[] }) {
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
      {photos.length > 0 ? (
        <PastaCarousel
          photos={photos}
          labels={{
            carousel: t("pastaCarousel"),
            prev: t("pastaPrevPhoto"),
            next: t("pastaNextPhoto"),
            // O rótulo de cada bolinha é montado no cliente, que não tem o
            // catálogo: mandamos o molde e ele troca o {n}.
            goTo: t("pastaGoToPhoto", { n: "{n}" }),
          }}
        />
      ) : null}

      <h3 className="mt-10 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
        {t("pastaBuild")}
      </h3>
      <p className="mt-2 max-w-xl text-pretty text-muted-foreground">
        {t("pastaPortionNote", { portion: pastaChoices.portion })}
      </p>

      <ol className="mt-10">
        {passos.map((passo, i) => {
          const ultimo = i === passos.length - 1;
          return (
            <li key={passo.titulo} className="flex gap-4 sm:gap-5">
              {/* Coluna do número. A linha é `flex-1`: ela estica até o
                  próximo círculo sozinha, sem altura fixa que desalinhe
                  quando as etiquetas quebram em mais linhas. */}
              <div className="flex flex-col items-center" aria-hidden>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-card font-serif text-sm font-bold tabular-nums text-brand sm:size-10 sm:text-base">
                  {i + 1}
                </span>
                {ultimo ? null : (
                  <span className="mt-2 w-px flex-1 bg-border" />
                )}
              </div>

              {/* `min-w-0` para as etiquetas quebrarem em vez de empurrar a
                  coluna do número para fora. */}
              <div className={`min-w-0 flex-1 pt-1.5 ${ultimo ? "" : "pb-9"}`}>
                <h4 className="font-serif text-lg font-bold leading-snug sm:text-xl">
                  {passo.titulo}
                </h4>
                {passo.opcoes ? (
                  <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
                    {passo.opcoes.map((opcao) => (
                      <li
                        key={opcao}
                        className="border-b border-border px-5 py-4 last:border-b-0 sm:px-6"
                      >
                        <p className="font-serif text-base font-bold leading-snug sm:text-lg">
                          {opcao}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
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
      <h3 className="mt-12 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
        {t("pastaExtras")}
      </h3>
      <ul className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
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
