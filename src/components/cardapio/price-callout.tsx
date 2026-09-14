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
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.label}
          // `text-card-foreground`: os textos aqui dentro já têm cor própria
          // (`text-muted-foreground`/`text-brand`), então isto é defensivo —
          // mas todo `bg-card` da página do cardápio ganhou o mesmo fixador
          // desde que o fundo escuro da v11 (`MenuBackdrop`) inverteu o texto
          // solto para creme.
          className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-card-foreground"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <card.icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
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
            {compact ? null : (
              <p className="mt-1 text-pretty text-sm text-muted-foreground">
                {card.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
