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
}) {
  const comFoto = Boolean(image);

  return (
    <div
      className={cn(
        "relative isolate border-b border-border",
        comFoto ? "overflow-hidden" : "bg-muted/30",
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
          {/* Véu suficiente para o texto claro passar em qualquer ponto da
              foto — buffet tem áreas muito claras (louça branca, arroz) onde
              um overlay leve deixaria o título ilegível. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-[#171615]/85 via-[#171615]/70 to-[#171615]/55"
          />
        </>
      ) : null}

      <Container className="relative py-16 sm:py-20">
        <h1
          className={cn(
            "max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl",
            comFoto && "text-[#EFE9C2]",
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              "mt-4 max-w-2xl text-pretty text-lg",
              comFoto ? "text-[#EFE9C2]/85" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </Container>
    </div>
  );
}
