import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import mensagens from "@/messages/pt.json";

/**
 * O visitante baixava o catálogo do painel administrativo.
 *
 * `NextIntlClientProvider` **sem a prop `messages`** serializa o catálogo
 * INTEIRO no payload de toda página. A namespace `admin` é 10.815 bytes — 45%
 * do catálogo — de textos de login, erros do Evolution, confirmações de exclusão
 * e dicas de campo do cardápio. Baixados por quem só quer ver o cardápio, e de
 * novo a cada navegação interna.
 *
 * Não é um problema de segurança: são rótulos de interface, não dados. É peso
 * morto — e peso morto num site de restaurante é o celular de quem está parado
 * na calçada decidindo onde almoçar.
 *
 * O painel continua recebendo o catálogo completo: ele monta o próprio provedor,
 * dentro do layout dele e da página de login.
 *
 * ⚠️ A verificação é por leitura da fonte, e não por navegador, porque este
 * projeto ainda não tem suíte de navegador. O projeto irmão cobre o mesmo ponto
 * pedindo três páginas ao servidor e conferindo o HTML entregue, que é mais
 * forte: lá a prop pode existir e estar errada. Quando houver navegador aqui,
 * esta guarda deve ser promovida.
 */
const RAIZ = join(process.cwd(), "src/app/[locale]");
const ler = (relativo: string) => readFileSync(join(RAIZ, relativo), "utf8");

const semComentarios = (texto: string) =>
  texto.replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\/.*$/gm, "");

describe("o catálogo que o visitante baixa", () => {
  const layoutRaiz = semComentarios(ler("layout.tsx"));

  it("a namespace do painel é grande o bastante para valer a separação", () => {
    // Sentinela do PORQUÊ: se um dia o painel encolher a ponto de não valer a
    // complexidade de dois provedores, este teste falha e alguém revisa a
    // decisão em vez de mantê-la por inércia.
    const admin = JSON.stringify((mensagens as Record<string, unknown>).admin);
    const tudo = JSON.stringify(mensagens);
    expect(admin.length).toBeGreaterThan(4000);
    expect(admin.length / tudo.length).toBeGreaterThan(0.2);
  });

  it("o provedor da raiz declara messages, em vez de mandar tudo", () => {
    const provedor = layoutRaiz.match(/<NextIntlClientProvider[^>]*>/);
    expect(provedor, "provedor não encontrado no layout da raiz").not.toBeNull();
    expect(
      provedor![0],
      "sem a prop `messages`, o next-intl serializa o catálogo inteiro",
    ).toMatch(/messages=\{/);
  });

  it("o que ele manda exclui a namespace do painel", () => {
    // Aceita as duas formas de excluir — descarte por desestruturacao ou
    // filtro explicito. O que a guarda cobra e o RESULTADO: a namespace do
    // painel fora do que vai para o cliente.
    expect(layoutRaiz).toMatch(/admin:\s*\w+\s*,\s*\.\.\.|!==\s*"admin"/);
    // E o provedor nao pode receber o catalogo inteiro direto.
    expect(layoutRaiz).not.toMatch(/messages=\{await getMessages\(\)\}/);
  });

  it("o painel monta o próprio provedor, com o catálogo completo", () => {
    // Sem isto, a separação acima quebraria o painel silenciosamente: os
    // rótulos sumiriam e o next-intl imprimiria a CHAVE no lugar do texto, sem
    // erro em build nem em typecheck.
    for (const arquivo of ["admin/(dashboard)/layout.tsx", "admin/login/page.tsx"]) {
      const fonte = semComentarios(ler(arquivo));
      expect(fonte, `${arquivo} não monta provedor`).toMatch(
        /<NextIntlClientProvider[^>]*messages=\{/,
      );
      expect(fonte, `${arquivo} não pede o catálogo completo`).toMatch(
        /getMessages\(\)/,
      );
    }
  });
});
