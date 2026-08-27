"use client";

import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { WEEKDAYS, type Weekday } from "@/config/menu";

/**
 * Que dia é hoje, do ponto de vista do navegador.
 *
 * Fica fora do componente e memorizado porque `getSnapshot` é chamado a cada
 * render: devolver um valor novo toda vez faria o React re-renderizar em loop.
 * Não muda durante a visita — ninguém almoça atravessando a meia-noite.
 */
let cachedToday: Weekday | null | undefined;

function getTodaySnapshot(): Weekday | null {
  if (cachedToday === undefined) {
    const day = new Date().getDay(); // 0 = domingo … 6 = sábado
    cachedToday = day >= 1 && day <= 5 ? (day as Weekday) : null;
  }
  return cachedToday;
}

/** No servidor não existe "hoje": a página é estática e o build congelaria a data. */
const getServerSnapshot = (): Weekday | null => null;

/** O dia nunca muda no meio da sessão, então não há o que assinar. */
const subscribe = () => () => {};

/**
 * Seletor de dia do cardápio.
 *
 * As cinco grades já vêm no HTML e este componente apenas alterna qual está
 * visível — trocar de dia não vai ao servidor. É deliberado: quem escaneia o QR
 * Code na mesa costuma estar num 4G ruim, e uma requisição por aba seria pior
 * do que mandar a semana inteira de uma vez. As grades escondidas usam
 * `hidden`, então o navegador nem baixa as imagens delas até serem abertas.
 *
 * O dia de hoje vem de `useSyncExternalStore` e não de um efeito: o servidor
 * responde `null` (a página é estática — ler o relógio no build congelaria
 * "hoje" para sempre) e o navegador responde o dia real, sem divergência de
 * hidratação e sem `setState` em cascata. Fora da semana útil a segunda abre
 * por padrão, que é o próximo serviço.
 */
export function DayTabs({
  labels,
  todayLabel,
  selectorLabel,
  children,
}: {
  /** Rótulo de cada dia, 1 a 5, na ordem de `WEEKDAYS`. */
  labels: Record<number, string>;
  todayLabel: string;
  selectorLabel: string;
  /** Uma grade por dia, na mesma ordem de `WEEKDAYS`. */
  children: React.ReactNode[];
}) {
  const today = useSyncExternalStore(subscribe, getTodaySnapshot, getServerSnapshot);
  const [picked, setPicked] = useState<Weekday | null>(null);

  // A escolha do usuário manda; sem ela, hoje; fora da semana útil, segunda.
  const active = picked ?? today ?? 1;

  return (
    <>
      <div
        role="tablist"
        aria-label={selectorLabel}
        /* Rola na horizontal no celular pequeno em vez de quebrar em duas
           linhas, que empurraria a grade para fora da primeira tela. */
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
      >
        {WEEKDAYS.map((day) => {
          const selected = day === active;
          return (
            <button
              key={day}
              type="button"
              role="tab"
              id={`dia-${day}`}
              aria-selected={selected}
              aria-controls={`painel-${day}`}
              onClick={() => setPicked(day)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                selected
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-brand hover:text-brand",
              )}
            >
              {labels[day]}
              {today === day ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    selected ? "bg-brand-foreground/20" : "bg-brand/10 text-brand",
                  )}
                >
                  {todayLabel}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {WEEKDAYS.map((day, i) => (
        <div
          key={day}
          role="tabpanel"
          id={`painel-${day}`}
          aria-labelledby={`dia-${day}`}
          hidden={day !== active}
          className="mt-8"
        >
          {children[i]}
        </div>
      ))}
    </>
  );
}
