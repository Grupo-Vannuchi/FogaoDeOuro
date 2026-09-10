"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselSlide,
  type CarouselLabels,
} from "@/components/ui/carousel";

export type WinePhoto = { image: string; alt: string };

/**
 * As fotos que abrem a carta de vinhos.
 *
 * Substitui a foto única que ilustrava a seção: uma garrafa sozinha mostrava um
 * rótulo, e a carta tem dois — mais a adega, que é o que responde "vocês têm
 * vinho de verdade?".
 *
 * Mesma mecânica do carrossel das massas, vinda de `ui/carousel.tsx`. É foto,
 * não card: os preços continuam na lista logo abaixo, onde se comparam as três
 * doses de um rótulo lado a lado.
 */
export function WinePhotos({
  photos,
  labels,
}: {
  photos: WinePhoto[];
  labels: CarouselLabels;
}) {
  return (
    <Carousel labels={labels} count={photos.length} className="mt-8">
      {photos.map((foto, i) => (
        <CarouselSlide key={foto.image} index={i} total={photos.length}>
          <Image
            src={foto.image}
            alt={foto.alt}
            width={1600}
            height={900}
            /* A seção fecha a página: nenhuma compete pelo carregamento
               inicial, e as seguintes só chegam quando a pessoa deslizar. */
            loading="lazy"
            sizes="(min-width: 1280px) 768px, 100vw"
            className="aspect-[16/9] w-full object-cover"
          />
        </CarouselSlide>
      ))}
    </Carousel>
  );
}
