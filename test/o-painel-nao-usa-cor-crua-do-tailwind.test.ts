import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * O painel dizia o estado por cores que ninguém tinha medido.
 *
 * Vinte e nove usos de cor crua do Tailwind — `text-emerald-600` para publicado,
 * `text-red-500` para erro, `text-amber-600` para aviso. São cores desenhadas
 * para fundo branco, e o fundo deste site é um creme (`#EFE9C2`).
 *
 * Medidas contra as três superfícies do painel, **as cinco reprovam nas três**:
 *
 *     emerald-600   3,07  3,51  2,83
 *     red-600       3,93  4,50  3,62
 *     red-500       3,07  3,50  2,82
 *     amber-600     2,59  2,97  2,39
 *     amber-500     1,75  2,00  1,61
 *
 * Quinze combinações, quinze reprovações, contra o mínimo de 4,5:1 para texto.
 * A pior delas, `amber-500` sobre o muted, dá 1,61 — praticamente ilegível.
 *
 * Os tokens que entraram na sexta passam nas três: 5,25 / 5,86 / 5,54 no pior
 * caso de cada um. Eles não são "as mesmas cores renomeadas": foram escolhidos
 * medindo contra ESTE fundo.
 *
 * ⚠️ A varredura é por PADRÃO, não por lista de arquivos. A guarda equivalente
 * do projeto irmão falhou três vezes por ser estreita demais: pegava só
 * `text-*` enquanto o resto era `border-red-500`, depois só o que estava dentro
 * de `className=` enquanto o resto vivia numa constante, depois só uma pasta
 * enquanto oito casos viviam noutra. Aqui as duas pastas do painel entram, e
 * qualquer prefixo de utilitário conta.
 */
const PASTAS = ["src/components/admin", "src/app/[locale]/admin"];

const PREFIXOS = "text|bg|border|ring|fill|stroke|from|to|via|outline|divide|shadow";
const FAMILIAS =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|" +
  "purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";

/** `text-red-500`, `bg-emerald-500/10`, `border-amber-600` — com ou sem opacidade. */
const COR_CRUA = new RegExp(
  `\\b(${PREFIXOS})-(${FAMILIAS})-[0-9]{2,3}(/[0-9]{1,3})?\\b`,
  "g",
);

function arquivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) return arquivos(caminho);
    return /\.tsx?$/.test(entrada.name) ? [caminho] : [];
  });
}

/**
 * Sem comentários: a explicação acima cita cinco cores cruas pelo nome, e três
 * guardas deste projeto já falharam casando com a própria documentação.
 */
const semComentarios = (texto: string) =>
  texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("o painel não pinta estado com cor crua do Tailwind", () => {
  const alvos = PASTAS.flatMap((pasta) => arquivos(join(process.cwd(), pasta)));

  it("varreu as duas pastas do painel", () => {
    // Sentinela: a guarda equivalente do projeto irmão passou verde uma vez por
    // varrer só uma das duas pastas.
    expect(alvos.length).toBeGreaterThan(20);
    for (const pasta of PASTAS) {
      expect(
        alvos.some((a) => a.includes(pasta.split("/").join(sep))),
        `nada varrido em ${pasta}`,
      ).toBe(true);
    }
  });

  it("não sobrou nenhuma", () => {
    const achados: string[] = [];
    for (const caminho of alvos) {
      const encontradas = semComentarios(readFileSync(caminho, "utf8")).match(COR_CRUA);
      if (encontradas) {
        achados.push(
          `${relative(process.cwd(), caminho).split(sep).join("/")}: ${[
            ...new Set(encontradas),
          ].join(", ")}`,
        );
      }
    }
    expect(achados, achados.join("\n")).toEqual([]);
  });
});

/**
 * As cores que entraram no lugar precisam ser legíveis onde de fato aparecem.
 *
 * A varredura acima prova que a cor crua saiu. Não prova que o que entrou serve
 * — e o painel usa as três num padrão específico: etiqueta com o texto do token
 * sobre o MESMO token a 10% de opacidade (`text-success` em `bg-success/10`).
 * Uma troca futura de token pode passar na varredura e deixar a etiqueta
 * ilegível.
 */
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

/** Achata uma cor com opacidade sobre o fundo que estiver atras dela. */
function achatar(frente: string, fundo: string, alfa: number): string {
  const f = frente.replace("#", "");
  const b = fundo.replace("#", "");
  return (
    "#" +
    [0, 2, 4]
      .map((i) =>
        Math.round(
          parseInt(f.slice(i, i + 2), 16) * alfa +
            parseInt(b.slice(i, i + 2), 16) * (1 - alfa),
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

/** Le um token direto do CSS, para o teste nao guardar copia dele. */
function token(nome: string): string {
  const achado = css.match(new RegExp("--" + nome + ":[^#]*(#[0-9a-fA-F]{3,8})"));
  expect(achado, `token --${nome} nao encontrado`).not.toBeNull();
  return achado![1]!;
}

describe("as etiquetas de estado do painel sao legiveis", () => {
  const superficies = { cartao: token("card"), fundo: "#EFE9C2" };

  for (const nome of ["success", "danger", "warning"]) {
    for (const [ondeNome, onde] of Object.entries(superficies)) {
      it(`${nome} sobre ${nome}/10 no ${ondeNome}`, () => {
        const cor = token(nome);
        const fundoTinto = achatar(cor, onde, 0.1);
        const razao = contraste(cor, fundoTinto);
        expect(
          razao,
          `${razao.toFixed(2)}:1 — minimo 4,5 para texto`,
        ).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
