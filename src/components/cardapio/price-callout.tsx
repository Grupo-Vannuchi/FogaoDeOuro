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
          className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <card.icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="font-serif text-2xl font-bold tabular-nums text-brand">
              {card.price}
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
