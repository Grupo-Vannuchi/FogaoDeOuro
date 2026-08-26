import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

import { PageHeader } from "@/components/page-header";
import { renderWithIntl, screen } from "./test-utils";

/**
 * O título da página não pode esperar o JavaScript para existir.
 *
 * `Reveal` renderiza no servidor sempre com `data-visible="false"`, e o CSS dá
 * `opacity: 0` a tudo que tem `[data-reveal]`. O `PageHeader` envolvia o `<h1>`
 * e o subtítulo nisso — então a faixa de topo inteira só aparecia depois de
 * baixar o JavaScript, hidratar e o observador de interseção disparar.
 *
 * Medido no site publicado, em celular médio em 4G com a CPU quatro vezes mais
 * lenta, contando só DEPOIS de confirmar que a folha de estilo já estava
 * aplicada:
 *
 *   /contato   3.080 ms
 *   /galeria   5.638 ms
 *
 * ⚠️ A primeira tentativa de medir isto deu o resultado OPOSTO — 52 ms — e
 * quase virou prova de que não havia defeito. O erro: medir "o título tem
 * opacidade 1" é verdade em dois momentos, depois da animação E antes de a
 * folha de estilo chegar, quando a regra que esconde ainda não existe. A
 * medição válida só começa a contar depois de confirmar o CSS aplicado.
 *
 * A revelação ao rolar continua nas seções de baixo, onde ela é o que promete
 * ser: um efeito para conteúdo que a pessoa ainda não alcançou.
 */
describe("o topo das páginas internas", () => {
  it("mostra o título sem depender de JavaScript", () => {
    renderWithIntl(<PageHeader title="Galeria" subtitle="Fotos da casa" />);

    const titulo = screen.getByRole("heading", { level: 1 });
    expect(titulo).not.toHaveAttribute("data-reveal");
    expect(titulo).not.toHaveAttribute("data-visible");
  });

  it("mostra o subtítulo junto, pelo mesmo motivo", () => {
    renderWithIntl(<PageHeader title="Galeria" subtitle="Fotos da casa" />);

    expect(screen.getByText("Fotos da casa")).not.toHaveAttribute("data-reveal");
  });

  it("continua sendo o cabeçalho — senão a guarda não guarda", () => {
    renderWithIntl(<PageHeader title="Galeria" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Galeria");
  });
});

describe("a revelação ao rolar", () => {
  const RAIZ = join(process.cwd(), "src", "components");

  const arquivos = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const caminho = join(dir, e.name);
      if (e.isDirectory()) return arquivos(caminho);
      return e.name.endsWith(".tsx") ? [caminho] : [];
    });

  it("nunca envolve um h1", () => {
    const comH1 = arquivos(RAIZ)
      .filter((c) => /<Reveal[^>]*as="h1"/.test(readFileSync(c, "utf8")))
      .map((c) => relative(process.cwd(), c).split(sep).join("/"));

    expect(comH1).toEqual([]);
  });

  it("continua sendo usada em algum lugar", () => {
    expect(arquivos(RAIZ).filter((c) => /<Reveal/.test(readFileSync(c, "utf8"))).length)
      .toBeGreaterThan(0);
  });
});
