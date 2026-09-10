"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselSlide,
  type CarouselLabels,
} from "@/components/ui/carousel";

export type PastaPhoto = { image: string; alt: string };

/**
 * As fotos que abrem a seção de massas.
 *
 * A mecânica de deslize mora em `ui/carousel.tsx` desde que a carta de vinhos
 * passou a precisar dela com outro conteúdo dentro. Aqui fica só o que é
 * específico de foto: o formato 16/9, o `priority` na primeira e o `lazy` nas
 * outras.
 */
export function PastaCarousel({
  photos,
  labels,
}: {
  photos: PastaPhoto[];
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
