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
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  size?: keyof typeof HEADER_SIZES;
  tone?: keyof typeof HEADER_TONES;
  className?: string;
}) {
  const corpo = HEADER_SIZES[size];
  const cor = HEADER_TONES[tone];

  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
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
      <h2
        className={cn(
          "max-w-2xl text-balance font-bold tracking-tight",
          corpo.title,
          cor.title,
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "max-w-xl text-pretty",
            corpo.subtitle,
            cor.subtitle,
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
