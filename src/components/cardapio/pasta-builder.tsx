import { getTranslations } from "next-intl/server";
import { formatBRL, pastaChoices } from "@/config/menu";

/**
 * Como se monta um prato na ilha de massas.
 *
 * O cardápio de papel apresenta isso como uma sequência — massa, preparo,
 * molho — e a sequência é a informação: o cliente escolhe nessa ordem, na
 * frente do cozinheiro. Numerar não é enfeite, é o que a página está dizendo.
 *
 * ── Por que faixas, e não cards ────────────────────────────────────────────
 *
 * A primeira versão punha os passos numa grade 2×2. O problema não era estético:
 * a massa tem dez opções e o preparo tem duas, então cada card era esticado até
 * a altura do vizinho mais alto e sobrava um vazio de quase 200px dentro do
 * card curto. Em faixas, cada passo ocupa exatamente a altura do seu conteúdo.
 *
 * A porção saiu dos passos e virou contexto sob o título. Ela era o "passo 1"
 * com uma única etiqueta — e não é escolha nenhuma: é sempre 190g. Um quarto da
 * seção para dizer o que cabe em quatro palavras.
 *
 * Os ingredientes aparecem como quantidade, nunca como lista: mudam toda
 * semana, e um nome impresso no site vira promessa que a cozinha não cumpre num
 * dia de entrega ruim. Mesma decisão do cardápio impresso.
 */
export async function PastaBuilder() {
  const t = await getTranslations("cardapio");

  const passos = [
    { titulo: t("pastaShapes"), opcoes: [...pastaChoices.shapes] },
    { titulo: t("pastaPreparation"), opcoes: [...pastaChoices.preparation] },
    { titulo: t("pastaSauces"), opcoes: [...pastaChoices.sauces] },
  ];

  return (
    <div className="mt-12">
      <h3 className="text-center font-serif text-xl font-bold sm:text-2xl">
        {t("pastaBuild")}
      </h3>

      {/* O que não se escolhe, dito de uma vez: porção fixa e quantos
          ingredientes entram. */}
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {t("pastaPortionNote", {
          portion: pastaChoices.portion,
          n: pastaChoices.ingredientLimit,
        })}
      </p>

      <ol className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        {passos.map((passo, i) => (
          <li
            key={passo.titulo}
            className="flex gap-4 border-b border-border px-5 py-5 last:border-b-0 sm:gap-5 sm:px-6"
          >
            <span
              aria-hidden
              className="mt-0.5 font-serif text-lg font-bold tabular-nums leading-none text-brand"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {passo.titulo}
              </h4>
              {/* Corridas, separadas por ponto médio: dez etiquetas soltas
                  quebravam em linhas de um, dois e três itens, e o serrilhado
                  chamava mais atenção que os nomes. */}
              <p className="mt-1.5 text-pretty leading-relaxed">
                {passo.opcoes.join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* A exceção à regra de "preço é da seção": estes são adicionais
          cobrados por unidade, e o cardápio impresso os lista com valor. */}
      <div className="mt-10">
        <h3 className="text-center font-serif text-xl font-bold sm:text-2xl">
          {t("pastaExtras")}
        </h3>
        <ul className="mx-auto mt-6 max-w-md overflow-hidden rounded-2xl border border-border bg-card">
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
    </div>
  );
}
