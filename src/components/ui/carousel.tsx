"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CarouselLabels = {
  carousel: string;
  prev: string;
  next: string;
  /** Com `{n}` no lugar do número do slide. */
  goTo: string;
};

/**
 * A mecânica de deslize, sem opinião sobre o que vai dentro de cada slide.
 *
 * Nasceu como o carrossel de fotos das massas e virou este componente quando a
 * carta de vinhos precisou da mesma mecânica com outro conteúdo — card com
 * nome e preços em vez de imagem. Duas cópias da mesma lógica de rolagem é o
 * tipo de coisa que envelhece torto: uma ganha correção, a outra não.
 *
 * ── Por que rolagem, e não fade ───────────────────────────────────────────
 *
 * O hero da home usa autoplay e cross-fade, e o JavaScript que isso custa faz
 * sentido lá: é a primeira coisa que a pessoa vê. Aqui não. Quem está no
 * cardápio escaneou um QR Code na mesa, quase sempre num 4G ruim — então o
 * deslize é `scroll-snap` nativo: o navegador faz o trabalho, o dedo funciona
 * sem nenhum JS, e o script só acrescenta as setas e as bolinhas para quem
 * está no mouse ou no teclado.
 *
 * Sem autoplay, pelo mesmo motivo: conteúdo que troca sozinho atrapalha quem
 * está lendo a lista logo abaixo.
 *
 * O índice sai do próprio `scrollLeft`, e não de um estado que manda na
 * rolagem. Assim as bolinhas continuam certas quando a pessoa desliza com o
 * dedo — que é como a maioria vai usar isso.
 */
export function Carousel({
  labels,
  count,
  className,
  trackClassName,
  children,
}: {
  labels: CarouselLabels;
  /** Quantos slides `children` produz. Abaixo de 2 os controles somem. */
  count: number;
  className?: string;
  /** Classe do trilho — o carrossel de fotos arredonda, o de cards não. */
  trackClassName?: string;
  children: React.ReactNode;
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
      className={className ? `relative ${className}` : "relative"}
      role="group"
      aria-roledescription="carousel"
      aria-label={labels.carousel}
    >
      <ul
        ref={trilhoRef}
        onScroll={aoRolar}
        /* `snap-x` + `overflow-x-auto` fazem o deslize; `scrollbar-none` tira a
           barra, que aqui só sujaria a borda de baixo. */
        className={`scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain ${
          trackClassName ?? "rounded-2xl"
        }`}
      >
        {children}
      </ul>

      {count > 1 ? (
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
            onClick={() => irPara(Math.min(count - 1, atual + 1))}
            disabled={atual === count - 1}
            aria-label={labels.next}
            className={`${seta} right-3 disabled:pointer-events-none disabled:opacity-0`}
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
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

/**
 * Um slide. Fica aqui junto do trilho porque as duas classes que fazem o
 * encaixe (`w-full shrink-0 snap-center`) precisam casar com o `snap-mandatory`
 * do pai — separá-las convidaria a mexer numa e esquecer a outra.
 */
export function CarouselSlide({
  index,
  total,
  className,
  children,
}: {
  index: number;
  total: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`w-full shrink-0 snap-center ${className ?? ""}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} / ${total}`}
    >
      {children}
    </li>
  );
}
