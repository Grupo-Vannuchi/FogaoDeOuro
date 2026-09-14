import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { DrinkGroupList } from "@/components/cardapio/drink-list";
import { drinkGroups, formatBRL } from "@/config/menu";

/**
 * O cliente recusou a lista de bebidas em `MenuLine` — nome em caixa alta
 * laranja, fio pontilhado, solta sobre o creme — porque os pratos do buffet,
 * na MESMA página, são um cartão `bg-card` com nome em `font-serif` e
 * observação embaixo. Duas linguagens visuais convivendo na mesma tela leem
 * como "a bebida é de outro site".
 *
 * `DrinkGroupList` (`src/components/cardapio/drink-list.tsx`) resolveu isso
 * copiando o cartão e a tipografia do buffet, com uma diferença: o preço da
 * bebida — que o prato do buffet não tem, é por quilo — entra na MESMA linha
 * da observação ("300 ml · R$ 12,00"), não numa coluna própria como no
 * `MenuLine` antigo. Nada testava essa forma; alguém reintroduzindo o
 * `MenuLine` aqui, ou separando o preço de volta numa coluna, passaria batido
 * pela suíte. Este arquivo trava o formato que o cliente pediu.
 */
describe("DrinkGroupList", () => {
  // O grupo "Café e água" é o único com um item sem volume (Café expresso
  // com leite) ao lado de itens com volume — cobre os dois casos com um
  // grupo real do catálogo, sem inventar dados.
  const grupo = drinkGroups.find((g) =>
    g.items.some((item) => item.volume === ""),
  );
  if (!grupo) {
    throw new Error(
      "Nenhum grupo de bebidas tem item sem volume — ajuste o teste ao catálogo atual.",
    );
  }

  // `formatBRL` (Intl.NumberFormat) separa "R$" do valor com um espaço
  // NÃO separável (U+00A0), não um espaço comum. O normalizador padrão do
  // Testing Library colapsa esse espaço ao ler o texto do DOM, mas não
  // normaliza uma string de busca literal — por isso a string esperada
  // também passa por esse colapso antes da comparação.
  const semEspacosExoticos = (texto: string) => texto.replace(/\s+/g, " ");

  it("mostra o preço na mesma linha de texto da observação, não numa coluna própria", () => {
    render(<DrinkGroupList group={grupo} />);

    const comVolume = grupo.items.find((item) => item.volume !== "");
    if (!comVolume) throw new Error("grupo sem item com volume");

    // getByText só encontra um elemento cujo próprio texto (sem contar
    // elementos filhos) bate com a string inteira. Se o preço estivesse num
    // <span> separado dentro do mesmo <li>, este texto completo não bateria
    // em nenhum nó, e a busca falharia.
    const linha = screen.getByText(
      semEspacosExoticos(
        `${comVolume.volume} · ${formatBRL(comVolume.price)}`,
      ),
    );
    expect(linha.tagName).toBe("P");
  });

  it("sem volume, a observação é só o preço — sem separador solto sobrando", () => {
    render(<DrinkGroupList group={grupo} />);

    const semVolume = grupo.items.find((item) => item.volume === "");
    if (!semVolume) throw new Error("grupo sem item sem volume");

    const nome = screen.getByText(semVolume.name);
    const item = nome.closest("li");
    expect(item).not.toBeNull();

    // A observação inteira é só o preço formatado — nada de "· R$ 7,00"
    // sobrando de um separador que não tem o que separar.
    within(item as HTMLElement).getByText(
      semEspacosExoticos(formatBRL(semVolume.price)),
    );
    expect(item).not.toHaveTextContent("·");
  });

  it("usa a gótica dos pratos do buffet no nome do item, não caixa alta", () => {
    render(<DrinkGroupList group={grupo} />);

    const primeiro = grupo.items[0];
    const nome = screen.getByText(primeiro.name);

    expect(nome.className).toMatch(/font-serif/);
    expect(nome.className).not.toMatch(/uppercase/);
    // O texto do nó é o nome como está no catálogo, não uma versão
    // transformada em maiúsculas.
    expect(nome.textContent).toBe(primeiro.name);
  });
});
