import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Duas linhas de configuração, dois problemas de natureza diferente.
 *
 * **`poweredByHeader: false`.** O Next envia `X-Powered-By: Next.js` em toda
 * resposta, dizendo a qualquer um com que tecnologia o site foi feito — o que
 * poupa a primeira metade do trabalho de quem procura uma falha conhecida de
 * versão. A Vercel remove o cabeçalho na borda, então medindo o site publicado
 * ele não aparece e o problema fica invisível; medindo o servidor local,
 * aparece. Ou seja: **a proteção vinha da hospedagem, não do código**, e sair
 * da Vercel a traria de volta sem nada acusar.
 *
 * Por isso a verificação é da CONFIGURAÇÃO e não do navegador: um teste que
 * pedisse a página publicada passaria verde mesmo sem a correção.
 *
 * **`formats: ["image/avif", "image/webp"]`.** Sem isto o `next/image` serve só
 * WebP. AVIF costuma sair 20% a 30% menor na mesma qualidade, e o navegador que
 * não o entende recebe WebP pela negociação normal de conteúdo — não há a quem
 * prejudicar. Num site cujo conteúdo é foto de comida, é o ajuste de maior
 * retorno por linha escrita.
 */
const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");

/** Sem comentários: a explicação acima cita as duas chaves. */
const semComentarios = config
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");

describe("a configuração do Next", () => {
  it("não anuncia com que tecnologia o site foi feito", () => {
    expect(semComentarios).toMatch(/poweredByHeader:\s*false/);
  });

  it("oferece AVIF antes de WebP", () => {
    // A ordem importa: o Next tenta os formatos na ordem declarada.
    const formats = semComentarios.match(/formats:\s*\[([^\]]*)\]/);
    expect(formats, "`formats` não declarado em `images`").not.toBeNull();
    const lista = formats![1]!.match(/"[^"]+"/g) ?? [];
    expect(lista).toEqual(['"image/avif"', '"image/webp"']);
  });

  it("continua lendo o arquivo certo — senão as duas checagens acima são vazias", () => {
    // Sentinela: um caminho errado devolveria string vazia, e `toMatch` falharia
    // por motivo errado enquanto um teste mal escrito passaria.
    expect(semComentarios).toContain("export default");
    expect(semComentarios.length).toBeGreaterThan(500);
  });
});
