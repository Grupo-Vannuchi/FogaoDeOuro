import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DishView } from "@/lib/queries";

/**
 * Card de um prato na grade do cardápio digital.
 *
 * Deitado no celular, em pé a partir do tablet. Não é enfeite: um dia de
 * cardápio tem até quatorze pratos, e no formato em pé cada card ocupa meia
 * tela — a página passava de oito mil pixels e achar um prato virava rolagem.
 * Deitado, o mesmo dia cabe em poucas telas e a foto continua reconhecível.
 *
 * O card inteiro é o link, não um botão dentro dele: quem lê isso está no
 * celular, na mesa, e um alvo do tamanho do card erra menos que um "ver mais"
 * de oitenta pixels.
 *
 * Sem preço, e não por esquecimento — o buffet é cobrado por peso e as massas
 * têm valor único de seção. Um número no card faria o cliente somar pratos.
 */
export async function DishCard({
  dish,
  priority = false,
}: {
  dish: DishView;
  /** Só para os primeiros cards da primeira aba: eles são o LCP no celular. */
  priority?: boolean;
}) {
  const t = await getTranslations("cardapio");

  return (
    <Link
      href={`/cardapio/${dish.slug}`}
      className="group flex h-full gap-4 overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-brand focus-visible:border-brand focus-visible:outline-none sm:flex-col sm:gap-0"
    >
      {dish.image ? (
        <Image
          src={dish.image}
          alt={t("dishImageAlt", { name: dish.name })}
          width={640}
          height={480}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 112px"
          className="size-28 shrink-0 object-cover sm:aspect-[4/3] sm:size-auto sm:w-full"
        />
      ) : (
        /* Muitos pratos ainda não têm foto. O lugar dela é marcado com a cor da
           marca em vez de ficar vazio, para a grade não desalinhar. */
        <div
          aria-hidden
          className="flex size-28 shrink-0 flex-col items-center justify-center gap-1.5 bg-brand/10 text-brand sm:aspect-[4/3] sm:size-auto sm:w-full sm:gap-2"
        >
          <UtensilsCrossed className="size-6 sm:size-8" />
          <span className="hidden text-xs font-medium sm:block">{t("noPhoto")}</span>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1 py-3 pr-4 sm:gap-1.5 sm:p-5">
        <h3 className="font-serif text-base font-bold leading-snug sm:text-lg">
          {dish.name}
        </h3>
        {dish.description ? (
          <p className="line-clamp-2 text-pretty text-sm text-muted-foreground sm:line-clamp-none">
            {dish.description}
          </p>
        ) : null}
        <span className="mt-auto pt-1.5 text-sm font-medium text-brand group-hover:underline sm:pt-3">
          {t("seeDish")}
        </span>
      </div>
    </Link>
  );
}
