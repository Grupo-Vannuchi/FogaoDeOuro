"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";

type Theme = "system" | "light" | "dark";

const ORDER: Theme[] = ["system", "light", "dark"];
const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

/**
 * The stored theme choice is external state (localStorage + the `data-theme`
 * attribute set pre-paint), so it's read with `useSyncExternalStore` rather than
 * synced into state from an effect. `getServerSnapshot` returns "system" so SSR
 * and hydration agree; React then re-reads the real value on the client.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): Theme {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function getServerSnapshot(): Theme {
  return "system";
}

/** Apply a choice to <html>: an explicit theme sets `data-theme`; "system"
 * removes it so the `prefers-color-scheme` rules take over again. */
function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  } catch {
    // private mode / storage blocked — the choice just won't persist
  }
  listeners.forEach((l) => l());
}

/**
 * Cycles the colour theme: system → light → dark → system. "System" follows the
 * device preference (the default, and what the site did before this button);
 * the other two override it.
 */
export function ThemeToggle() {
  const t = useTranslations("theme");
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const Icon = ICONS[theme];
  const label = t("toggle", { mode: t(theme) });

  return (
    <button
      type="button"
      onClick={() => apply(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])}
      aria-label={label}
      title={label}
      className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="size-5" />
    </button>
  );
}
