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

/** Standard eyebrow / title / subtitle header used at the top of sections. */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  size = "md",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  size?: keyof typeof HEADER_SIZES;
  className?: string;
}) {
  const corpo = HEADER_SIZES[size];

  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-sm font-semibold uppercase tracking-widest text-brand">
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "max-w-2xl text-balance font-bold tracking-tight",
          corpo.title,
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "max-w-xl text-pretty text-muted-foreground",
            corpo.subtitle,
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
