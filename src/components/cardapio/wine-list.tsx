import { getTranslations } from "next-intl/server";
import { formatBRL, wines } from "@/config/menu";

/**
 * A carta de vinhos.
 *
 * Segue o desenho das bebidas — linha com nome à esquerda e preço à direita —,
 * mas com um nível a mais: bebida é um nome para um preço, vinho é um rótulo
 * para várias doses. Por isso o rótulo vira título do bloco e as doses viram as
 * linhas; enfileirar "Del Grano taça" e "Del Grano meia taça" como itens
 * irmãos leria como dois vinhos diferentes.
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
    <div className="mt-10 flex flex-col gap-10">
      {wines.map((vinho) => (
        <div key={vinho.name}>
          <h3 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-serif text-xl font-bold tracking-tight sm:text-2xl">
            {vinho.name}
            {vinho.note ? (
              <span className="font-sans text-sm font-medium tracking-normal text-muted-foreground">
                {vinho.note}
              </span>
            ) : null}
          </h3>

          {vinho.labels ? (
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              {vinho.labels.join(" · ")}
            </p>
          ) : null}

          <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            {vinho.servings.map((dose) => (
              <li
                key={dose.label}
                className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:px-6"
              >
                {/* `min-w-0` para o nome quebrar em vez de empurrar o preço. */}
                <div className="min-w-0">
                  <p className="font-medium">{dose.label}</p>
                  {dose.volume ? (
                    <p className="text-sm text-muted-foreground">
                      {dose.volume}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 font-serif font-bold tabular-nums text-brand">
                  {formatBRL(dose.price)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
