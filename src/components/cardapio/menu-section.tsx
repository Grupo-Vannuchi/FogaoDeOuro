import Image from "next/image";
import { Container } from "@/components/ui/container";
import { TEXTO_SOLTO, TEXTO_SOLTO_APOIO } from "@/components/cardapio/menu-backdrop";

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
 * `TEXTO_SOLTO`, importado de `MenuBackdrop`, e não `--foreground`: o título
 * cai solto sobre o fundo do cardápio, fora de qualquer `bg-card`, e
 * `--foreground` (`#474544`) é medido contra o creme do site — sobre o fundo
 * desta página ele reprova. A cor certa muda toda vez que o fundo muda (creme
 * na v11/v12, quase-preto na v15, creme de novo na v16), e é por isso que ela
 * vem importada de lá em vez de escrita aqui: um hex copiado para cá vira uma
 * cor não medida no dia seguinte. Mesma tipografia de sempre (`font-serif` =
 * Grenze Gotisch, `text-3xl font-bold tracking-tight sm:text-4xl`) — só a cor
 * e o contêiner mudaram.
 *
 * Ao contrário do núcleo claro da chama (v12), os fundos desde a v13 não têm
 * uma região "perigosa" para evitar: a cor exportada passa contra o fundo
 * inteiro, em qualquer ponto da rolagem — por isso este título não precisa de
 * uma zona segura por posição, só da cor certa.
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
    <section id={id} className="scroll-mt-24 pb-12 pt-12 sm:pb-16 sm:pt-16">
      <Container className="max-w-3xl">
        {/* A chapa do letreiro. Reintroduzida em 24/09 a pedido do cliente —
            ver "a pílula existiu e foi removida" no topo deste arquivo, que
            pedia justamente um pedido explícito antes de voltar.

            NÃO é a `Pilula` antiga. Aquela era uma cápsula MARROM SÓLIDA com
            texto branco, desenhada para o fundo escuro da v12. Sobre a
            terracota de hoje, marrom e terracota são quase o mesmo matiz e a
            cápsula sumiria dentro do fundo.

            Esta escurece o que estiver atrás, em vez de pintar por cima: o
            fundo é `fixed` e o banho radial passa por baixo dela conforme a
            página rola, então uma cor fixa brigaria com o gradiente em alguma
            altura da rolagem, e um escurecimento acompanha.

            Alfa na COR (`rgba`), nunca na propriedade `opacity` — a varredura
            de contraste força `opacity: 1 !important` para congelar animações,
            e apagaria o efeito antes de medir (ver `INTENSIDADE_FORMA` em
            `MenuBackdrop`).

            14% foi medido, não escolhido no olho. Sobre o ponto mais claro do
            banho (`#9A4530`, o pior caso), a chapa leva o título de 5,23 para
            6,45 e o apoio de 4,58 para 5,64 — ou seja, destaca E melhora a
            legibilidade. Acima disso começa a pesar e a virar caixa.

            Largura CHEIA da coluna, não `w-fit`. A primeira versão abraçava o
            texto, e o cliente apontou o efeito: a chapa ficava mais estreita
            que a foto logo abaixo, e as duas bordas desalinhadas leem como
            erro. Alinhar com o conteúdo vale mais do que a chapa curta que
            "Sucos" sozinho pediria.

            Cor própria, e não mais o terracota escurecido. Medida a separação
            de cada candidato contra os três tons do banho — quanto menor, mais
            a chapa some dentro do fundo:

              couro da peça   #5E2B1F ... 1,13   sumiria
              couro claro     #7E3923 ... 1,10   sumiria
              marrom da marca #8A5206 ... 1,01   invisível
              expresso        #3A211A ... 1,47   ESCOLHIDA
              quase-preto     #2A1109 ... 1,75   severa demais

            Os marrons do couro impresso eram o candidato óbvio e são os
            piores: terracota e couro dividem o matiz, então a chapa
            desapareceria no fundo. O expresso sai da família sem sair do
            registro quente, e leva o título a 12,11 de contraste (era 5,23
            sobre o fundo nu). */}
        <div
          className="flex flex-col items-center gap-4 rounded-2xl px-6 py-8 text-center sm:px-10 sm:py-10"
          style={{
            backgroundColor: "#3A211A",
            border: "1px solid rgba(239, 233, 194, 0.12)",
          }}
        >
          <h2
            /* Um degrau acima do resto da página (24/09): o cliente pediu que
               cada categoria fosse identificável na leitura corrida. Quebra em
               duas linhas no celular com os títulos longos ("Refrigerantes e
               cerveja") — é aceitável porque o bloco é centrado; o que não
               pode é vazar a largura, e não vaza. */
            className="text-balance font-serif text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ color: TEXTO_SOLTO }}
          >
            {title}
          </h2>
          {subtitle ? (
            // `TEXTO_SOLTO_APOIO`, não `text-muted-foreground`: este
            // subtítulo cai solto sobre o fundo do cardápio, fora de qualquer
            // `bg-card`, e os tokens do tema são medidos contra o creme do
            // site. É um tom só um degrau distante do título, porque é texto
            // de apoio — e uma COR sólida, não o título com opacidade: sobre
            // fundo de tom médio a opacidade come o contraste rápido demais
            // (ver o docblock de `MenuBackdrop`, seção "v16").
            <p
              className="max-w-xl text-pretty text-xl sm:text-2xl"
              style={{ color: TEXTO_SOLTO_APOIO }}
            >
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
