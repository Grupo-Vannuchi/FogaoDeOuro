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
 * As fotos que abrem a seção de massas, na ordem do carrossel.
 *
 * São arquivos em `public/massas`, não slugs de prato. Antes vinham de itens
 * cadastrados, e isso amarrava a foto ao catálogo do buffet: para mostrar um
 * nhoque ou um talharim era preciso existir um prato com aquele nome e aquele
 * dia da semana. O carrossel ilustra a ilha, não a lista de segunda-feira.
 *
 * A escolha é por massas visivelmente diferentes entre si — nhoque ao sugo,
 * ravioli ao molho branco e penne ao sugo. Três fotos do mesmo penne
 * venderiam a ilha como se ela tivesse uma opção só.
 *
 * `name` alimenta o texto alternativo de cada slide; sem ele os três leriam
 * igual para quem usa leitor de tela.
 */
export const pastaPhotos = [
  { photo: "/massas/nhoque-ao-sugo.webp", name: "Nhoque ao sugo" },
  {
    photo: "/massas/ravioli-ao-molho-branco.webp",
    name: "Ravioli ao molho branco",
  },
  { photo: "/massas/penne-ao-sugo.webp", name: "Penne ao sugo" },
] as const;

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

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  BEBIDAS
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Transcritas do cardápio impresso da casa, fotografado em 31/08/2026.
 *
 * **Cada bebida tem preço próprio** — é a segunda exceção à regra de que preço
 * é da seção, junto das proteínas da ilha de massas. Elas não entram no valor
 * por quilo: são cobradas à parte, e é isso que o cliente na mesa precisa
 * entender ao ler.
 *
 * Os sabores não entram aqui. No impresso cada linha traz a lista em corpo
 * miúdo ("Laranja / Abacaxi / …"), e o que chega na geladeira muda; listar
 * sabor por sabor vira promessa que a casa não cumpre num dia de entrega ruim
 * — a mesma decisão dos ingredientes da massa.
 *
 * `volume` é o que separa duas linhas com o mesmo nome: refrigerante de 200 ml
 * e de 350 ml são itens diferentes, com preços diferentes.
 */
export type Drink = { name: string; volume: string; price: number };

export const drinkGroups = [
  {
    /** O rótulo do grupo é UI e vem do catálogo; os nomes das bebidas, não. */
    labelKey: "drinksJuices",
    items: [
      { name: "Suco natural", volume: "300 ml", price: 12.0 },
      { name: "Suco de polpa", volume: "300 ml", price: 10.9 },
      { name: "Suco natural · jarra", volume: "650 ml", price: 23.0 },
      { name: "Suco de polpa · jarra", volume: "650 ml", price: 19.9 },
      { name: "Suco misto · copo", volume: "330 ml", price: 14.0 },
      { name: "Suco misto · jarra", volume: "650 ml", price: 23.0 },
      { name: "Suco Del Valle", volume: "290 ml", price: 9.9 },
    ],
  },
  {
    labelKey: "drinksCoffeeWater",
    items: [
      { name: "Café expresso", volume: "50 ml", price: 7.0 },
      { name: "Café expresso com leite", volume: "", price: 7.0 },
      { name: "Água sem gás", volume: "500 ml", price: 5.5 },
      { name: "Água com gás", volume: "500 ml", price: 6.5 },
      { name: "Água · copo", volume: "310 ml", price: 4.5 },
    ],
  },
  {
    labelKey: "drinksSodasBeer",
    items: [
      { name: "Refrigerante", volume: "200 ml", price: 5.6 },
      { name: "Refrigerante zero", volume: "200 ml", price: 5.6 },
      { name: "Refrigerante", volume: "350 ml", price: 8.6 },
      { name: "Refrigerante zero", volume: "350 ml", price: 8.6 },
      { name: "Chá Mate Leão", volume: "450 ml", price: 8.6 },
      { name: "H2O", volume: "500 ml", price: 8.6 },
      { name: "H2O Limoneto", volume: "500 ml", price: 8.6 },
      { name: "Sprite Lemon Fresh", volume: "310 ml", price: 8.6 },
      { name: "Schweppes Citrus", volume: "350 ml", price: 8.6 },
      { name: "Itubaína Retrô", volume: "355 ml", price: 8.6 },
      { name: "Cerveja Heineken", volume: "330 ml", price: 16.9 },
    ],
  },
] as const satisfies readonly {
  labelKey: string;
  items: readonly Drink[];
}[];

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SOBREMESAS
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Transcritas do cardápio impresso da casa, fotografado em 31/08/2026.
 *
 * **A ordem não é mais a do impresso**, e por um motivo que só existe aqui: a
 * lista tem foto em toda linha. No papel, petit gâteau e brownie vêm colados —
 * e as duas fotos são bolo escuro com bola de sorvete, quase indistinguíveis
 * uma da outra. O mesmo vale para as duas gelatinas, que são potes coloridos.
 * Empilhadas, o par lê como imagem repetida, não como duas sobremesas.
 *
 * Os dois pares ficam a quatro linhas ou mais de distância. Ao mexer nesta
 * lista, manter essa separação — ela é o motivo da ordem.
 *
 * **Elas não entram no preço por quilo.** Cada uma tem valor próprio, como as
 * bebidas — a seção dizia o contrário até esta transcrição chegar, e dizer que
 * algo está incluso quando não está é o tipo de erro que o cliente descobre na
 * conta.
 *
 * A taxa de embalagem para viagem não entra nas linhas: no impresso ela se
 * repete sob a salada de fruta, e ao lado do preço do prato viravam dois "R$"
 * na mesma linha, um deles não sendo o que a sobremesa custa. Vive como nota
 * da seção, dita uma vez.
 *
 * ── As fotos ──────────────────────────────────────────────────────────────
 *
 * `photo` é caminho de arquivo, não slug de prato. As sobremesas moram aqui,
 * no cardápio impresso, e não no banco — então a foto mora junto, em
 * `public/sobremesas`. Antes elas vinham de pratos cadastrados, o que só
 * cobria as três que por acaso existiam como prato e deixava gelatina, petit
 * gateau e torta holandesa sem imagem possível.
 *
 * Os arquivos já saem quadrados (640×640), porque a miniatura da linha é
 * quadrada: deixar o `object-cover` recortar no navegador jogava a taça de
 * salada de frutas para fora do quadro. A do creme de papaia é a mesma taça,
 * no mesmo canto do balcão, e precisou do mesmo recorte deslocado.
 *
 * As duas gelatinas se distinguem pela foto, não só pelo nome: a comum traz
 * três potes (limão, morango e uva) e a zero traz dois (morango e uva) —
 * exatamente os sabores que cada linha anuncia.
 */
