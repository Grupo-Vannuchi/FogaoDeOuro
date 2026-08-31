"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PastaPhoto = { image: string; alt: string };

/**
 * As fotos que abrem a seção de massas.
 *
 * ── Por que rolagem, e não fade ───────────────────────────────────────────
 *
 * O hero da home usa um carrossel com autoplay e cross-fade, e o JavaScript
 * que isso custa faz sentido lá: é a primeira coisa que a pessoa vê. Aqui não.
 * Quem está nesta página escaneou um QR Code na mesa, quase sempre num 4G
 * ruim, e quer ler o cardápio — então o deslize é `scroll-snap` nativo: o
 * navegador faz o trabalho, o dedo funciona sem nenhum JS, e o script só
 * acrescenta as setas e as bolinhas para quem está no mouse ou no teclado.
 *
 * Sem autoplay, pelo mesmo motivo: uma foto que troca sozinha atrapalha quem
 * está lendo a lista logo abaixo.
 *
 * O índice sai do próprio `scrollLeft` em vez de um estado que manda na
 * rolagem. Assim as bolinhas continuam certas quando a pessoa desliza com o
 * dedo — que é como a maioria vai usar isso.
 */
export function PastaCarousel({
  photos,
  labels,
}: {
  photos: PastaPhoto[];
  labels: { carousel: string; prev: string; next: string; goTo: string };
}) {
  const trilhoRef = useRef<HTMLUListElement>(null);
  const [atual, setAtual] = useState(0);
  /**
   * Começa `false` para servidor e cliente pintarem igual; o efeito liga
   * quando dá para perguntar ao sistema se pode animar.
   */
  const [animar, setAnimar] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ler = () => setAnimar(!mq.matches);
    ler();
    mq.addEventListener("change", ler);
    return () => mq.removeEventListener("change", ler);
  }, []);

  const aoRolar = useCallback(() => {
    const el = trilhoRef.current;
    if (!el) return;
    setAtual(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const irPara = useCallback(
    (i: number) => {
      const el = trilhoRef.current;
      if (!el) return;
      el.scrollTo({
        left: i * el.clientWidth,
        behavior: animar ? "smooth" : "auto",
      });
    },
    [animar],
  );

  const seta =
    "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background focus-visible:bg-background sm:inline-flex";

  return (
    <div
      className="relative"
      role="group"
      aria-roledescription="carousel"
      aria-label={labels.carousel}
    >
      <ul
        ref={trilhoRef}
        onScroll={aoRolar}
        /* `snap-x` + `overflow-x-auto` fazem o deslize; `scrollbar-none` tira a
           barra, que num carrossel de fotos só suja a borda de baixo. */
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl"
      >
        {photos.map((foto, i) => (
          <li
            key={foto.image}
            className="w-full shrink-0 snap-center"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${photos.length}`}
          >
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
          </li>
        ))}
      </ul>

      {photos.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => irPara(Math.max(0, atual - 1))}
            disabled={atual === 0}
            aria-label={labels.prev}
            className={`${seta} left-3 disabled:pointer-events-none disabled:opacity-0`}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => irPara(Math.min(photos.length - 1, atual + 1))}
            disabled={atual === photos.length - 1}
            aria-label={labels.next}
            className={`${seta} right-3 disabled:pointer-events-none disabled:opacity-0`}
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {photos.map((foto, i) => (
              <button
                key={foto.image}
                type="button"
                onClick={() => irPara(i)}
                aria-label={labels.goTo.replace("{n}", String(i + 1))}
                aria-current={i === atual}
                className={`size-2 rounded-full transition-colors ${
                  i === atual ? "bg-brand" : "bg-border hover:bg-brand/40"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
