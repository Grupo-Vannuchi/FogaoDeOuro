import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import messages from "@/messages/pt.json";

/**
 * Quem navega por teclado atravessava o cabeçalho inteiro em toda página.
 *
 * O site não tinha link de pular para o conteúdo. Critério WCAG 2.4.1 (nível
 * A) — e a conta é concreta: são seis itens de menu, mais o menu suspenso de
 * novidades, mais o botão de contato. Quem usa só o teclado passava por todos
 * eles a cada página antes de chegar ao texto, e a cada navegação de novo.
 *
 * Duas metades, e uma sem a outra não serve:
 *
 * - **O link precisa APARECER ao receber foco.** `sr-only` sozinho o mantém
 *   invisível mesmo focado, e um link que ninguém vê nem com Tab não ajuda
 *   quem enxerga e navega por teclado — que é a maior parte de quem usa isso.
 * - **O destino precisa aceitar foco.** Sem `tabIndex={-1}` no `<main>`, o
 *   navegador rola a página até a âncora mas o foco continua no link: o Tab
 *   seguinte volta para o cabeçalho, e o pulo não pulou nada.
 *
 * ⚠️ Verificação por leitura da fonte: o layout é um Server Component
 * assíncrono, que este setup de Vitest/jsdom não renderiza. O projeto irmão
 * cobre o mesmo ponto no navegador, em sete rotas; aqui ainda não há suíte de
 * navegador, e um teste de fonte que existe vale mais que um de navegador que
 * não existe.
 */
const layout = readFileSync(
  join(process.cwd(), "src/app/[locale]/(marketing)/layout.tsx"),
  "utf8",
);

/** Sem comentários: a explicação do próprio layout cita as classes. */
const semComentarios = layout
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
  .replace(/\/\/.*$/gm, "");

describe("o link de pular para o conteúdo", () => {
  it("existe e aponta para uma âncora", () => {
    expect(semComentarios).toMatch(/href="#[a-z-]+"/);
  });

  it("fica visível quando recebe o foco", () => {
    // `sr-only` sem `focus:not-sr-only` é um link que ninguém vê nem com Tab.
    expect(semComentarios).toContain("sr-only");
    expect(semComentarios).toContain("focus:not-sr-only");
  });

  it("tem um destino que aceita foco", () => {
    const main = semComentarios.match(/<main[^>]*>/);
    expect(main, "não achei o <main>").not.toBeNull();
    expect(main![0]).toMatch(/id="[a-z-]+"/);
    // Sem isto o foco fica no link e o Tab seguinte volta ao cabeçalho.
    expect(main![0]).toMatch(/tabIndex=\{-1\}/);
  });

  it("o destino do link é o id do main, e não outro qualquer", () => {
    // Sentinela: os três testes acima passariam com o link apontando para uma
    // âncora que não existe na página.
    const destino = semComentarios.match(/href="#([a-z-]+)"/)![1];
    expect(semComentarios.match(/<main[^>]*>/)![0]).toContain(`id="${destino}"`);
  });

  it("o rótulo vem do catálogo, em português", () => {
    expect(semComentarios).toMatch(/t\("skipToContent"\)/);
    const rotulo = (messages as { nav: Record<string, string> }).nav
      .skipToContent;
    expect(rotulo, "chave nav.skipToContent ausente").toBeTruthy();
    expect(rotulo).toMatch(/conte[úu]do/i);
  });
});
