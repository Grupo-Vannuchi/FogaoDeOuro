import { formatBRL } from "@/config/menu";

/**
 * Uma linha do cardápio, no desenho da peça impressa:
 *
 *     NOME DO ITEM ····························· R$ 16,00
 *     observação miúda
 *
 * ── Por que caixa alta em Geist, e não na gótica ──────────────────────────
 *
 * A `font-serif` deste projeto é a Grenze Gotisch, uma **Textura** tirada do
 * letreiro da Rua Frei Gaspar. Maiúscula de Textura é desenho ornamental, não
 * letra de leitura: "SUCO NATURAL · JARRA" em gótica vira um emaranhado no
 * celular.
 *
 * A peça impressa resolve do mesmo jeito — display no título da seção,
 * sem-serifa em caixa alta no item. Isto não troca tipografia; usa cada fonte
 * onde a peça usa.
 *
 * ── O fio ─────────────────────────────────────────────────────────────────
 *
 * `flex-1` entre nome e preço, com borda pontilhada. `self-end` mais uma
 * margem em `em` o assentam na linha de base: um elemento vazio não tem linha
 * de base própria, então `items-baseline` sozinho o jogaria para o topo.
 *
 * `aria-hidden` porque é decoração. Sem isso, um leitor de tela anuncia ruído
 * entre o prato e o valor.
 *
 * ── Quebra em tela estreita ───────────────────────────────────────────────
 *
 * `min-w-0` no nome o deixa quebrar em duas linhas em vez de empurrar o preço
 * para fora. O fio acompanha a última linha (é `self-end`), e o preço não
 * encolhe — nunca desce sozinho para uma linha órfã.
 */
export function MenuLine({
  name,
  price,
  note,
}: {
  name: string;
  price: number;
  note?: string;
}) {
  return (
    <li className="py-3">
      <div className="flex items-baseline gap-2">
        <span className="min-w-0 font-sans text-sm font-semibold uppercase tracking-wide text-brand sm:text-base">
          {name}
        </span>
        <span
          aria-hidden
          data-fio
          className="mb-[0.3em] min-w-4 flex-1 self-end border-b border-dotted border-brand/40"
        />
        <span className="shrink-0 font-sans text-sm font-semibold tabular-nums text-brand sm:text-base">
          {formatBRL(price)}
        </span>
      </div>
      {note ? (
        <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>
      ) : null}
    </li>
  );
}
