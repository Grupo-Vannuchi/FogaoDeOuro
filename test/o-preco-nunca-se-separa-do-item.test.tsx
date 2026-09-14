import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { MenuLine } from "@/components/cardapio/menu-line";

/**
 * O fio pontilhado é decoração, e decoração não pode virar conteúdo.
 *
 * No impresso, o fio leva o olho do nome até o preço. Na tela ele é um
 * elemento vazio com borda pontilhada — e um leitor de tela que o anunciasse
 * leria ruído entre o prato e o valor. Daí o `aria-hidden`.
 *
 * O segundo teste é o que mais importa: nome e preço têm de sair na MESMA
 * linha da árvore, porque é essa vizinhança que diz "este valor é deste item".
 * Se alguém separar os dois em blocos irmãos para facilitar o layout, a
 * relação some para quem não vê a tela.
 */
describe("MenuLine", () => {
  it("não deixa o fio pontilhado virar conteúdo lido", () => {
    const { container } = render(
      <ul>
        <MenuLine name="Suco natural" price={12} note="300 ml" />
      </ul>,
    );
    const fio = container.querySelector("[data-fio]");
    expect(fio).not.toBeNull();
    expect(fio).toHaveAttribute("aria-hidden", "true");
    expect(fio).toHaveTextContent("");
  });

  it("mantém nome e preço dentro do mesmo item de lista", () => {
    render(
      <ul>
        <MenuLine name="Suco natural" price={12} />
      </ul>,
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent("Suco natural");
    expect(item).toHaveTextContent("R$ 12,00");
  });

  it("só desenha a observação quando ela existe", () => {
    const { rerender } = render(
      <ul>
        <MenuLine name="Café expresso" price={7} note="50 ml" />
      </ul>,
    );
    expect(screen.getByText("50 ml")).toBeInTheDocument();

    rerender(
      <ul>
        <MenuLine name="Café expresso com leite" price={7} />
      </ul>,
    );
    expect(screen.queryByText("50 ml")).not.toBeInTheDocument();
  });
});
