/**
 * O fundo da página do cardápio: quase preto, com uma chama em S atravessando
 * — núcleo creme quente, quase branco, bordas em laranja forte, dissolvendo
 * no preto. Ver "v12" abaixo para a técnica e os valores finais; as onze
 * versões anteriores (e por que cada uma foi recusada) ficam registradas a
 * seguir, como memória do projeto — é essa memória que evita repetir a
 * décima terceira tentativa já testada e recusada.
 *
 * ── Doze versões, e o que cada uma ensinou ────────────────────────────────
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
 *     creme embaixo), como papel de parede. Três faixas diagonais
 *     empilhadas. Ver "v11" abaixo para a técnica e as cores.
 * 12. Esta: o cliente viu a v11 montada — fundo escuro, três faixas
 *     diagonais — e pediu mais simples: uma chama só, orgânica, em forma de
 *     S, em vez de faixas paralelas. Núcleo claro, quente, quase
 *     branco-creme; bordas em laranja forte; dissolve no preto. Junto veio o
 *     pedido de tirar a `CurvaLaranja` e a `Pilula` de cada seção
 *     (`menu-section.tsx`) — o título da seção virou texto solto, creme,
 *     sobre este fundo. Ver "v12" abaixo para a técnica, as cores finais e a
 *     verificação de rolagem que uma chama com núcleo claro obriga.
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
 * mesma pele de couro que aparecia na `Pilula` de `menu-section.tsx`
 * (`#7F3923`/`#5E2B1F`, removida na v12 — ver abaixo) e que vestia as fitas
 * da versão 9, amostrada de novo direto do arquivo do cliente. O hex sai um
 * dígito diferente do da `Pilula` porque é outro ponto do couro na arte, não
 * o mesmo valor duplicado com erro de digitação — não "corrija" um para
 * bater com o outro. A cor não é escolha livre; é amostra. (A v12 abandona
 * este marrom por completo — ver "v12" abaixo.)
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
 *   esse texto contra o próprio fundo.
 *
 * Todos os valores em `%`, herdado da v10: a proporção não muda com a
 * largura da tela, então não pede a calibração por pixel que a v9 exigia
 * (ver acima). `fixed` (não `absolute`) também herdado da v10 — o fundo
 * acompanha a janela, não o documento, e por isso todo texto que passa por
 * cima dele, rolando, cruza as quatro faixas em algum momento. Substituída
 * pela v12 em 14/09 — ver abaixo.
 *
 * ── v12: fundo quase preto, uma chama em S ────────────────────────────────
 *
 * O cliente viu a v11 montada (fundo escuro, três faixas diagonais — laranja,
 * marrom, creme) e pediu mais simples: uma chama só, orgânica, em forma de
 * S — sobe da parte de baixo à esquerda, curva, sai em cima à direita.
 * Núcleo claro, quente, quase branco-creme; bordas em laranja forte;
 * dissolve no preto. Nada de faixas paralelas — uma forma só, fluida, como
 * fogo visto de perto. Junto veio o pedido de tirar a `CurvaLaranja` e a
 * `Pilula` de cada seção (`menu-section.tsx`) — o título da seção virou
 * texto solto sobre este fundo (ver "a consequência obrigatória" e "a curva
 * laranja de cada seção" abaixo).
 *
 * **Técnica.** A mesma da v11 e da v10: `backgroundColor` escuro mais
 * `radial-gradient`s elípticos grandes empilhados em `backgroundImage`, cada
 * um centrado total ou parcialmente FORA da caixa — ela já provou escalar
 * para qualquer proporção de tela sem recorte. O que muda é a composição:
 * em vez de três arcos diagonais cobrindo a largura inteira da tela, duas
 * famílias de elipse. O CORPO (laranja) traça o caminho em S: cinco elipses
 * grandes, cada uma centrada total ou parcialmente fora da caixa, do canto
 * inferior-esquerdo ao superior-direito:
 *
 *   P0  `105% 58%` at `8% 114%`    base, fora da caixa — só o arco de cima entra
 *   P1  `88% 46%`  at `18% 80%`    subindo, ainda à esquerda
 *   P2  `60% 30%`  at `48% 54%`    cintura do S, cruza o centro da tela
 *   P3  `82% 40%`  at `76% 30%`    subindo à direita
 *   P4  `96% 50%`  at `92% -6%`    saída, fora da caixa — só o arco de baixo entra
 *
 * Todas em `#FB6B3A 0%, rgba(251,107,58,0.85) 30%, rgba(251,107,58,0) 58%`.
 * O NÚCLEO (creme, `#F7E2C0 0%, rgba(247,226,192,0.72) 22%, rgba(247,226,192,0)
 * 42%`) não segue os cinco pontos do corpo — está deliberadamente desacoplado
 * deles, por um motivo de legibilidade que precisa de conta feita, não de
 * olhômetro; ver "por que o núcleo mora na borda" abaixo. São só dois
 * pontos, pequenos (`6% 6%`), colados nas bordas esquerda e direita da tela:
 *
 *   N1  `6% 6%` at `1.5% 78%`   glint perto da base, braço esquerdo do S
 *   N2  `6% 6%` at `98.5% 26%`  glint perto da saída, braço direito do S
 *
 * `backgroundColor: #0B0503` — quase preto, não preto puro, para não achatar
 * a profundidade onde nenhuma elipse alcança. Empilhamento (primeira camada
 * na frente, mesma regra herdada da v10/v11): N1 e N2 vêm primeiro no array,
 * depois as cinco elipses do corpo (P0–P4) atrás delas — assim o núcleo
 * nunca fica encoberto pelo laranja onde as duas camadas se sobrepõem.
 *
 * **Por que o núcleo mora na borda.** A coluna de leitura (`max-w-3xl`,
 * `Container` em `menu-section.tsx`, `px-5`/`px-8` de gutter) fica
 * centralizada na página. Em 1440px ela ocupa ≈`336px`–`1104px` (a faixa
 * `23%`–`77%` da tela) — sobra bastante gutter dos dois lados. Em 390px o
 * gutter é só o `px-5` (20px): a coluna ocupa `20px`–`370px`, ou seja quase
 * a tela inteira (`5%`–`95%`). Como o fundo é `fixed` (herdado da v10/v11 —
 * ver "por que esta versão não pede calibração" acima), texto solto cruza
 * TODA posição vertical da tela em algum momento da rolagem — cada título e
 * cada parágrafo soltos varrem de `y=0` a `y=100%` conforme a página rola,
 * então a defesa contra sobreposição só pode ser horizontal; não existe
 * altura "segura". Com só 20px de gutter em 390px, não há espaço para
 * um núcleo de tamanho "normal" (o tamanho que o corpo laranja usa) caber
 * fora da coluna nas duas larguras ao mesmo tempo — por isso N1 e N2 são
 * pequenos (`6%` da largura da tela) e colados no 1,5% mais próximo de cada
 * borda, não nos mesmos pontos do caminho do corpo. Medido (script em
 * `.superpowers/sdd/task-fundo-chama-report.md`): em 390px o núcleo visível
 * (até a parada de opacidade zero) vai de `0,9px` a `10,8px` (N1) e de
 * `379,2px` a `389,1px` (N2) — a coluna começa em `20px` e termina em
 * `370px`, sobrando **9,2px** de folga dos dois lados. Em 1440px a folga
 * passa de `280px`. O corpo laranja (não é "a parte clara") pode cruzar a
 * coluna livremente — a régua do cliente é só sobre o núcleo.
 *
 * Verificado com Playwright, rolando a página inteira em 390px e 1440px —
 * ver `.superpowers/sdd/task-fundo-chama-report.md` para os comandos, os
 * elementos medidos e as capturas. Se alguém redesenhar as elipses, repita a
 * verificação: um núcleo reposicionado sem medir contra a coluna de leitura
 * nas duas larguras é a mesma aposta que a v11 já deixava sem garantia (ver
 * acima) — só que agora o risco é o oposto (núcleo claro apagando texto
 * claro, não fundo escuro apagando texto escuro).
 *
 * ── A consequência obrigatória: texto solto e cartões ─────────────────────
 *
 * Fundo escuro quebra `--foreground` (`#474544`, quase preto) — ilegível
 * sobre o preto de base e sobre o laranja da chama. A correção, criada na
 * v11 e mantida na v12, tem duas metades — nenhuma neste arquivo:
 *
 * 1. Texto solto (fora de qualquer `bg-card`) virou `text-background` /
 *    `text-background/70` — na v12 isso passou a incluir também os TÍTULOS
 *    de `MenuSection` (a `Pilula` que os envolvia, opaca, foi removida nesta
 *    versão — ver "a curva laranja de cada seção" abaixo), além dos
 *    subtítulos já convertidos na v11, títulos e notas da ilha de massas em
 *    `pasta-builder.tsx`, rótulo e uvas do vinho em `wine-list.tsx`, a nota
 *    de sobremesas para viagem em `dessert-list.tsx`, os estados vazios do
 *    buffet em `page.tsx`.
 * 2. As superfícies `bg-card` (cream, fixas, não mudam com este fundo)
 *    ganharam `text-card-foreground` para não herdar o texto claro de cima e
 *    sumir creme-sobre-creme — ver cada arquivo para a lista.
 *
 * O texto claro (`text-background`, creme) tem o problema oposto sobre o
 * núcleo da chama: creme sobre creme some. Como o título deixou de ter uma
 * pílula opaca atrás dele na v12, ele passou a correr esse risco em
 * qualquer seção — é por isso que o núcleo evita a coluna de leitura por
 * construção (ver "v12" acima), e não por ajuste de cor: escurecer o texto
 * não era a saída disponível (ver "v12" acima, "a régua do cliente").
 *
 * Se este fundo voltar a ser claro algum dia, as mudanças acima precisam
 * reverter junto — não são independentes desta troca.
 *
 * ── A curva laranja de cada seção (removida na v12) ───────────────────────
 *
 * `CurvaLaranja`, que vivia em `menu-section.tsx`, nasceu como fronteira de
 * uma foto que sangrava — a foto parou de sangrar em 14/09, e a curva ficou
 * como um segundo motivo laranja na página, ao lado do arco desta v11/v12.
 * Nesta tarefa (v12) o cliente decidiu: removida por completo, componente e
 * todos os usos, junto com o teste que a travava
 * (`test/a-curva-laranja-nunca-carrega-texto.test.tsx`, apagado com
 * `git rm` — sem o componente, não sobrava objeto para testar). Registrado
 * aqui porque este arquivo era o único lugar que ainda explicava por que ela
 * existia.
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
        backgroundColor: "#0B0503",
        // Ordem importa: a primeira camada fica na frente. N1 e N2 (o
        // núcleo creme, colado nas bordas — ver o docblock) vêm primeiro
        // para nunca ficarem encobertos pelas cinco elipses P0–P4 (o corpo
        // laranja da chama) que vêm atrás deles.
        backgroundImage: [
          "radial-gradient(6% 6% at 1.5% 78%, #F7E2C0 0%, rgba(247,226,192,0.72) 22%, rgba(247,226,192,0) 42%)",
          "radial-gradient(6% 6% at 98.5% 26%, #F7E2C0 0%, rgba(247,226,192,0.72) 22%, rgba(247,226,192,0) 42%)",
          "radial-gradient(105% 58% at 8% 114%, #FB6B3A 0%, rgba(251,107,58,0.85) 30%, rgba(251,107,58,0) 58%)",
          "radial-gradient(88% 46% at 18% 80%, #FB6B3A 0%, rgba(251,107,58,0.85) 30%, rgba(251,107,58,0) 58%)",
          "radial-gradient(60% 30% at 48% 54%, #FB6B3A 0%, rgba(251,107,58,0.85) 30%, rgba(251,107,58,0) 58%)",
          "radial-gradient(82% 40% at 76% 30%, #FB6B3A 0%, rgba(251,107,58,0.85) 30%, rgba(251,107,58,0) 58%)",
          "radial-gradient(96% 50% at 92% -6%, #FB6B3A 0%, rgba(251,107,58,0.85) 30%, rgba(251,107,58,0) 58%)",
        ].join(", "),
      }}
    />
  );
}
