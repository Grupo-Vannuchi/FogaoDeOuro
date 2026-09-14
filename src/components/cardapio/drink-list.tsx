import { drinkGroups } from "@/config/menu";
import { MenuLine } from "@/components/cardapio/menu-line";

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
 * O volume vai como observação do `MenuLine`, e é ele que distingue duas
 * linhas homônimas: refrigerante de 200 ml e de 350 ml são itens diferentes,
 * com preços diferentes.
 */
export function DrinkGroupList({
  group,
}: {
  group: (typeof drinkGroups)[number];
}) {
  return (
    <ul className="mt-10 divide-y divide-border">
      {group.items.map((bebida) => (
        <MenuLine
          key={`${bebida.name}-${bebida.volume}`}
          name={bebida.name}
          price={bebida.price}
          note={bebida.volume || undefined}
        />
      ))}
    </ul>
  );
}
