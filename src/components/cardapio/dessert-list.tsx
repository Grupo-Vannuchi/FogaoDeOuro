import Image from "next/image";
import { Cake, Package } from "lucide-react";
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
      {/* `text-card-foreground`: fundo escuro da v11 inverteu o texto solto da
          página para creme — sem isto o nome/nota de cada sobremesa herdaria
          esse creme e sumiria sobre o próprio `bg-card` creme. */}
      <ul className="mt-8 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
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
                {/* Mesmo corpo do `DishRow` e da trilha das massas: as três
                    listas dividem a mesma página, e a sobremesa menor que o
                    buffet leria como seção de segunda classe. Se um mudar,
                    mudam os três. */}
                <h3 className="font-serif text-lg font-bold leading-snug sm:text-xl">
                  {sobremesa.name}
                </h3>
                {sobremesa.note ? (
                  <p className="mt-1 text-pretty text-base leading-relaxed text-muted-foreground">
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
      {/* A cortesia de aniversário. Ganha superfície própria (`bg-card` com
          borda da marca) em vez de virar mais uma linha de texto solto: é
          oferta, não observação, e some no meio das notas se não se destacar.
          Dentro de um `bg-card`, então `text-card-foreground` — as constantes
          de texto solto valem para quem cai direto sobre o fundo, não aqui. */}
      <p className="mt-6 flex items-center gap-3 rounded-2xl border border-brand/30 bg-card px-5 py-4 text-pretty text-base font-medium text-card-foreground sm:px-6">
        <Cake className="size-5 shrink-0 text-brand" aria-hidden />
        {t("dessertsBirthday")}
      </p>

      {/* Mesma superfície da cortesia acima, a pedido do cliente em 25/09.
          Era texto solto sobre o `MenuBackdrop`, em `TEXTO_SOLTO_APOIO`; as
          duas notas fecham a seção e sendo irmãs visuais leem como um par, em
          vez de uma sobrar. Dentro de `bg-card`, então `text-card-foreground`
          — as constantes de texto solto valem para quem cai direto sobre o
          fundo do cardápio, e aqui já não é o caso. */}
      <p className="mt-4 flex items-center gap-3 rounded-2xl border border-brand/30 bg-card px-5 py-4 text-pretty text-base font-medium text-card-foreground sm:px-6">
        <Package className="size-5 shrink-0 text-brand" aria-hidden />
        {t("dessertsTakeaway")}
      </p>
    </>
  );
}
