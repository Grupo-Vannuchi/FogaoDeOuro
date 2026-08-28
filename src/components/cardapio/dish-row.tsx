import type { DishView } from "@/lib/queries";

/**
 * Uma linha do cardápio: nome, descrição, fio fino embaixo.
 *
 * **Informativa, não clicável.** O prato do buffet não tem para onde levar: a
 * descrição curta já diz o que ele é, e o cliente na mesa quer ler a lista, não
 * navegar por ela. A página individual de cada prato existiu por um dia e foi
 * removida junto com este link — mantê-la significaria dezenas de rotas que
 * ninguém abre e que repetiriam o que já está aqui.
 *
 * Sem foto, também: o buffet tem dezenas de itens que mudam toda semana, e
 * reservar espaço de imagem para eles rendia uma página altíssima com
 * marcadores no lugar de comida.
 */
export function DishRow({ dish }: { dish: DishView }) {
  return (
    <li className="border-b border-border px-5 py-4 last:border-b-0 sm:px-6">
      <h3 className="font-serif text-base font-bold leading-snug sm:text-lg">
        {dish.name}
      </h3>
      {dish.description ? (
        <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
          {dish.description}
        </p>
      ) : null}
    </li>
  );
}
