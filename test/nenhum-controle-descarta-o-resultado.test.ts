import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * O padrão que engolia a falha não pode voltar por um arquivo novo.
 *
 * `test/painel-nao-engole-a-falha.test.tsx` cobra o COMPORTAMENTO de um botão.
 * Esta guarda cobra o MECANISMO em todo o painel, e existe porque o defeito
 * nasceu de cópia: a mesma dança de dez linhas escrita sete vezes, sete vezes
 * errada. Consertar os sete e não guardar o padrão é convidar o oitavo.
 *
 *     startTransition(async () => {
 *       await acao(id);
 *       router.refresh();
 *     });
 *
 * `startTransition` **descarta o valor de retorno do callback por construção**.
 * O `{ ok }` que a ação devolve morre ali, uma rejeição não é capturada por
 * nada, e `router.refresh()` roda igual no sucesso e no fracasso.
 *
 * A conversa com o servidor mora em `use-admin-action.ts`. Um controle novo que
 * precise dela chama o gancho; um que use `startTransition` por conta própria
 * falha aqui e a pessoa decide o que fazer, em vez de o defeito entrar calado.
 */
const RAIZ = join(process.cwd(), "src", "components", "admin");
const AJUDANTE = "src/components/admin/use-admin-action.ts";

function arquivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) return arquivos(caminho);
    return /\.tsx?$/.test(extname(entrada.name) ? entrada.name : "") ? [caminho] : [];
  });
}

/**
 * Sem comentários: esta própria guarda cita `startTransition` na explicação
 * acima, e três guardas deste projeto já falharam casando com a própria
 * documentação. Comentário descreve o defeito; código é que o comete.
 */
const semComentarios = (texto: string) =>
  texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("nenhum controle do painel descarta o resultado da ação", () => {
  const componentes = arquivos(RAIZ).map((c) =>
    relative(process.cwd(), c).split(sep).join("/"),
  );

  it("varreu de fato os componentes do painel", () => {
    // Sentinela: um caminho errado faria a varredura passar sobre lista vazia.
    expect(componentes.length).toBeGreaterThan(10);
  });

  it("ninguém usa startTransition para falar com o servidor", () => {
    const infratores = componentes.filter((caminho) =>
      /startTransition|useTransition/.test(
        semComentarios(readFileSync(join(process.cwd(), caminho), "utf8")),
      ),
    );
    expect(infratores, infratores.join("\n")).toEqual([]);
  });

  it("o gancho que centraliza a conversa continua existindo", () => {
    // Sem esta, apagar `use-admin-action.ts` deixaria a varredura acima verde e
    // o painel sem lugar nenhum para tratar a falha.
    const fonte = readFileSync(join(process.cwd(), AJUDANTE), "utf8");
    expect(fonte).toContain("export function useAdminAction");
    // As três garantias, cobradas pela forma: só recarrega no sucesso, captura
    // a rejeição, e destrava o controle no fim.
    expect(fonte).toMatch(/if \(res\.ok\)/);
    expect(fonte).toMatch(/catch/);
    expect(fonte).toMatch(/finally/);
  });
});
