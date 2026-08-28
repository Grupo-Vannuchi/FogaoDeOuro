/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CARDÁPIO DIGITAL — PREÇOS E ESTRUTURA DA SEMANA
 * ─────────────────────────────────────────────────────────────────────────
 * Fonte única dos valores e dos dias. Os pratos em si moram no banco e são
 * editados pelo admin (`/admin/cardapio`); aqui ficam só as constantes que o
 * restaurante muda de vez em quando e que precisam bater em todo lugar do site.
 *
 * Por que o preço não fica no prato: o buffet é cobrado por peso e as massas
 * têm um valor único de seção. Nenhum prato tem preço próprio, e é exatamente
 * isso que o cliente na mesa precisa entender ao ler o cardápio.
 */

/** Valores em reais. Trocar aqui muda o cardápio inteiro de uma vez. */
export const menuPricing = {
  /** Buffet por quilo — cobrado pelo peso do prato montado. */
  buffetPerKg: 105.9,
  /** Massas — valor fechado por porção, independente da combinação escolhida. */
  pasta: 41.9,
} as const;

/** Formata em real brasileiro: 105.9 → "R$ 105,90". */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Os dias úteis, 1 (segunda) a 5 (sexta) — o restaurante não abre no fim de
 * semana. O número é o que vai para o banco (`MenuItem.weekdays`); o `slug`
 * serve para links diretos (`/cardapio?dia=terca`), e o rótulo visível vem do
 * catálogo de traduções, nunca daqui.
 */
export const WEEKDAYS = [1, 2, 3, 4, 5] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const weekdaySlugs: Record<Weekday, string> = {
  1: "segunda",
  2: "terca",
  3: "quarta",
  4: "quinta",
  5: "sexta",
};

/** Converte o slug da URL de volta para o número do dia. */
export function weekdayFromSlug(slug: string | undefined): Weekday | null {
  const entry = Object.entries(weekdaySlugs).find(([, s]) => s === slug);
  return entry ? (Number(entry[0]) as Weekday) : null;
}

/** Narrowing para valores vindos do banco, que o Prisma tipa como `number`. */
export function isWeekday(value: number): value is Weekday {
  return (WEEKDAYS as readonly number[]).includes(value);
}

/**
 * Como se monta um prato na ilha de massas — do cardápio impresso da casa,
 * entregue em 28/08/2026.
 *
 * **Os ingredientes não entram aqui de propósito.** Eles mudam toda semana,
 * conforme o que chega, e uma lista impressa no site vira promessa que a
 * cozinha não consegue cumprir num dia de entrega ruim. O cardápio informa
 * quantos o cliente escolhe, não quais — que é exatamente como o cardápio de
 * papel faz.
 *
 * Trocar qualquer coisa aqui muda a página; nenhum destes textos está escrito
 * dentro de componente.
 */
export const pastaChoices = {
  /** Porção única — não há meia nem dobrada. */
  portion: "190 gramas",
  /** Os formatos disponíveis, na ordem do cardápio impresso. */
  shapes: [
    "Nhoque de mandioquinha",
    "Nhoque de batata",
    "Gravata",
    "Cappelletti de carne ou frango",
    "Penne integral",
    "Espaguete",
    "Ravioli verde de quatro queijos",
    "Ravioli de queijo",
    "Talharim",
    "Penne",
  ],
  /** Base do preparo, escolhida na hora. */
  preparation: ["Azeite ou manteiga", "Cebola e alho"],
  /** Quantos ingredientes entram — nunca quais. */
  ingredientLimit: 5,
  sauces: ["Sugo", "Branco", "Bolonhesa", "4 queijos", "Funghi", "Pesto"],
  /**
   * Acompanhamentos com preço próprio — a única exceção à regra de que preço é
   * da seção. São adicionais cobrados por unidade, não pratos do buffet, e o
   * cardápio impresso os lista com valor.
   */
  extras: [
    { name: "Filé de frango", weight: "110 gramas", price: 7.5 },
    { name: "Bife de alcatra", weight: "120 gramas", price: 9.5 },
  ],
} as const;
