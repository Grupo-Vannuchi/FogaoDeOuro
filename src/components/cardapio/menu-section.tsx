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
 *     ╲________ curva laranja _________________
 *              ╭──────────────╮
 *              │  Sobremesas  │
 *              ╰──────────────╯
 *              subtítulo centrado
 *
 *              foto emoldurada, se existir
 *              conteúdo, na coluna de leitura
 *
 * ── Sangrar existiu, e foi recusado ───────────────────────────────────────
 *
 * Até 14/09 esta seção tinha dois modos: `photoFit="bleed"` (foto de ponta a
 * ponta, fora do `Container`, `object-cover`) para fotografia de verdade, e
 * `photoFit="framed"` (dentro da coluna, `object-contain`) para recorte com
 * fundo transparente. O cliente viu a página montada e recusou o
 * sangramento inteiro — não só o gosto: em `/cardapio` o corte comia
 * informação. A foto sangrando da carta de vinhos cortava o rótulo do
 * Longitud — sumiam a uva e a safra, que são exatamente o que o cliente quer
 * ler antes de escolher a garrafa — e a foto sangrando das sobremesas cortava
 * o prato do petit gateau. `object-cover` de ponta a ponta escolhe o
 * enquadramento cortando o que não cabe, e às vezes o que não cabe é
 * informação que a foto existe para mostrar.
 *
 * Por isso só sobrou um caminho: a foto sempre emoldurada, sempre dentro do
 * `Container`, sempre `object-contain`. Não tente reintroduzir o sangramento
 * para "fotografia de verdade" — o corte que perdeu o rótulo do Longitud é o
 * motivo, e ele não depende de a foto ser recorte ou fotografia.
 *
 * ── A foto, quando existe ─────────────────────────────────────────────────
 *
 * Entra DENTRO do `Container` (a mesma coluna do texto), num quadro
 * `aspect-[16/9] w-full rounded-2xl` com `object-contain` — que preserva a
 * imagem inteira em vez de cortá-la. Como está dentro da coluna, ela vem
 * depois da pílula do título, não antes; a curva não sabe (nem precisa saber)
 * se a seção tem foto e continua exatamente onde está.
 *
 * `sizes="(min-width: 1280px) 768px, 100vw"` porque a foto fica presa à
 * coluna dentro do `Container` (`max-w-3xl`, 768px) — dar `100vw` mentiria a
 * largura para o navegador e baixaria um arquivo maior do que o exibido.
 *
 * ── Sem foto, a curva fica ───────────────────────────────────────────────
 *
 * Duas seções não têm foto (Cardápio da Semana e Café e água), e a ilha de
 * massas troca a foto por um carrossel dentro dos `children` (ver
 * `pasta-carousel.tsx`) em vez de usar a prop `photo`. Nos três casos a curva
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
  title,
  subtitle,
  children,
}: {
  id?: string;
  photo?: { src: string; alt: string };
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pb-12 sm:pb-16">
      <CurvaLaranja />

      <Container className="max-w-3xl">
        <div className="-mt-6 flex flex-col items-center gap-4 text-center sm:-mt-8">
          <Pilula>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
          </Pilula>
          {subtitle ? (
            // `text-background` (creme), não `text-muted-foreground`: desde a
            // v11 de `MenuBackdrop` a página é escura, e este subtítulo cai
            // solto sobre o fundo, fora de qualquer `bg-card` — herdar
            // `--foreground` (quase preto) o apagaria. Ver o docblock de
            // `MenuBackdrop` para a lista completa do texto solto invertido.
            <p className="max-w-xl text-pretty text-xl text-background/70 sm:text-2xl">
              {subtitle}
            </p>
          ) : null}
        </div>
        {photo ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              loading="lazy"
              sizes="(min-width: 1280px) 768px, 100vw"
              className="object-contain"
            />
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
