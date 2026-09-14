import Image from "next/image";
import { Container } from "@/components/ui/container";

/**
 * A curva laranja que separa a foto da lista.
 *
 * `preserveAspectRatio="none"` **é correto aqui**, ao contrário do que matou a
 * primeira versão do fundo em 10/09: lá a forma tinha ângulo reto, e esticar
 * achata ângulo. Onda não tem ângulo para achatar — esticar só a alonga.
 *
 * O laranja preenche a faixa colada na foto; abaixo da onda fica transparente,
 * e o creme da página aparece. Assim a curva lê como fronteira, não como banda.
 */
function CurvaLaranja() {
  return (
    <svg
      aria-hidden
      data-curva
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      className="-mt-px block h-5 w-full sm:h-8"
    >
      <path
        d="M0,0 H1440 V12 C1140,40 900,2 660,22 C420,42 200,8 0,26 Z"
        fill="#FB6B3A"
      />
    </svg>
  );
}

/**
 * A pílula marrom com o nome da seção.
 *
 * Vem da peça impressa, onde cada página abre com um retângulo escuro e o nome
 * em branco. Não é o cartão que o cliente recusou em 10/09 — aquele
 * emoldurava o conteúdo inteiro; este é o letreiro da seção.
 *
 * As cores saem do arquivo da arte, não de escolha: `#7F3923` é o couro
 * iluminado e `#5E2B1F` o couro na sombra. Branco sobre eles dá 8,36:1 e
 * 11,41:1.
 */
function Pilula({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-full px-8 py-3 shadow-sm sm:px-12 sm:py-4"
      style={{ background: "linear-gradient(135deg, #7F3923 0%, #5E2B1F 100%)" }}
    >
      {children}
    </div>
  );
}

/**
 * Uma seção do cardápio com a anatomia de uma página da peça impressa:
 *
 *     ████ foto sangrando, de ponta a ponta ████
 *     ╲________ curva laranja _________________
 *              ╭──────────────╮
 *              │  Sobremesas  │
 *              ╰──────────────╯
 *              subtítulo centrado
 *
 *              conteúdo, na coluna de leitura
 *
 * ── Sangrar ──────────────────────────────────────────────────────────────
 *
 * A foto vai até a borda da tela, sem margem nem canto arredondado. É o que a
 * peça faz e é o que separa "site com as cores do cardápio" de "cardápio na
 * tela". Por isso ela fica FORA do `Container` — quem entra na coluna é só o
 * conteúdo.
 *
 * `bleed` é a alternativa à foto, para a seção de massas: lá quem sangra é o
 * carrossel. Passar os dois é erro de uso; `photo` vence.
 *
 * ── Sem foto, a curva fica ───────────────────────────────────────────────
 *
 * Duas seções não têm foto (Cardápio da Semana e Café e água). A curva
 * continua e vira divisória: é ela que liga a seção à peça impressa.
 *
 * ── A regra dura ─────────────────────────────────────────────────────────
 *
 * **Nenhum texto sobre a curva.** `--foreground` sobre `#FB6B3A` dá 2,17:1.
 * A pílula monta sobre ela com margem negativa, mas o texto vive dentro da
 * pílula, sobre o couro — não sobre o laranja.
 */
export function MenuSection({
  id,
  photo,
  bleed,
  title,
  subtitle,
  children,
}: {
  id?: string;
  photo?: { src: string; alt: string };
  bleed?: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pb-12 sm:pb-16">
      {photo ? (
        <div className="relative h-[42vw] max-h-80 min-h-40 w-full">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            loading="lazy"
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : (
        bleed
      )}

      <CurvaLaranja />

      <Container className="max-w-3xl">
        <div className="-mt-6 flex flex-col items-center gap-4 text-center sm:-mt-8">
          <Pilula>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
          </Pilula>
          {subtitle ? (
            <p className="max-w-xl text-pretty text-xl text-muted-foreground sm:text-2xl">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </Container>
    </section>
  );
}