export type Dessert = {
  name: string;
  /** Porção, sabores ou o que o impresso traz em corpo miúdo sob o nome. */
  note?: string;
  price: number;
  /** Caminho da miniatura em `public`, quando a sobremesa tem foto. */
  photo?: string;
};

export const desserts: readonly Dessert[] = [
  {
    name: "Salada de frutas",
    note: "220 g",
    price: 18.0,
    photo: "/sobremesas/salada-de-frutas.webp",
  },
  {
    name: "Mousse de chocolate",
    note: "Chocolate meio amargo",
    price: 16.0,
    photo: "/sobremesas/mousse-de-chocolate.webp",
  },
  {
    name: "Gelatina",
    note: "120 ml · limão, morango ou uva",
    price: 3.5,
    photo: "/sobremesas/gelatina.webp",
  },
  {
    name: "Petit gateau com sorvete",
    note: "Sorvete de creme ou flocos",
    price: 22.0,
    photo: "/sobremesas/petit-gateau.webp",
  },
  {
    name: "Creme de papaia com cassis",
    price: 18.0,
    photo: "/sobremesas/creme-de-papaia.webp",
  },
  {
    name: "Torta holandesa",
    price: 16.0,
    photo: "/sobremesas/torta-holandesa.webp",
  },
  {
    name: "Gelatina zero",
    note: "Morango ou uva",
    price: 4.0,
    photo: "/sobremesas/gelatina-zero.webp",
  },
  {
    name: "Pudim",
    note: "Pedaço",
    price: 16.0,
    photo: "/sobremesas/pudim.webp",
  },
  {
    name: "Torta de limão",
    price: 16.0,
    photo: "/sobremesas/torta-de-limao.webp",
  },
  {
    name: "Brownie com sorvete",
    note: "Sorvete de creme ou flocos",
    price: 20.0,
    photo: "/sobremesas/brownie.webp",
  },
];

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CARTA DE VINHOS
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Transcrita da carta impressa fotografada em 02/09. A casa serve **duas
 * linhas** — uma nacional e uma importada —, e cada uma é vendida em mais de
 * uma dose. Por isso o vinho não cabe no formato das bebidas, de um nome para
 * um preço: aqui um rótulo tem vários preços, e é a dose que os separa.
 *
 * Os dois preços de garrafa vêm de etiqueta adesiva colada por cima da carta,
 * ilegível na foto — foram confirmados pelo dono em 02/09, não lidos da
 * imagem. Se a etiqueta mudar de novo, é aqui que se atualiza.
 */
export type WineServing = {
  /** A dose, como está impressa: "Taça", "½ Taça", "Garrafa". */
  label: string;
  /** Volume da dose, quando a carta traz. Fica sob o nome, como nas bebidas. */
  volume?: string;
  price: number;
};

export type Wine = {
  name: string;
  /** Nacional ou importado — o que a carta impressa destaca. */
  note?: string;
  /** Os rótulos servidos sob esta linha, quando são mais de um. */
  labels?: readonly string[];
  servings: readonly WineServing[];
};

export const wines: readonly Wine[] = [
  {
    name: "Del Grano",
    note: "Nacional",
    servings: [
      { label: "Taça", volume: "175 ml", price: 17.5 },
      { label: "½ Taça", volume: "87,5 ml", price: 14.0 },
      { label: "Garrafa", price: 60.0 },
    ],
  },
  {
    name: "Block",
    note: "Importado",
    labels: [
      "Segredo do Abade",
      "Carménère",
      "Cabernet Sauvignon",
      "Sauvignon Blanc 3 Medalhas",
    ],
    servings: [
      { label: "Taça", volume: "175 ml", price: 19.5 },
      { label: "½ Taça", volume: "87,5 ml", price: 16.0 },
      { label: "Garrafa", price: 75.0 },
    ],
  },
];
