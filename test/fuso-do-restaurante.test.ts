import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

import { restaurantDateFormat } from "@/lib/dates";

/**
 * Data mostrada a uma pessoa sai no fuso do restaurante, nunca no do servidor.
 *
 * `new Intl.DateTimeFormat(locale, …)` e `data.toLocaleDateString(…)` — sem
 * `timeZone` — formatam no fuso do **processo**. Na Vercel o processo roda em
 * UTC, e Santos é UTC−3: um lead recebido às 22h de terça aparece no painel
 * como quarta-feira. A notificação por WhatsApp já fixava `America/Sao_Paulo`
 * desde sempre, então as duas superfícies discordavam sobre o mesmo lead — o
 * WhatsApp dizia terça, o painel dizia quarta.
 *
 * O defeito é invisível em desenvolvimento: a máquina de quem programa está em
 * São Paulo, onde os dois fusos coincidem. Só a produção erra. Por isso a
 * asserção abaixo não depende do fuso de quem roda o teste — ela fixa um
 * instante conhecido e cobra o dia de Santos.
 *
 * ⚠️ A varredura cobre **os dois caminhos**, e isso não é excesso de zelo: o
 * feed do Instagram, escrito em 27/08, chegou pelo `toLocaleDateString` — a
 * porta que a versão original desta guarda, no projeto irmão, deixava aberta.
 * Uma guarda que fecha só a porta pela qual o defeito entrou da primeira vez
 * não impede a segunda.
 */
const RAIZ_SRC = join(process.cwd(), "src");
const CAMINHO_DO_AJUDANTE = join("src", "lib", "dates.ts");

/**
 * Isenções, cada uma com a razão escrita.
 *
 * A varredura casa `.toLocaleString(` sem saber se quem recebe é uma data ou um
 * número — os dois métodos têm o mesmo nome. Nenhuma análise estática resolve
 * isso, então a decisão fica aqui, à vista, e um arquivo novo tem de ser
 * julgado em vez de entrar calado.
 */
const ISENTOS: Record<string, string> = {
  // Número, não data: o contador animado da home. Ainda assim ele precisou de
  // conserto — estava sem locale nenhum, e o do ambiente não é pt-BR.
  "src/components/ui/count-up.tsx": "formata NÚMERO, com o locale explícito",
};

/** As duas formas de formatar data herdando o fuso do processo em silêncio. */
const FORMATADORES_SOLTOS =
  /new\s+Intl\.DateTimeFormat\s*\(|\.toLocale(?:Date|Time)?String\s*\(/;

function arquivosDeCodigo(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) return arquivosDeCodigo(caminho);
    return /\.tsx?$/.test(entrada.name) ? [caminho] : [];
  });
}

/** Sem comentários: uma API citada numa explicação não é uma chamada. */
const semComentarios = (texto: string) =>
  texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("o fuso do restaurante", () => {
  it("fixa America/Sao_Paulo mesmo quando ninguém pede", () => {
    const fmt = restaurantDateFormat("pt-BR", { dateStyle: "medium" });
    expect(fmt.resolvedOptions().timeZone).toBe("America/Sao_Paulo");
  });

  it("não deixa o chamador trocar o fuso por engano", () => {
    // Passar `timeZone` não deve vencer: o ponto do ajudante é ser o único
    // lugar onde esse valor é decidido.
    const fmt = restaurantDateFormat("pt-BR", {
      dateStyle: "medium",
      timeZone: "UTC",
    });
    expect(fmt.resolvedOptions().timeZone).toBe("America/Sao_Paulo");
  });

  it("mostra o dia de Santos, não o dia de UTC", () => {
    // 21/08/2026 às 23h30 em Santos == 22/08/2026 às 02h30 em UTC.
    // Um lead recebido nesse instante é de sexta-feira, dia 21.
    const instante = new Date("2026-08-22T02:30:00.000Z");
    const rotulo = restaurantDateFormat("pt-BR", { dateStyle: "medium" }).format(
      instante,
    );

    expect(rotulo).toContain("21");
    expect(rotulo).not.toContain("22");
  });

  it("é o único lugar em src/ que formata data por conta própria", () => {
    const infratores = arquivosDeCodigo(RAIZ_SRC)
      .filter((caminho) => relative(process.cwd(), caminho) !== CAMINHO_DO_AJUDANTE)
      .filter((caminho) =>
        FORMATADORES_SOLTOS.test(semComentarios(readFileSync(caminho, "utf8"))),
      )
      .map((caminho) => relative(process.cwd(), caminho).split(sep).join("/"))
      .filter((caminho) => !(caminho in ISENTOS));

    expect(infratores, infratores.join("\n")).toEqual([]);
  });

  it("toda isenção aponta para um arquivo que existe e ainda formata algo", () => {
    // Sem isto a lista vira depósito: uma isenção de arquivo apagado ou já
    // corrigido fica ali para sempre, sugerindo que o problema continua.
    for (const [caminho, razao] of Object.entries(ISENTOS)) {
      const texto = semComentarios(readFileSync(join(process.cwd(), caminho), "utf8"));
      expect(FORMATADORES_SOLTOS.test(texto), `${caminho} (${razao})`).toBe(true);
    }
  });

  it("continua havendo código em src/ para varrer — senão a guarda não guarda", () => {
    // Sentinela: um caminho errado faria a varredura acima passar sobre nada.
    expect(arquivosDeCodigo(RAIZ_SRC).length).toBeGreaterThan(50);
  });
});
