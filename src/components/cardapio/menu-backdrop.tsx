/**
 * O fundo da página do cardápio: fitas curvas nas bordas, creme no miolo.
 *
 * ── Nove versões, e o que cada uma ensinou ────────────────────────────────
 *
 * 1. SVG esticado com viewBox quadrado — `preserveAspectRatio="none"` **achata
 *    o ângulo**, e as diagonais viraram faixas verticais.
 * 2. Gradiente linear: guarda o ângulo, mas "parece mancha".
 * 3. Blocos arredondados — "parece um círculo" (raio grande demais).
 * 4. A arte do cliente como imagem: o rodapé translúcido deixava o couro
 *    quase preto atravessar e apagava a tagline e o CNPJ — corrigido no
 *    `footer`, que ficou opaco.
 * 5. Fitas desfocadas — "manchas laranjas feias".
 * 6. Fitas nítidas com sombra forte em volta — "muito escuro, muito feio".
 * 7. A arte de volta, como imagem.
 * 8. Faixas diagonais repetidas por toda a página: obrigavam cartão creme em
 *    volta de cada seção, porque texto escuro sobre #FB6B3A dá **2,17:1** e
 *    "Nacional" e "Importado" sumiam — medido, tela a tela.
 * 9. Esta: as fitas nítidas da versão 6, com a sombra fraca.
 *
 * ── Por que as fitas, e não faixas atravessando ───────────────────────────
 *
 * As fitas moram nos CANTOS. A coluna de leitura é `max-w-3xl` e
 * centralizada, então o texto cai sempre no creme do meio — e é por isso que
 * esta versão não precisa de cartão em volta de cada seção, ao contrário da
 * versão 8. Quem alargar a coluna perde essa garantia e precisa medir de novo.
 *
 * ── As cores, amostradas do arquivo do cliente ────────────────────────────
 *
 *   laranja ..... #FB6B3A → #EE5C2C   (medido em dois blocos da arte)
 *   couro ....... #5E2B1F → #7F3923   (sombra → parte iluminada)
 *   filete ...... #FB6B3A, traço fino contornando o couro
 *
 * O filete é caminho aberto à parte, e não `stroke` no caminho fechado: no
 * fechado ele correria também pelas bordas da moldura.
 *
 * ── O `min-w` é do tamanho do celular, não do desktop ─────────────────────
 *
 * Ele existe para a fita não sumir em tela estreita, e foi apertado duas
 * vezes por MEDIÇÃO, não por gosto:
 *
 *   420px — maior que os 390px de um celular comum. A fita atravessava a tela
 *           e a linha de uvas do vinho caía a 4,44:1.
 *   260px — melhor, mas a fita ainda alcançava a coluna: "Adicione uma
 *           proteína" caía a 3,40:1 sobre o laranja, no retrato.
 *   180px — a fita fica no canto e o texto no creme.
 *
 * Quem mexer aqui precisa medir no retrato, não no desktop — e medindo o
 * composto renderizado, com a trava de que o ponto amostrado pertence ao
 * elemento medido. Sem essa trava a varredura acusa dezenas de falsos
 * positivos e esconde o verdadeiro.
 */
