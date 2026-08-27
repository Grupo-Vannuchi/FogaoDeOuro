import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DishView } from "@/lib/queries";

/**
 * Uma linha do cardápio: nome, descrição, fio fino embaixo.
 *
 * Substituiu o card com foto. O buffet não tem — e não vai ter — fotografia por
 * prato: são dezenas de itens que mudam toda semana. Reservar espaço de imagem
 * para eles rendia uma página altíssima com marcadores repetidos onde deveria
 * haver comida, e obrigava a rolar muito para ler catorze pratos.
 *
 * A linha inteira leva à página do prato, mas sem "ver o prato" escrito: o CTA
 * repetido catorze vezes virava ruído, e a página existe de verdade — tem a
 * descrição completa, os dias e o preço da seção, além de título próprio na
 * busca. Tirar o texto e manter o destino resolve os dois lados.
 */
export async function DishRow({ dish }: { dish: DishView }) {
  const t = await getTranslations("cardapio");

  return (
    <li className="border-b border-border last:border-b-0">
      <Link
        href={`/cardapio/${dish.slug}`}
        aria-label={t("seeDishOf", { name: dish.name })}
        className="block px-5 py-4 transition-colors hover:bg-brand/5 focus-visible:bg-brand/5 focus-visible:outline-none sm:px-6"
      >
        <h3 className="font-serif text-base font-bold leading-snug sm:text-lg">
          {dish.name}
        </h3>
        {dish.description ? (
          <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
            {dish.description}
          </p>
        ) : null}
      </Link>
    </li>
  );
}
