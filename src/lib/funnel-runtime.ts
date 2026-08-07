/**
 * Shared funnel runtime types + helpers, used by the admin builder, the public
 * runner, and the seed. Funnel copy is single-language plain strings (the funnel
 * carries its own `locale`), NOT the bilingual LocalizedText JSON of the CMS.
 */

import type { Locale } from "@/i18n/routing";

/**
 * One step of the standard lead-capture opening ("default block"). Either a bot
 * line (chat bubble) or a field the visitor must fill. The block is stored as an
 * ordered array of these on both the global template and each funnel snapshot.
 */
export type FunnelDefaultStep =
  | { kind: "bot"; text: string }
  | {
      kind: "input";
      field: "name" | "role" | "phone" | "email";
      prompt: string;
    };

/** A captured answer to a custom question (a chosen option or free text). */
export type FunnelAnswer = { questionId: string; prompt: string; answer: string };

/** Values collected by the default block, used for token interpolation. */
export type FunnelLeadValues = {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  /** Google Meet link of a booked meeting, for the `{LINK}` token. */
  link?: string;
  /** Booked meeting date / time (pre-formatted in the funnel locale + timezone). */
  date?: string;
  time?: string;
};

/**
 * Replace tokens (case-insensitive) in a bot/message string with the visitor's
 * captured values: `{NOME}`/`{NAME}`, `{CARGO}`/`{ROLE}`, `{LINK}`,
 * `{DATA}`/`{DATE}`, `{HORA}`/`{TIME}`. Unknown/empty tokens collapse to an empty
 * string so a half-filled funnel never shows raw braces.
 */
export function interpolateTokens(
  text: string,
  values: FunnelLeadValues,
): string {
  return text
    .replace(/\{\s*(nome|name)\s*\}/gi, values.name?.trim() ?? "")
    .replace(/\{\s*(cargo|role)\s*\}/gi, values.role?.trim() ?? "")
    .replace(/\{\s*link\s*\}/gi, values.link?.trim() ?? "")
    .replace(/\{\s*(data|date)\s*\}/gi, values.date?.trim() ?? "")
    .replace(/\{\s*(hora|time)\s*\}/gi, values.time?.trim() ?? "");
}

/**
 * The original, editable default lead-capture block, one per locale. Seeded into
 * `FunnelDefaultTemplate` and copied into each new funnel's `defaultBlock`. Admins
 * can fully edit both the global default and each funnel's copy.
 */
export const DEFAULT_TEMPLATE_STEPS: Record<Locale, FunnelDefaultStep[]> = {
  pt: [
    {
      kind: "bot",
      text: "Olá! Que bom ter você por aqui. 👋 Vou te fazer algumas perguntas rápidas para personalizar tudo pra você.",
    },
    { kind: "input", field: "name", prompt: "Para começar, como podemos te chamar?" },
    { kind: "bot", text: "Prazer em te conhecer, {NOME}! 🙌" },
    {
      kind: "input",
      field: "phone",
      prompt: "Qual é o seu melhor número de WhatsApp? (com DDD)",
    },
    { kind: "input", field: "email", prompt: "E qual o seu melhor e-mail?" },
    { kind: "input", field: "role", prompt: "Qual é o seu cargo na empresa?" },
    {
      kind: "bot",
      text: "Show, {NOME}! Com a sua experiência como {CARGO}, tenho certeza de que isso vai fazer muito sentido pra você. Bora?",
    },
  ],
};
