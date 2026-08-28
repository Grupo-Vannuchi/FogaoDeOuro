import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";

/**
 * A página de endereço não encontrado estava inteira em inglês.
 *
 * `lang="en"`, "404. Not found", "This page could not be found.", "Back to
 * home" — o texto que o Next entrega por padrão, nunca trocado. Num
 * restaurante do Centro de Santos, cujo site é português por decisão de
 * projeto, quem digita o endereço errado cai numa página noutro idioma.
 *
 * O `lang` errado não é detalhe de etiqueta: é o atributo que faz o leitor de
 * tela escolher a voz e a pronúncia. Com `en`, "404. Not found" sai com sotaque
 * inglês — e sairia igual se o texto estivesse em português.
 *
 * Ela vive ACIMA da raiz de locale, então desenha o próprio documento e não
 * alcança o next-intl nem o CSS do site. O texto fica fixo em português (o site
 * tem um idioma só) e as cores vêm de `siteConfig`, para não virar mais um
 * lugar com hexadecimal copiado — o azul que estava ali, `#4f46e5`, não tem
 * relação nenhuma com a marca.
 */
const fonte = readFileSync(join(process.cwd(), "src/app/not-found.tsx"), "utf8");

/** Sem comentários: a explicação acima cita as frases em inglês. */
const semComentarios = fonte
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");

describe("a página de endereço não encontrado", () => {
  it("se declara em português", () => {
    expect(semComentarios).toMatch(/lang="pt-BR"/);
    expect(semComentarios).not.toMatch(/lang="en"/);
  });

  it("não deixou texto em inglês para trás", () => {
    for (const frase of ["Not found", "could not be found", "Back to home"]) {
      expect(semComentarios, `sobrou "${frase}"`).not.toContain(frase);
    }
  });

  it("usa as cores da marca, e não um hexadecimal avulso", () => {
    // O azul original não vinha de lugar nenhum do projeto.
    expect(semComentarios).not.toContain("#4f46e5");
    expect(semComentarios).toContain("siteConfig");
    // Sentinela: importar `siteConfig` e não usar passaria na linha acima.
    expect(semComentarios).toMatch(/siteConfig\.theme/);
  });

  it("as cores que ela usa existem de fato nos DOIS temas", () => {
    // Sem isto, um nome de token errado renderizaria `undefined` e a página
    // sairia sem cor nenhuma — silenciosamente. Este site tem tema claro e
    // escuro, e a página desenha o próprio documento: se ignorasse o escuro,
    // piscaria branco na cara de quem está no escuro.
    for (const tema of ["light", "dark"] as const) {
      for (const token of ["background", "foreground", "brand"] as const) {
        expect(siteConfig.theme[tema][token], `${tema}.${token}`).toMatch(
          /^#[0-9a-fA-F]{6}$/i,
        );
      }
    }
    expect(semComentarios).toContain("prefers-color-scheme: dark");
  });
});