export function MenuBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* Canto superior esquerdo: couro atrás, laranja à frente, deslocados —
          é o que dá a sensação de camadas da arte, em vez de mancha só. */}
      <svg
        viewBox="0 0 600 420"
        className="absolute -left-[12vw] -top-[10vw] w-[62vw] min-w-[180px]"
      >
        <defs>
          <linearGradient id="couro-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5E2B1F" />
            <stop offset="100%" stopColor="#7F3923" />
          </linearGradient>
          <linearGradient id="laranja-1" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#FB6B3A" />
            <stop offset="100%" stopColor="#EE5C2C" />
          </linearGradient>
        </defs>
        <path
          d="M0,0 L600,0 C440,70 330,190 210,300 C140,364 72,400 0,424 Z"
          fill="url(#couro-1)"
        />
        <path
          d="M600,0 C440,70 330,190 210,300 C140,364 72,400 0,424"
          fill="none"
          stroke="#FB6B3A"
          strokeWidth="7"
        />
        <path
          d="M0,66 C120,52 230,120 352,34 L470,0 C356,118 252,224 150,318 C100,364 52,394 0,416 Z"
          fill="url(#laranja-1)"
        />
      </svg>

      {/* Canto superior direito: só couro, e menor — divide o topo com o
          cabeçalho pregado, e duas fitas fortes ali brigavam com o menu. */}
      <svg
        viewBox="0 0 460 380"
        className="absolute -right-[10vw] -top-[6vw] w-[46vw] min-w-[140px]"
      >
        <defs>
          <linearGradient id="couro-2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5E2B1F" />
            <stop offset="100%" stopColor="#7F3923" />
          </linearGradient>
        </defs>
        <path
          d="M460,0 L460,380 C392,330 330,256 286,178 C236,90 150,34 0,4 Z"
          fill="url(#couro-2)"
        />
        <path
          d="M460,380 C392,330 330,256 286,178 C236,90 150,34 0,4"
          fill="none"
          stroke="#FB6B3A"
          strokeWidth="7"
        />
      </svg>

      {/* Canto inferior esquerdo: espelha o superior direito, para a página
          fechar com o mesmo peso com que abre. */}
      <svg
        viewBox="0 0 460 380"
        className="absolute -left-[10vw] -bottom-[6vw] w-[46vw] min-w-[140px]"
      >
        <defs>
          <linearGradient id="couro-3" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#5E2B1F" />
            <stop offset="100%" stopColor="#7F3923" />
          </linearGradient>
        </defs>
        <path
          d="M0,380 L0,0 C68,50 130,124 174,202 C224,290 310,346 460,376 Z"
          fill="url(#couro-3)"
        />
        <path
          d="M0,0 C68,50 130,124 174,202 C224,290 310,346 460,376"
          fill="none"
          stroke="#FB6B3A"
          strokeWidth="7"
        />
      </svg>

      {/* Canto inferior direito: o par do superior esquerdo, na diagonal. */}
      <svg
        viewBox="0 0 600 420"
        className="absolute -right-[12vw] -bottom-[10vw] w-[62vw] min-w-[180px]"
      >
        <defs>
          <linearGradient id="laranja-2" x1="1" y1="1" x2="0.1" y2="0">
            <stop offset="0%" stopColor="#FB6B3A" />
            <stop offset="100%" stopColor="#EE5C2C" />
          </linearGradient>
          <linearGradient id="couro-4" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#5E2B1F" />
            <stop offset="100%" stopColor="#7F3923" />
          </linearGradient>
        </defs>
        <path
          d="M600,420 L0,420 C160,350 270,230 390,120 C460,56 528,20 600,-4 Z"
          fill="url(#couro-4)"
        />
        <path
          d="M0,420 C160,350 270,230 390,120 C460,56 528,20 600,-4"
          fill="none"
          stroke="#FB6B3A"
          strokeWidth="7"
        />
        <path
          d="M600,354 C480,368 370,300 248,386 L130,420 C244,302 348,196 450,102 C500,56 548,26 600,4 Z"
          fill="url(#laranja-2)"
        />
      </svg>

      {/*
        Duas camadas, e a ordem importa.

        **A sombra**, primeiro: escurecimento largo e fraco logo fora da área
        de leitura, na cor do couro. Existe porque só o véu lia como halo
        esbranquiçado — véu de creme desbotando sobre fita saturada CLAREIA
        onde deveria escurecer.

        O pico é 0,12 de alfa, e isso foi calibrado olhando: uma tentativa com
        0,62 desenhou um anel escuro em volta do texto, que parecia um túnel.
        Sombra que se nota deixou de ser sombra e virou moldura — que é
        exatamente o que esta página não pode ter.

        **O véu**, por cima: creme colado no centro, transparente nas bordas.
        É ele que permite manter as fitas nítidas e na cor cheia sem custar
        legibilidade.

        Os raios vêm da largura da coluna: `max-w-3xl` centralizado ocupa de
        23% a 77% da tela num monitor comum, e o trecho opaco cobre de 19% a
        81%. Quem alargar a coluna precisa refazer esta conta.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 80% at 50% 50%, rgba(62,28,14,0) 0%, rgba(62,28,14,0) 58%, rgba(62,28,14,0.12) 76%, rgba(62,28,14,0.05) 90%, rgba(62,28,14,0) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(52% 72% at 50% 50%, var(--background) 0%, var(--background) 52%, transparent 78%)",
        }}
      />
    </div>
  );
}
