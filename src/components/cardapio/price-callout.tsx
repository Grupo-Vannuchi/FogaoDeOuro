import { Scale, UtensilsCrossed } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { formatBRL, menuPricing } from "@/config/menu";

/**
 * Os dois preços do cardápio, lado a lado.
 *
 * Ficam juntos e logo abaixo do título porque é a primeira pergunta de quem
 * senta na mesa, e separados porque são duas contas diferentes: o buffet é
 * cobrado por peso, a massa tem valor fechado. Misturar os dois números num
 * bloco só é exatamente o mal-entendido que este componente existe para evitar.
 *
 * Nenhum prato exibe preço em lugar nenhum do site — o valor é sempre da
 * seção, nunca do item.
 */
export async function PriceCallout({ compact = false }: { compact?: boolean }) {
  const t = await getTranslations("cardapio");

  const cards = [
    {
      icon: Scale,
      label: t("buffetLabel"),
      price: `${formatBRL(menuPricing.buffetPerKg)}/kg`,
      note: t("buffetNote"),
    },
    {
      icon: UtensilsCrossed,
      label: t("pastaLabel"),
      price: formatBRL(menuPricing.pasta),
      note: t("pastaNote"),
    },
  ];

  return (
    <div
      // Duas colunas em TODA largura desde 25/09, a pedido do cliente — era
      // uma coluna no celular e duas a partir do `sm`. Em 360px cada cartão
      // fica com cerca de 160px, e o texto precisa caber: se um rótulo novo
      // estourar, encurte o rótulo em vez de voltar a empilhar.
      className="grid grid-cols-2 gap-3 sm:gap-4"
    >
      {cards.map((card) => (
        <div
          key={card.label}
          // `text-card-foreground`: os textos aqui dentro já têm cor própria
          // (`text-muted-foreground`/`text-brand`), então isto é defensivo —
          // mas todo `bg-card` da página do cardápio ganhou o mesmo fixador
          // desde que o fundo escuro da v11 (`MenuBackdrop`) inverteu o texto
          // solto para creme.
          // Vertical no celular, horizontal a partir do `sm`. Com duas
          // colunas em 360px sobram ~114px de texto por cartão, e o ícone de
          // 44px na mesma linha comia 40% disso: o preço quebrava no meio e o
          // texto saía uma palavra por linha. Empilhado, a largura inteira
          // fica para o número, que é o que a pessoa veio ver.
          className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 text-card-foreground sm:flex-row sm:gap-4 sm:p-5"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <card.icon className="size-5" aria-hidden />
          </span>
          <div className="w-full min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            {/* Um degrau abaixo do que era (`text-2xl`), a pedido do cliente
                em 09/09: o número gritava mais alto que o nome do que se está
                comprando. Continua em serifa, negrito e na cor da marca — ele
                segue sendo a primeira coisa que se acha no card, só não é mais
                a primeira coisa que se vê na página. */}
            <p className="font-serif text-xl font-bold tabular-nums text-brand">
              {card.price}
            </p>
            {/* Colado no número, a pedido do cliente em 10/09. Estava embaixo
                dos dois cards e passava como rodapé do bloco; aqui a ressalva
                fica onde ela vale, e o olho que leu o valor lê a condição no
                mesmo movimento. Repetida nos dois porque são duas contas
                diferentes — o quilo e a porção fechada. */}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("subjectToChange")}
            </p>
            {/* `hidden sm:block`: a nota é a única coisa que não cabe em duas
                colunas num celular pequeno. Escondê-la ali não perde
                informação — a mesma explicação está no subtítulo da seção de
                cada preço, logo abaixo. */}
            {compact ? null : (
              <p className="mt-1 hidden text-pretty text-sm text-muted-foreground sm:block">
                {card.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
