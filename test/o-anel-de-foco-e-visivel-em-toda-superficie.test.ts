import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";

/**
 * O anel de foco tem de ser visível, e em quinze lugares ele era apagado.
 *
 * Dois defeitos, e o segundo é mais grave que o primeiro.
 *
 * **1. Quinze componentes escreviam `focus-visible:outline-none`.** A regra
 * global de `globals.css` desenha o contorno; uma classe de utilitário apagando
 * o contorno vence essa regra por precedência de camada. A maioria não punha
 * nada no lugar — trocava a cor da borda do campo, que é substituto fraco e às
 * vezes sem contraste nenhum. Critério WCAG 2.4.7.
 *
 * **2. O contorno era `--color-brand`, e a marca também é cor de FUNDO.** Sobre
 * um botão primário, marca sobre marca dá 1,00:1: o contorno existia e ninguém
 * via onde estava.
 *
 * ⚠️ E aqui a saída do projeto irmão não serve. Lá bastou trocar o contorno por
 * `--foreground`, que passa nas seis superfícies daquele site. **Neste não
 * existe cor única que passe**: a marca (`#8A5206`) e o accent (`#E04F26`) são
 * tons médios, então um contorno escuro reprova sobre eles (1,49 e 2,41) e um
 * claro reprova sobre o fundo creme. Copiar a solução de lá teria trocado um
 * defeito por outro, e o teste é que mostrou isso.
 *
 * A saída é o anel duplo: contorno na cor do texto mais uma folga na cor do
 * fundo, adjacentes. Sobre superfície clara some a folga e aparece o contorno;
 * sobre superfície escura ou saturada, o contrário. **Basta uma das duas
 * alcançar 3:1**, e sempre alcança.
 */
const MINIMO = 3;

function luminancia(hex: string): number {
  const c = hex.replace("#", "");
  const canais = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canais.map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contraste(a: string, b: string): number {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (maior! + 0.05) / (menor! + 0.05);
}

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const semComentarios = (texto: string) =>
  texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

/** Tokens neutros lidos do próprio CSS, para o teste não guardar cópia deles. */
function token(nome: string): string {
  const achado = css.match(new RegExp("--" + nome + ":[^#]*(#[0-9a-fA-F]{3,8})"));
  expect(achado, `token --${nome} não encontrado em globals.css`).not.toBeNull();
  return achado![1]!;
}

/** Toda superfície sobre a qual um controle focável pode aparecer. */
function superficies(tema: "light" | "dark"): Record<string, string> {
  const p = siteConfig.theme[tema];
  const base = { fundo: p.background, marca: p.brand, acento: p.accent };
  // Os neutros só existem no tema claro do CSS; no escuro o fundo já cobre.
  return tema === "light"
    ? { ...base, cartao: token("card"), muted: token("muted") }
    : base;
}

function arquivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) return arquivos(caminho);
    return /\.tsx?$/.test(entrada.name) ? [caminho] : [];
  });
}

describe("o anel de foco", () => {
  it("é um anel duplo, não uma cor só", () => {
    const regra = semComentarios(css).match(/:focus-visible\s*\{([^}]*)\}/);
    expect(regra, "regra :focus-visible não encontrada").not.toBeNull();
    const corpo = regra![1]!;
    expect(corpo, "falta o contorno").toMatch(/outline:[^;]*var\(--color-foreground\)/);
    expect(corpo, "falta a folga que aparece sobre superfície escura").toMatch(
      /box-shadow:[^;]*var\(--color-background\)/,
    );
  });

  for (const tema of ["light", "dark"] as const) {
    it(`alcança 3:1 em toda superfície do tema ${tema}`, () => {
      const p = siteConfig.theme[tema];
      for (const [nome, fundo] of Object.entries(superficies(tema))) {
        const contorno = contraste(p.foreground, fundo);
        const folga = contraste(p.background, fundo);
        const melhor = Math.max(contorno, folga);
        expect(
          melhor,
          `${tema}/${nome}: contorno ${contorno.toFixed(2)}, folga ${folga.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(MINIMO);
      }
    });
  }

  it("uma cor só NÃO resolveria neste site — a medição que impede copiar a solução do projeto irmão", () => {
    // Sentinela invertida: se algum dia uma cor única passar em tudo, este
    // teste falha e alguém revisa a decisão em vez de mantê-la por inércia.
    const p = siteConfig.theme.light;
    const sup = Object.values(superficies("light"));
    for (const cor of [p.foreground, p.background, p.brand]) {
      const pior = Math.min(...sup.map((s) => contraste(cor, s)));
      expect(pior, `${cor} passaria sozinha em tudo`).toBeLessThan(MINIMO);
    }
  });

  it("ninguém desenha sombra ou anel próprio no foco", () => {
    /*
     * A folga do anel duplo é uma `box-shadow`. Qualquer `focus:shadow-*` ou
     * `focus-visible:ring-*` num componente vence essa regra por precedência de
     * camada (utilitário ganha de base) e apaga a folga — sobrando só o
     * contorno, que é justamente o que reprova sobre a marca e o accent.
     *
     * Foram quatro: a sombra do próprio link de pular, escrita hoje, e três
     * anéis herdados. Um deles pintava da MESMA cor do fundo do botão.
     */
    const infratores = arquivos(join(process.cwd(), "src"))
      .filter((c) =>
        /focus(-visible)?:(shadow|ring)/.test(
          semComentarios(readFileSync(c, "utf8")),
        ),
      )
      .map((c) => relative(process.cwd(), c).split(sep).join("/"));
    expect(infratores, infratores.join(" | ")).toEqual([]);
  });

  it("ninguém apaga o contorno global", () => {
    const infratores = arquivos(join(process.cwd(), "src"))
      .filter((c) => /outline-none/.test(semComentarios(readFileSync(c, "utf8"))))
      .map((c) => relative(process.cwd(), c).split(sep).join("/"));
    expect(infratores, infratores.join("\n")).toEqual([]);
  });
});
