import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

/** A vertically-padded page section with an optional anchor id. */
export function Section({
  id,
  className,
  containerClassName,
  children,
}: {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-20 sm:py-section", className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/**
 * Os dois corpos do cabeçalho de seção.
 *
 * `md` é o do site inteiro e não mudou. `lg` existe para o cardápio: aquela
 * página é uma lista longa lida no celular, com o QR Code escaneado na mesa, e
 * ali o título precisa separar as seções com mais força do que numa página de
 * texto corrido — senão o olho perde onde uma acaba e a outra começa.
 *
 * Cresce em degraus por breakpoint, e não por um salto só: no celular o
 * `text-4xl` já ocupa duas linhas, e passar disso empurraria a lista para
 * baixo da dobra sem ganhar leitura.
 */
const HEADER_SIZES = {
  md: {
    title: "text-3xl sm:text-4xl",
    subtitle: "text-base sm:text-lg",
  },
  lg: {
    title: "text-4xl sm:text-5xl",
    subtitle: "text-lg sm:text-xl",
  },
} as const;

/**
 * As cores do cabeçalho, por tipo de superfície.
 *
 * `claro` é o do site inteiro e não mudou: herda `foreground` no título e usa
 * `muted-foreground` no apoio.
 *
 * `escuro` existe para as faixas marrons do cardápio, tiradas da peça
 * impressa da casa. Sobre o couro (#5E2B1F–#7F3923), contraste das cores
 * SÓLIDAS, que é o piso — o apoio é pintado a 90% e fica um pouco abaixo:
 *   • branco #ffffff ....... 11,41 / 8,36  ✅ título
 *   • creme  #EFE9C2 .......  9,29 / 6,81  ✅ apoio
 *
 * O que vale é a medição do composto renderizado, não esta tabela: varrendo
 * `/cardapio` inteira em 1920, 1440 e 390, o pior texto da página fica em
 * 4,71:1, e nenhum reprova.
 *
 * A sobrancelha não usa `text-brand` aqui porque o marrom da marca sobre o
 * couro é marrom sobre marrom. Vira creme, como o apoio.
 *
 * O apoio usa creme e não branco de propósito: dois brancos empilhados apagam
 * a hierarquia entre título e subtítulo.
 */
const HEADER_TONES = {
  claro: {
    eyebrow: "text-brand",
    title: "",
    subtitle: "text-muted-foreground",
  },
  escuro: {
    eyebrow: "text-background/90",
    title: "text-white",
    subtitle: "text-background/90",
  },
} as const;

/** Standard eyebrow / title / subtitle header used at the top of sections. */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  size = "md",
  tone = "claro",
  action,
  className,
}: {
  eyebrow?: string;
  /**
   * Opcional desde 25/09, para a prévia da galeria: o cliente pediu a seção só
   * com a sobrancelha e o botão. Sem título o `<h2>` não é renderizado — uma
   * seção sem cabeçalho é legítima, um `<h2>` vazio não.
   */
  title?: string;
  /** Uma string vira um parágrafo; uma lista vira um por item. */
  subtitle?: string | string[];
  align?: "center" | "left";
  size?: keyof typeof HEADER_SIZES;
  tone?: keyof typeof HEADER_TONES;
  /**
   * Botão ou link que pertence ao cabeçalho, renderizado ao final dele.
   *
   * Existe para o botão não ser irmão solto da seção. Como irmão, ele vivia
   * numa linha `justify-between` com `sm:items-end`, alinhado pelo rodapé do
   * bloco mais alto: com um apoio de três parágrafos isso o largava no canto
   * inferior direito, a meia seção de distância do título que ele acompanha.
   */
  action?: React.ReactNode;
  className?: string;
}) {
  const corpo = HEADER_SIZES[size];
  const cor = HEADER_TONES[tone];

  const cabeca = (
    <>
      {eyebrow ? (
        <span
          className={cn(
            "text-sm font-semibold uppercase tracking-widest",
            cor.eyebrow,
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      {title ? (
        <h2
          className={cn(
            "max-w-2xl text-balance font-bold tracking-tight",
            corpo.title,
            cor.title,
          )}
        >
          {title}
        </h2>
      ) : null}
    </>
  );

  // Lista vira um parágrafo por item, string vira um só. Aditivo em 24/09 para
  // a seção "A experiência", cujo texto passou de 149 para 604 caracteres: num
  // `<p>` único aquilo era um bloco de nove linhas. Os 15 outros usos passam
  // string e não mudam em nada.
  //
  // Uma lista usa a largura do TÍTULO (`max-w-2xl`), não a do apoio de uma
  // linha (`max-w-xl`). São 604 caracteres: em `max-w-xl` viram um filete
  // estreito e alto, e o desencontro entre a borda do título e a do texto é o
  // que fazia o bloco parecer torto. Na mesma largura, os dois lêem como uma
  // coisa só. Tentou-se antes dividir em duas colunas, título de um lado e
  // texto do outro; o título é curto e o texto alto, então sobrava um vão de
  // uns 300px embaixo do título — trocava um desencontro por um buraco.
  const medida = Array.isArray(subtitle) ? "max-w-2xl" : "max-w-xl";
  const texto = Array.isArray(subtitle) ? (
    <div className={cn("flex flex-col gap-3", medida)}>
      {subtitle.map((paragrafo) => (
        <p
          key={paragrafo}
          className={cn("text-pretty", corpo.subtitle, cor.subtitle)}
        >
          {paragrafo}
        </p>
      ))}
    </div>
  ) : subtitle ? (
    <p className={cn("text-pretty", medida, corpo.subtitle, cor.subtitle)}>
      {subtitle}
    </p>
  ) : null;

  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {cabeca}
      {texto}
      {action ? <div className="mt-3">{action}</div> : null}
    </Reveal>
  );
}
