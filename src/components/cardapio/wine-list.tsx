import { getTranslations } from "next-intl/server";
import { formatBRL, wines } from "@/config/menu";

/**
 * A carta de vinhos.
 *
 * Mesma linha das bebidas — nome, observação embaixo, preço à direita —, pela
 * mesma razão: vinho é cobrado à parte, como tudo que não entra no peso do
 * prato.
 *
 * Quando não há rótulo cadastrado, sai só a linha de apoio. Uma moldura vazia
 * no lugar da lista leria como conteúdo que falhou ao carregar, e não como uma
 * carta que ainda não foi digitada.
 */
export async function WineList() {
  const t = await getTranslations("cardapio");

  if (wines.length === 0) {
    return (
      <p className="mt-6 max-w-xl text-pretty text-muted-foreground">
        {t("winesPending")}
      </p>
    );
  }

  return (
    <ul className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
      {wines.map((vinho) => (
        <li
          key={vinho.name}
          className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:px-6"
        >
          {/* `min-w-0` para o nome quebrar em vez de empurrar o preço. */}
          <div className="min-w-0">
            <p className="font-medium">{vinho.name}</p>
            {vinho.note ? (
              <p className="text-sm text-muted-foreground">{vinho.note}</p>
            ) : null}
          </div>
          <p className="shrink-0 font-serif font-bold tabular-nums text-brand">
            {formatBRL(vinho.price)}
          </p>
        </li>
      ))}
    </ul>
  );
}
