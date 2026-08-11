import Image from "next/image";
import type { MenuItemView } from "@/lib/queries";

/** Card de um prato. Sem preço: o cliente não publica valores. */
export function MenuItemCard({ item }: { item: MenuItemView }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5">
      {item.image ? (
        <Image
          src={item.image}
          alt=""
          width={480}
          height={320}
          className="h-40 w-full rounded-lg object-cover"
        />
      ) : null}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-serif text-lg font-bold">{item.name}</h3>
        {item.description ? (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        ) : null}
      </div>
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
