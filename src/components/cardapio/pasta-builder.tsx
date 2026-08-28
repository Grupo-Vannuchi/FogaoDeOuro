import { getTranslations } from "next-intl/server";
import { formatBRL, pastaChoices } from "@/config/menu";

/**
 * Como se monta um prato na ilha de massas, em quatro passos.
 *
 * O cardápio de papel apresenta isso como uma sequência — tamanho, massa,
 * preparo, molho — e a sequência é a informação: o cliente escolhe nessa ordem,
 * na frente do cozinheiro. Numerar aqui não é enfeite, é o que a página está
 * dizendo.
 *
 * Os ingredientes aparecem como quantidade, nunca como lista: eles mudam toda
 * semana, e um nome impresso no site vira promessa que a cozinha não cumpre num
 * dia de entrega ruim. Mesma decisão do cardápio impresso.
 */
export async function PastaBuilder() {
  const t = await getTranslations("cardapio");

  const passos = [
    { titulo: t("pastaPortion"), conteudo: [pastaChoices.portion] },
    { titulo: t("pastaShapes"), conteudo: [...pastaChoices.shapes] },
    { titulo: t("pastaPreparation"), conteudo: [...pastaChoices.preparation] },
    { titulo: t("pastaSauces"), conteudo: [...pastaChoices.sauces] },
  ];

  return (
    <div className="mt-10">
      <h3 className="text-center font-serif text-xl font-bold sm:text-2xl">
        {t("pastaBuild")}
      </h3>

      <ol className="mt-8 grid gap-5 sm:grid-cols-2">
        {passos.map((passo, i) => (
          <li
            key={passo.titulo}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-lg font-bold tabular-nums text-brand">
                {i + 1}
              </span>
              <h4 className="font-semibold">{passo.titulo}</h4>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {passo.conteudo.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {/* Quantidade, não lista — ver o comentário no topo. */}
      <p className="mt-6 text-pretty text-center text-muted-foreground">
        {t("pastaIngredientsNote", { n: pastaChoices.ingredientLimit })}
      </p>

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
