"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselSlide,
  type CarouselLabels,
} from "@/components/ui/carousel";

export type CarouselPhoto = { image: string; alt: string };

/**
 * Carrossel de fotos 16:9.
 *
 * A mecânica de deslize mora em `ui/carousel.tsx` desde que a carta de vinhos
 * passou a precisar dela com outro conteúdo dentro. Aqui fica só o que é
 * específico de FOTO: o formato 16/9, o `priority` na primeira e o `lazy` nas
 * outras.
 *
 * Nasceu como `PastaCarousel`, dentro de `components/cardapio/`. Em 24/09 a
 * página de horários passou a querer o mesmo comportamento com outro assunto,
 * e o nome virou mentira antes do código: nada aqui sabe o que é massa.
 * Promovido em vez de duplicado.
 */
export function PhotoCarousel({
  photos,
  labels,
}: {
  photos: CarouselPhoto[];
  labels: CarouselLabels;
}) {
  return (
    <Carousel labels={labels} count={photos.length}>
      {photos.map((foto, i) => (
        <CarouselSlide key={foto.image} index={i} total={photos.length}>
          <Image
            src={foto.image}
            alt={foto.alt}
            width={1600}
            height={900}
            /* Só a primeira compete pela largura de banda inicial; as outras
               só aparecem quando a pessoa deslizar. */
            priority={i === 0}
            loading={i === 0 ? undefined : "lazy"}
            sizes="(min-width: 1280px) 768px, 100vw"
            className="aspect-[16/9] w-full object-cover"
          />
        </CarouselSlide>
      ))}
    </Carousel>
  );
}
