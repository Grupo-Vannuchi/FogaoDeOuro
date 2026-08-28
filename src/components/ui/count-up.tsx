"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 up to `value` when scrolled into view. Respects
 * `prefers-reduced-motion` by rendering the final value immediately.
 */
export function CountUp({
  value,
  suffix = "",
  durationMs = 1500,
}: {
  value: number;
  suffix?: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    let start: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        if (prefersReduced) {
          setDisplay(value);
          return;
        }

        const step = (timestamp: number) => {
          if (start === null) start = timestamp;
          const progress = Math.min((timestamp - start) / durationMs, 1);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * value));
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref}>
      {/* O locale vai explícito. `toLocaleString()` sem argumento usa o do
          AMBIENTE: no servidor da Vercel isso não é pt-BR, então 1200 sairia
          "1,200" num site em português — e ainda divergiria do que o navegador
          desenharia depois, que é erro de hidratação. */}
      {display.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}
