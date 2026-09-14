import Image from "next/image";
import { Container } from "@/components/ui/container";

/**
 * Uma seção do cardápio com a anatomia de uma página da peça impressa:
 *
 *              Sobremesas
 *              subtítulo centrado
 *
 *              foto emoldurada, se existir
 *              conteúdo, na coluna de leitura
 *
 * ── A curva laranja e a pílula do título existiram, e foram removidas ─────
 *
 * Até a v12 do fundo (`MenuBackdrop`) esta seção abria com `CurvaLaranja`
 * (um SVG de onda laranja, fronteira de uma foto que sangrava até 14/09) e
 * envolvia o título numa `Pilula` marrom (cápsula sólida, vinda da peça
 * impressa, texto branco por cima). O cliente viu o fundo escuro em S da
 * v12 e pediu os dois fora: a curva porque a foto que ela demarcava não
 * sangra mais há duas versões, e a pílula porque simplifica — o título
 * passa a ser texto solto, direto sobre o fundo. Não reintroduza nenhum dos
 * dois sem um novo pedido explícito do cliente; o histórico completo de por
 * que cada um existia fica em `MenuBackdrop` (`menu-backdrop.tsx`), porque
 * lá é onde a decisão de cada versão do fundo é registrada.
 *
 * O teste que travava a curva (`test/a-curva-laranja-nunca-carrega-texto.
 * test.tsx`) foi apagado junto — sem o componente, não sobrava objeto para
 * testar.
 *
 * ── O título, agora texto solto ───────────────────────────────────────────
 *
 * `text-background` (creme), não branco nem `--foreground`: desde a v11 de
 * `MenuBackdrop` a página é escura, e o título cai solto sobre o fundo, fora
 * de qualquer `bg-card` — herdar `--foreground` (quase preto) o apagaria, e
 * branco fixo já não seguia o token do tema. Mesma tipografia de sempre
 * (`font-serif` = Grenze Gotisch, `text-3xl font-bold tracking-tight
 * sm:text-4xl`) — só a cor e o contêiner mudaram.
 *
 * O núcleo da chama do fundo (v12) é claro — creme quase branco — e por
 * construção evita a coluna de leitura (`max-w-3xl` abaixo); ver a seção
 * "por que o núcleo evita o centro" em `menu-backdrop.tsx`. Se algum dia o
 * fundo mudar de novo, meça de novo se o título continua legível rolando a
 * página inteira, não só na primeira tela.
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
 * imagem inteira em vez de cortá-la.
 *
 * `sizes="(min-width: 1280px) 768px, 100vw"` porque a foto fica presa à
 * coluna dentro do `Container` (`max-w-3xl`, 768px) — dar `100vw` mentiria a
 * largura para o navegador e baixaria um arquivo maior do que o exibido.
 *
 * ── Sem foto ───────────────────────────────────────────────────────────────
 *
 * Duas seções não têm foto (Cardápio da Semana e Café e água), e a ilha de
 * massas troca a foto por um carrossel dentro dos `children` (ver
 * `pasta-carousel.tsx`) em vez de usar a prop `photo`.
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
      <Container className="max-w-3xl">
        <div className="flex flex-col items-center gap-4 pt-12 text-center sm:pt-16">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-background sm:text-4xl">
            {title}
          </h2>
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
