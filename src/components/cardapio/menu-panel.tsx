import { Container } from "@/components/ui/container";

/**
 * Uma seção do cardápio sobre a arte de fundo.
 *
 * ── Sem cartão em volta da seção ──────────────────────────────────────────
 *
 * A primeira versão embrulhava cada seção num cartão creme com borda e
 * sombra. O cliente pediu "algo mais natural", e tinha razão: sobre uma arte
 * que já tem textura e blocos, mais uma moldura por seção empilha caixa
 * dentro de caixa, e o cardápio vira formulário.
 *
 * Quem tem superfície própria são as listas — o `ul` de pratos, os cards de
 * preço, o carrossel. A seção respira direto sobre a madeira.
 *
 * A coluna estreita continua: cardápio é lido de cima a baixo, e `max-w-3xl`
 * mantém a linha na faixa confortável — e, de quebra, longe dos blocos de
 * couro, que moram nos cantos da arte.
 */
export function MenuPanel({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-12 sm:py-16">
      <Container className="max-w-3xl">{children}</Container>
    </section>
  );
}

/**
 * A faixa marrom do título da seção.
 *
 * ── Isto não é o cartão recusado, e a diferença importa ───────────────────
 *
 * Uma versão de 10/09 punha uma chapa **creme** atrás do cabeçalho para
 * salvar o contraste do subtítulo sobre a madeira. Aquilo era remendo: lia
 * como caixa flutuando, e o problema real era a cor do texto, corrigida
 * depois no token `--muted-foreground`.
 *
 * Esta faixa é outra coisa. Ela vem da peça impressa da casa, onde cada
 * seção do cardápio abre com um retângulo marrom escuro e o nome em branco.
 * É elemento de design do cliente, não conserto de acessibilidade — e por
 * isso ela pode existir sem contradizer o "algo mais natural": o que ele
 * recusou foi moldura em volta do conteúdo, não o letreiro da seção.
 *
 * ── As cores ──────────────────────────────────────────────────────────────
 *
 * Amostradas do próprio arquivo da arte, não escolhidas: #7F3923 é o couro
 * iluminado e #5E2B1F o couro na sombra. O gradiente entre os dois devolve o
 * volume que o couro tem na peça, sem precisar da textura.
 *
 * Branco sobre eles dá 8,36:1 e 11,41:1 — ver `HEADER_TONES` em `ui/section`,
 * que carrega a medição do texto.
 */
export function MenuHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl px-6 py-7 shadow-sm sm:px-10 sm:py-9"
      style={{
        background: "linear-gradient(135deg, #7F3923 0%, #5E2B1F 100%)",
      }}
    >
      {children}
    </div>
  );
}
