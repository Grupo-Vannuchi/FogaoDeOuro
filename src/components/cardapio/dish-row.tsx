import Image from "next/image";
import { Wheat } from "lucide-react";
import type { DishView } from "@/lib/queries";
import { PASTA_CATEGORY_SLUG } from "@/config/menu";

/**
 * Uma linha do cardápio: nome, descrição, fio fino embaixo.
 *
 * **Informativa, não clicável.** O prato do buffet não tem para onde levar: a
 * descrição curta já diz o que ele é, e o cliente na mesa quer ler a lista, não
 * navegar por ela. A página individual de cada prato existiu por um dia e foi
 * removida junto com este link — mantê-la significaria dezenas de rotas que
 * ninguém abre e que repetiriam o que já está aqui.
 *
 * ── A miniatura é exceção, não padrão ─────────────────────────────────────
 *
 * O buffet tem dezenas de itens que mudam toda semana, e reservar espaço de
 * imagem para eles rendia uma página altíssima com marcadores no lugar de
 * comida. As sobremesas são poucas, fixas e já fotografadas — ali a foto à
 * esquerda cabe sem esticar a lista.
 *
 * A foto só aparece com `imageAlt`. Sem alternativa textual ela seria ruído
 * para quem usa leitor de tela, e o texto vem traduzido de quem monta a lista:
 * exigi-lo aqui obrigaria cada uma das dezenas de linhas do buffet a virar um
 * componente assíncrono só para buscar uma string que ela não usa.
 */
export function DishRow({
  dish,
  imageAlt,
}: {
  dish: DishView;
  imageAlt?: string;
}) {
  const foto = imageAlt && dish.image ? { src: dish.image, alt: imageAlt } : null;
  const eMassa = dish.category.slug === PASTA_CATEGORY_SLUG;

  return (
    <li className="flex gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:gap-5 sm:px-6">
      {foto ? (
        <Image
          src={foto.src}
          alt={foto.alt}
          width={320}
          height={320}
          loading="lazy"
          sizes="96px"
          className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
        />
      ) : null}
      {/* `min-w-0` para o texto quebrar em vez de empurrar a foto para fora. */}
      <div className="min-w-0 flex-1 self-center">
        {/* Um degrau acima do que era (`base`/`lg`), a pedido do cliente em
            09/09. Este cardápio é lido em pé, no celular, com o QR Code
            escaneado na mesa — e a gótica dos títulos pede mais corpo que a
            serifada anterior para o nome do prato sair de relance. */}
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold leading-snug sm:text-xl">
          {/* O símbolo antes do nome, não depois: numa lista escaneada de
              cima a baixo, o marcador só serve se estiver na margem, sempre na
              mesma coluna. Depois do nome ele flutuaria numa posição
              diferente a cada linha e deixaria de ser encontrável.
              O nome da categoria vem do admin e é o rótulo lido em voz alta —
              não invento texto para um ícone cujo significado o restaurante
              define. */}
          {eMassa ? (
            <>
              <Wheat className="size-4 shrink-0 text-brand" aria-hidden />
              <span className="sr-only">{dish.category.name}:</span>
            </>
          ) : null}
          {dish.name}
        </h3>
        {dish.description ? (
          <p className="mt-1 text-pretty text-base leading-relaxed text-muted-foreground">
            {dish.description}
          </p>
        ) : null}
      </div>
    </li>
  );
}
