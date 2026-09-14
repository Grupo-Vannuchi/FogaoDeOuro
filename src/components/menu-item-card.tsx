import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { MenuItemView } from "@/lib/queries";

/** 1 = segunda … 5 = sexta — indexado por `weekday - 1` para o rótulo traduzido. */
const weekdayKeys = ["weekday1", "weekday2", "weekday3", "weekday4", "weekday5"] as const;

/**
 * Card de um prato. Sem preço: o cliente não publica valores.
 *
 * ── Só a foto ─────────────────────────────────────────────────────────────
 *
 * O nome e a descrição saíram a pedido do cliente em 14/09: na vitrine da home
 * ele quer a comida, não a legenda. A frase do prato repetia o que a foto já
 * mostra, e três parágrafos lado a lado pesavam mais que as três imagens.
 *
 * **O nome não se perdeu.** Ele continua no `alt` da imagem, que é a versão do
 * card para quem não vê a tela — e é por isso que o `alt` aqui é o nome do
 * prato, e não uma descrição da cena. Tirar o `h3` sem esse cuidado deixaria a
 * vitrine inteira muda no leitor de tela.
 *
 * O selo de dia da semana e as etiquetas continuam: são dado, não frase. Os
 * três destaques fixos não têm nenhum dos dois, mas o rodízio que preenche o
 * resto da vitrine pode trazer.
 */
export async function MenuItemCard({ item }: { item: MenuItemView }) {
  const t = await getTranslations("gastronomia");
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5">
      {item.weekdays.length > 0 ? (
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
          <span className="sr-only">{t("weekOfTitle")}: </span>
          {item.weekdays.map((d) => t(weekdayKeys[d - 1])).join(" · ")}
        </span>
      ) : null}
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          width={480}
          height={320}
          className="h-40 w-full rounded-lg object-cover"
        />
      ) : null}
      {item.tags.length > 0 ? (
        <ul className="mt-auto flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
