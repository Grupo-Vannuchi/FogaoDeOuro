/**
 * O fundo da página do cardápio: vinheta quente nas bordas, creme no miolo.
 *
 * ── Dez versões, e o que cada uma ensinou ─────────────────────────────────
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
 * 9. Fitas nítidas nos quatro cantos (a da versão 6, com a sombra fraca):
 *    ficou pronta neste arquivo, mas nunca chegou a ser montada na página —
 *    em 14/09 o cliente viu quatro variações novas na tela e escolheu uma
 *    delas antes de esta ir ao ar.
 * 10. Esta: uma vinheta radial só, sem canto, sem fita, sem forma
 *     reconhecível — creme no centro, esquentando para o couro nas bordas.
 *     Entre as quatro variações mostradas em 14/09, foi a que o cliente
 *     escolheu.
 * 11. Fundo escuro, curvas orgânicas fluindo — pedido novo do cliente em
 *     14/09, não mais correção do mesmo pedido. Até a v10 a pergunta sempre
 *     foi "que textura pôr sobre o creme claro do site"; esta inverte a
 *     pergunta: base escura (quase-preto amarronzado no topo, faixa
 *     laranja/âmbar cruzando na diagonal, marrom profundo, curva clara em
 *     creme embaixo), como papel de parede. Ver "v11" mais abaixo para a
 *     técnica, as cores finais e a consequência que ela obriga no resto da
 *     página.
 *
 * ── Por que "sem forma reconhecível" venceu (histórico da v10) ────────────
 *
 * Toda versão anterior tinha uma forma que dava para apontar e nomear —
 * círculo (v3), faixa (v8), fita (v5, v6, v9) — e nomear a forma foi
 * exatamente a queixa que derrubou cada uma: "parece uma mancha", "parece um
 * círculo", "muito escuro, muito feio". Um gradiente radial simples,
 * centrado na página e bem mais largo que alto (`120% 90%`), não desenha
 * contorno nenhum para o olho seguir — só esquenta o canto e esfria para o
 * centro. Não existia versão 11 óbvia *para esta pergunta* — mas em 14/09 o
 * cliente trocou a pergunta (fundo escuro, não mais textura sobre o creme), e
 * a v11 responde a essa pergunta nova, não a esta. Ver a seção "v11" abaixo.
 *
 * ── A cor, amostrada do impresso ──────────────────────────────────────────
 *
 * `rgb(126,57,35)` é `#7E3923` — o couro da arte impressa do cliente, a
 * mesma pele de couro que já aparece na `Pilula` de `menu-section.tsx`
 * (`#7F3923`/`#5E2B1F`) e que vestia as fitas da versão 9, amostrada de novo
 * direto do arquivo do cliente. O hex sai um dígito diferente do da
 * `Pilula` porque é outro ponto do couro na arte, não o mesmo valor
 * duplicado com erro de digitação — não "corrija" um para bater com o outro.
 * A cor não é escolha livre; é amostra.
 *
 * ── Por que esta versão não pede a calibração por largura de tela ────────
 *
 * As fitas da versão 9 tinham `min-w` por SVG, calibrado em pixel
 * (420px → 260px → 180px, cada aperto por medição de contraste em retrato)
 * porque cada canto era uma forma de tamanho fixo que ou sumia ou invadia a
 * coluna de leitura dependendo da largura da tela. O gradiente radial daqui
 * é só porcentagem da própria caixa (`120% 90% at 50% 40%`): a proporção não
 * muda com a largura da tela, e por isso esta versão não herda aquela
 * calibração — mas também não foi remedida em retrato. Quem notar o couro
 * chegando perto de texto num celular precisa medir de novo, do zero.
 *
 * ── v11: fundo escuro, curvas orgânicas fluindo ───────────────────────────
 *
 * O pedido do cliente em 14/09: base escura, quase preta e amarronzada no
 * topo; uma faixa curva em laranja/âmbar cruzando na diagonal; marrom
 * profundo; e uma curva clara em creme na parte de baixo — curvas largas e
 * suaves, sem aresta, "como um gradiente de papel de parede". Em CSS, não em
 * imagem: imagem é o que já travou uma troca de foto neste projeto (licença
 * de terceiro) e é o que a v4/v7 tentaram e recuaram — e CSS escala para
 * qualquer proporção de tela sem recorte, o que uma imagem não faz.
 *
 * **Técnica.** Uma cor de base escura (`backgroundColor`) mais três
 * `radial-gradient` elípticos enormes empilhados em `backgroundImage`, cada
 * um centrado parcialmente FORA da caixa (posição `at` abaixo de 0% ou acima
 * de 100%). Só o arco visível de cada elipse entra na tela — sem centro,
 * sem contorno fechado para o olho seguir, o mesmo motivo que fez a vinheta
 * da v10 vencer as fitas com forma reconhecível (v3, v5, v6, v9). A diferença
 * é que aqui as "bordas" da vinheta viraram o design inteiro: três arcos
 * diagonais, não um brilho centrado.
 *
 * As cores, de cima para baixo / de trás para frente do empilhamento:
 *
 * - Base (`backgroundColor`): `#2A1109` — escurecido do couro `#5E2B1F` a
 *   pedido do brief ("para o quase-preto do topo, escureça o couro"). Sem
 *   nenhum radial por cima, é o que sobra no topo e nos cantos — o
 *   "quase-preto amarronzado" pedido nasce por ausência, não por mais uma
 *   camada.
 * - Laranja (frente): `#FB6B3A`, elipse larga e baixa (`170% 42%`) centrada
 *   perto do topo direito (`78% 6%`) — o arco desce e cruza a tela na
 *   diagonal, a faixa que o cliente pediu.
 * - Marrom profundo (meio): `#7E3923` — o couro claro da `Pilula`, aqui como
 *   camada, não como pílula — elipse grande (`165% 58%`) centrada em
 *   `58% 64%`.
 * - Creme (trás): `#EFE9C2`, o `--background` do tema — elipse centrada
 *   BAIXO da caixa (`28% 122%`) e deslocada à esquerda, então só uma lasca
 *   do arco toca o canto inferior. Deliberadamente pequena: `--background`
 *   também é a cor que o texto solto da página passou a usar (ver a
 *   consequência abaixo), e um creme dominando a faixa de baixo apagaria
 *   esse texto contra o próprio fundo. Testado no dev server rolando a
 *   página inteira — ver o relatório da tarefa para as capturas.
 *
 * Todos os valores em `%`, herdado da v10: a proporção não muda com a
 * largura da tela, então não pede a calibração por pixel que a v9 exigia
 * (ver acima). `fixed` (não `absolute`) também herdado da v10 — o fundo
 * acompanha a janela, não o documento, e por isso todo texto que passa por
 * cima dele, rolando, cruza as quatro faixas em algum momento. A curva de
 * creme pequena e deslocada é a mitigação para isso, não uma garantia; se
 * alguém redesenhar as elipses, meça de novo com a página rolando, não só
 * na primeira tela.
 *
 * ── A consequência obrigatória: texto solto e cartões ─────────────────────
 *
 * Fundo escuro quebra `--foreground` (`#474544`, quase preto) — ilegível
 * sobre qualquer uma das quatro faixas exceto a de creme. Duas metades,
 * as duas na página `/cardapio`, nenhuma neste arquivo:
 *
 * 1. Texto solto (fora de qualquer `bg-card`) virou `text-background` /
 *    `text-background/70` — subtítulos de `MenuSection`, títulos e notas da
 *    ilha de massas em `pasta-builder.tsx`, rótulo e uvas do vinho em
 *    `wine-list.tsx`, a nota de sobremesas para viagem em `dessert-list.tsx`,
 *    os estados vazios do buffet em `page.tsx`.
 * 2. As superfícies `bg-card` (cream, fixas, não mudam com este fundo)
 *    ganharam `text-card-foreground` para não herdar o texto claro de cima e
 *    sumir creme-sobre-creme — ver cada arquivo para a lista.
 *
 * Se este fundo voltar a ser claro algum dia, as duas mudanças acima
 * precisam reverter junto — não são independentes desta troca.
 *
 * ── A curva laranja de cada seção (`CurvaLaranja`, `menu-section.tsx`) ────
 *
 * Não mudou nesta tarefa — mantida por instrução explícita, decisão do
 * cliente pendente. Ela nasceu como fronteira de uma foto que sangrava
 * (não sangra mais desde 14/09) e hoje soma um segundo motivo laranja à
 * página, além do arco desta v11. Se as duas lerem como redundantes olhando
 * a página pronta, é ali que se corta — não aqui.
 *
 * `aria-hidden` porque é decoração pura, sem nada para um leitor de tela
 * anunciar. `pointer-events-none` para não roubar clique de nada que esteja
 * por cima. `-z-10` para ficar atrás do conteúdo da página.
 */
export function MenuBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundColor: "#2A1109",
        // Ordem importa: a primeira camada fica na frente. O creme vem
        // primeiro para nunca ser encoberto pela elipse marrom, bem maior,
        // caso as duas se sobreponham perto do canto inferior esquerdo.
        backgroundImage: [
          "radial-gradient(130% 43% at 26% 98%, #EFE9C2 0%, rgba(239,233,194,0.55) 20%, rgba(239,233,194,0) 48%)",
          "radial-gradient(165% 58% at 58% 64%, #7E3923 0%, rgba(126,57,35,0.82) 26%, rgba(126,57,35,0) 58%)",
          "radial-gradient(170% 42% at 78% 6%, #FB6B3A 0%, rgba(251,107,58,0.82) 22%, rgba(251,107,58,0) 52%)",
        ].join(", "),
      }}
    />
  );
}
