import Image from "next/image";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * Faixa de título do topo das páginas internas.
 *
 * ⚠️ **Sem `Reveal` aqui, e o motivo é medido.** `Reveal` renderiza no servidor
 * com `data-visible="false"`, e o CSS dá `opacity: 0` a tudo que tem
 * `[data-reveal]` — então o título só aparecia depois de baixar o JavaScript,
 * hidratar e o observador de interseção disparar.
 *
 * Medido no site publicado, em celular médio em 4G com a CPU quatro vezes mais
 * lenta, contando só DEPOIS de confirmar que a folha de estilo já estava
 * aplicada:
 *
 *   /contato   3.080 ms
 *   /galeria   5.638 ms
 *
 * A revelação ao rolar continua nas seções abaixo da dobra, que é onde ela é o
 * que promete ser. Aqui ela cobrava segundos de conteúdo por uma animação que
 * quase ninguém chega a ver — o título já está na tela quando a página abre.
 */
export function PageHeader({
  title,
  subtitle,
  image,
  imageAlt = "",
  tone = "default",
}: {
  title: string;
  subtitle?: string;
  /**
   * Foto de fundo, opcional. Com ela, a faixa inverte as cores: véu escuro por
   * cima da imagem e texto em creme. Sem ela, nada muda — as outras páginas
   * continuam com o fundo claro de sempre.
   */
  image?: string;
  imageAlt?: string;
  /**
   * Fundo da faixa quando não há foto:
   *
   *  - `default` — o creme discreto de sempre, com texto escuro;
   *  - `brand` — o marrom da marca com texto branco. Usa os tokens, não o
   *    hexadecimal: se a paleta mudar, a faixa acompanha.
   *
   * Ignorado quando há `image` — aí quem manda é o véu sobre a foto.
   */
  tone?: "default" | "brand";
}) {
  const comFoto = Boolean(image);
  const marca = !comFoto && tone === "brand";

  return (
    <div
      className={cn(
        "relative isolate border-b border-border",
        comFoto ? "overflow-hidden" : marca ? "bg-brand" : "bg-muted/30",
      )}
    >
      {comFoto ? (
        <>
          <Image
            src={image!}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Véu calibrado, não estimado: medido com o texto oculto, o ponto
              mais claro da foto sob o subtítulo dá 5,29:1 contra o creme —
              acima dos 4,5:1 que o WCAG pede para texto normal.

              Chegar a 90/82/72 subiria para 8,3:1 e escureceria a comida, que
              é justamente o que a foto veio mostrar. Se trocar a imagem por uma
              mais clara, meça de novo: esconda o texto antes, senão o pixel
              mais claro medido é a própria letra e a conta sai errada.

              No celular o véu é mais fechado e quase uniforme: a copy ocupa a
              largura inteira, então não existe canto "sem texto" para o
              gradiente abrir. Com o véu do desktop, a foto da adega deixava o
              subtítulo em 4,18:1 — abaixo do mínimo. Fechado, passa. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-[#171615]/90 via-[#171615]/88 to-[#171615]/85 sm:from-[#171615]/85 sm:via-[#171615]/70 sm:to-[#171615]/55"
          />
        </>
      ) : null}

      <Container className="relative py-16 sm:py-20">
        <h1
          className={cn(
            "max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl",
            comFoto && "text-[#EFE9C2]",
            marca && "text-brand-foreground",
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              "mt-4 max-w-2xl text-pretty text-lg",
              comFoto
                ? "text-[#EFE9C2]/85"
                : marca
                  ? "text-brand-foreground/85"
                  : "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </Container>
    </div>
  );
}
