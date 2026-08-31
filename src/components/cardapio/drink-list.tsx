import { getTranslations } from "next-intl/server";
import { drinkGroups, formatBRL } from "@/config/menu";

/**
 * As bebidas, agrupadas como no cardápio impresso.
 *
 * Estrutura de lista, igual ao resto do cardápio — e com preço em cada linha,
 * que é o que separa esta seção das outras: bebida não entra no valor por
 * quilo, é cobrada à parte. O mesmo desenho das proteínas da ilha de massas,
 * pela mesma razão.
 *
 * O volume fica sob o nome, e não colado nele, porque é ele que distingue duas
 * linhas homônimas: refrigerante de 200 ml e de 350 ml são itens diferentes.
 */
export async function DrinkList() {
  const t = await getTranslations("cardapio");

  return (
    <div className="mt-10 flex flex-col gap-10">
      {drinkGroups.map((grupo) => (
        <div key={grupo.labelKey}>
          <h3 className="font-serif text-xl font-bold tracking-tight sm:text-2xl">
            {t(grupo.labelKey)}
          </h3>
          <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            {grupo.items.map((bebida) => (
              <li
                key={`${bebida.name}-${bebida.volume}`}
                className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:px-6"
              >
                {/* `min-w-0` para o nome quebrar em vez de empurrar o preço. */}
                <div className="min-w-0">
                  <p className="font-medium">{bebida.name}</p>
                  {bebida.volume ? (
                    <p className="text-sm text-muted-foreground">
                      {bebida.volume}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 font-serif font-bold tabular-nums text-brand">
                  {formatBRL(bebida.price)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
