import { drinkGroups, formatBRL } from "@/config/menu";

/**
 * A lista de um grupo de bebidas.
 *
 * ── O grupo virou a seção ─────────────────────────────────────────────────
 *
 * Até 14/09 este componente desenhava os três grupos, cada um com título e
 * foto, dentro de uma seção "Bebidas". A peça impressa faz diferente: **cada
 * página é um grupo** — Sucos e Café numa, Refris & Cerveja noutra —, com sua
 * foto e seu letreiro.
 *
 * Agora a página monta uma `MenuSection` por grupo, e o que sobra aqui é a
 * lista. Título e foto são responsabilidade da seção.
 *
 * ── Mesmo cartão do buffet, não mais o `MenuLine` ─────────────────────────
 *
 * Até 14/09 esta lista usava o `MenuLine`: nome em caixa alta laranja, fio
 * pontilhado, solta sobre o creme. O cliente recusou — os pratos do dia, na
 * mesma página, são um cartão `bg-card` com divisórias e nome em `font-serif`
 * (a gótica), e a bebida parecia de outro site.
 *
 * Agora a lista copia a superfície e a tipografia do buffet: mesmo `<ul>`
 * (`overflow-hidden rounded-2xl border border-border bg-card`) e mesma linha
 * de `DishRow` (`src/components/cardapio/dish-row.tsx`) — nome em
 * `font-serif`, observação em `text-muted-foreground` embaixo.
 *
 * **O preço entra na observação, não numa coluna própria.** É aqui que a
 * bebida diverge do prato: o prato do buffet não tem preço de linha (é por
 * quilo), a bebida tem, e ele vira parte do texto de apoio — "300 ml · R$
 * 12,00". Sem volume (`volume` é string vazia, como no café com leite), a
 * observação é só o preço: "R$ 7,00".
 *
 * `MenuLine` não foi apagado por isto — sobremesas e vinhos ganhariam o mesmo
 * cartão numa tarefa seguinte, cada um com sua própria variação (miniatura +
 * preço à direita). O cliente recusou o fio pontilhado por completo em 14/09,
 * sem exceção para nenhuma seção, e o componente foi removido: não sobrou
 * consumidor para ele.
 */
export function DrinkGroupList({
  group,
}: {
  group: (typeof drinkGroups)[number];
}) {
  return (
    <ul className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
      {group.items.map((bebida) => (
        <li
          key={`${bebida.name}-${bebida.volume}`}
          className="border-b border-border px-5 py-4 last:border-b-0 sm:px-6"
        >
          <h3 className="font-serif text-lg font-bold leading-snug sm:text-xl">
            {bebida.name}
          </h3>
          <p className="mt-1 text-pretty text-base leading-relaxed text-muted-foreground">
            {bebida.volume
              ? `${bebida.volume} · ${formatBRL(bebida.price)}`
              : formatBRL(bebida.price)}
          </p>
        </li>
      ))}
    </ul>
  );
}
