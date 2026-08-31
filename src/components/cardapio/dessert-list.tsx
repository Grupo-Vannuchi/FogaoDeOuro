import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { desserts, formatBRL } from "@/config/menu";

/**
 * As sobremesas, com preço por item.
 *
 * Mesma linha do resto do cardápio — foto à esquerda quando existe, nome em
 * serifa, observação embaixo — mais o preço à direita, como nas bebidas e nas
 * proteínas da ilha. Sobremesa não entra no valor por quilo.
 *
 * A foto é opcional na linha: hoje as dez têm, mas uma sobremesa nova entra no
 * cardápio antes de passar pelo fotógrafo. Sem foto, o texto ocupa a largura
 * toda em vez de deixar um quadrado vazio reservado.
 */
export async function DessertList() {
  const t = await getTranslations("cardapio");

  return (
    <>
      <ul className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        {desserts.map((sobremesa) => {
          const foto = sobremesa.photo;
          return (
            <li
              key={sobremesa.name}
              className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:gap-5 sm:px-6"
            >
              {foto ? (
                <Image
                  src={foto}
                  alt={t("dishImageAlt", { name: sobremesa.name })}
                  width={320}
                  height={320}
                  loading="lazy"
                  sizes="96px"
                  className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
                />
              ) : null}
              {/* `min-w-0` para o nome quebrar em vez de empurrar o preço. */}
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-base font-bold leading-snug sm:text-lg">
                  {sobremesa.name}
                </h3>
                {sobremesa.note ? (
                  <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {sobremesa.note}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 font-serif font-bold tabular-nums text-brand">
                {formatBRL(sobremesa.price)}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        {t("dessertsTakeaway")}
      </p>
    </>
  );
}
