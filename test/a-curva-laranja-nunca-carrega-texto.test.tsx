import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { MenuSection } from "@/components/cardapio/menu-section";

/**
 * A regra dura desta página: **nada de texto sobre o laranja.**
 *
 * `--foreground` sobre `#FB6B3A` dá 2,17:1 — menos da metade do mínimo de 4,5.
 * Não há ajuste de token que salve; a única saída é a curva nunca carregar
 * texto.
 *
 * O teste trava isso na estrutura, não na aparência: a curva é um SVG
 * `aria-hidden` e não pode ter nenhum descendente de texto. Se alguém um dia
 * resolver pôr o nome da seção "dentro" da curva para economizar altura, o
 * teste reprova antes de a tela chegar a alguém.
 *
 * O segundo caso cobre as duas seções sem foto (Cardápio da Semana e Café e
 * água): sem imagem, a curva continua existindo e vira divisória. Sem ela, a
 * seção perderia o gesto que a liga à peça impressa.
 */
describe("MenuSection", () => {
  it("mantém a curva fora da árvore de acessibilidade e sem texto", () => {
    const { container } = render(
      <MenuSection title="Sobremesas" subtitle="Sempre disponíveis.">
        <p>conteúdo</p>
      </MenuSection>,
    );
    const curva = container.querySelector("[data-curva]");
    expect(curva).not.toBeNull();
    expect(curva).toHaveAttribute("aria-hidden", "true");
    expect(curva).toHaveTextContent("");
  });

  it("desenha a curva mesmo sem foto", () => {
    const { container } = render(
      <MenuSection title="Café e água">
        <p>conteúdo</p>
      </MenuSection>,
    );
    expect(container.querySelector("[data-curva]")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("põe o título num cabeçalho de seção e mostra a foto quando existe", () => {
    render(
      <MenuSection
        title="Sucos"
        photo={{ src: "/bebidas/suco.webp", alt: "Três copos de suco" }}
      >
        <p>conteúdo</p>
      </MenuSection>,
    );
    expect(
      screen.getByRole("heading", { name: "Sucos", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Três copos de suco")).toBeInTheDocument();
  });
});
