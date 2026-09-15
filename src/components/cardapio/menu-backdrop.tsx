/**
 * O fundo da página do cardápio: um banho macio de terracota, quase uniforme,
 * sem forma nenhuma para o olho apontar. Ver "v16" abaixo para a técnica e os
 * valores finais; as quinze versões anteriores (e por que cada uma foi
 * recusada, ou substituída por um pedido novo do cliente) ficam registradas a
 * seguir, como memória do projeto — é essa memória que evita repetir a
 * décima sétima tentativa já testada e recusada.
 *
 * ⚠️ Este cabeçalho descreve só a versão ATUAL (v16). Ele ficou descrevendo a
 * v12 (a chama em S) por duas versões inteiras: a v13 trocou o fundo por uma
 * imagem e a v14 reescreveu a função inteira sem nunca ir ao ar, e nenhuma
 * das duas voltou aqui para atualizar o resumo. Se você mudar o fundo de
 * novo, atualize este parágrafo também, não só a seção "vN" no fim da lista.
 *
 * ── Quinze versões, e o que cada uma ensinou ──────────────────────────────
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
 * 13. **A imagem que o cliente mandou**, em vez de mais uma recriação. As
 *     versões 11 e 12 aproximaram em CSS referências que ele enviou como
 *     imagem — e cada aproximação virava uma referência nova. O método era o
 *     problema, não o desenho: imagem colada no chat não chega como arquivo,
 *     então eu vinha desenhando de memória o que ele já tinha pronto. Em
 *     14/09 ele salvou o arquivo e a aproximação deixou de ser necessária.
 *     Ver "v13" mais abaixo.
 * 14. O banho de terracota: pedido novo do cliente em 14/09, um banho macio e
 *     quase uniforme, sem forma. A terracota exata da referência (clara/média)
 *     não sustentava texto nenhum — 2,79:1 contra o creme, o mesmo problema de
 *     tom médio que já tinha derrubado a v8. Corrigida descendo um degrau de
 *     valor mantendo o matiz. Não foi ao ar na hora: ficou pronta neste
 *     arquivo, sem commit, quando o cliente trocou de novo o pedido para o
 *     papel kraft com formas em laranja (v15). **Voltou como a v16** — ver
 *     abaixo. Ver "v14" para a tabela de contraste que a construiu.
 * 15. Papel kraft com duas formas laranja arredondadas sobrepostas, e uma
 *     lente mais saturada nascendo sozinha da sobreposição. Foi ao ar em
 *     14/09 e durou um dia. Ver "v15" abaixo.
 * 16. Esta: a v14 de volta, agora montada de verdade. Em 15/09 o cliente viu
 *     o kraft na tela e pediu de volta a terracota que tínhamos testado na
 *     véspera. Não foi só desfazer o commit da v15: a v14 nunca tinha sido
 *     medida no texto de APOIO, e o tom que ela usava reprova. Ver "v16"
 *     abaixo.
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
 * **Aconteceu: a v15 é clara** (papel kraft, não mais preto), e a reversão
 * está feita — ver "v15" abaixo, que lista os mesmos arquivos desta vez
 * voltando de `text-background` para o quase-preto `#1A110C`.
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
 * ── v13: a imagem do cliente, e por que ela encerra o ciclo ───────────────
 *
 * Doze versões, e onze delas foram eu desenhando em CSS uma referência que o
 * cliente tinha mandado como imagem. **Imagem colada no chat não vira arquivo
 * no disco** — eu só a via. Então cada versão era uma aproximação de memória,
 * não batia, e ele mandava outra referência. O ciclo não era de gosto: era de
 * método.
 *
 * Em 14/09 ele salvou o arquivo em Downloads, e a aproximação deixou de ser
 * necessária. `public/cardapio/fundo-curvas.webp`: 1200×1789, 20 KB.
 *
 * **A origem é retrato (736×1097) e a tela do desktop é paisagem.** Com
 * `object-cover`, num monitor 1440×900 aparece a faixa central da imagem, não
 * ela inteira — o enquadramento no desktop não é o que se vê no celular. Foi
 * exatamente esse recorte que derrubou as versões 4 e 7; aqui ele é aceitável
 * porque a imagem é gradiente liso: não há assunto para cortar fora, só
 * curvas que continuam curvas em qualquer faixa.
 *
 * Ampliada de 736 para 1200 de largura a caminho do WebP. Ampliar costuma
 * borrar, mas um gradiente suave não tem aresta para borrar — e sem a
 * ampliação o desktop pediria quase o dobro da resolução da origem.
 *
 * ── O contraste foi medido na imagem, não estimado ────────────────────────
 *
 * Varrendo o arquivo inteiro pixel a pixel, o ponto mais claro é
 * `rgb(135,81,45)`. Sobre ele:
 *   • texto creme `#EFE9C2` .... 5,27:1  ✅
 *   • texto branco `#ffffff` .... 6,47:1  ✅
 *
 * É o PIOR caso da imagem toda, não uma amostra — por isso esta versão
 * dispensa véu por cima, ao contrário da v4, que precisou corrigir o rodapé
 * translúcido. Se alguém trocar a imagem, refaça esta varredura: o texto
 * solto desta página é claro, e uma imagem com qualquer região clara o apaga.
 *
 * ── v14: o banho de terracota, e o degrau que ele teve de descer ──────────
 *
 * Referência do cliente em 14/09: um banho macio de terracota, quase uniforme,
 * sem forma — o oposto de tudo que veio antes, que sempre tinha uma figura
 * para apontar.
 *
 * **O matiz é o da referência; o valor não.** Medido contra o texto creme
 * `#EFE9C2`, que é o que esta página usa no texto solto desde a v11:
 *
 *   terracota clara  #C87553 .... 2,79:1  ❌
 *   terracota média  #B5563A .... 3,93:1  ❌
 *   terracota escura #9A4530 .... 5,23:1  ✅
 *   ferrugem         #8A3B2A .... 6,24:1  ✅
 *   ferrugem funda   #6E2E20 .... 8,24:1  ✅
 *
 * A terracota da referência cai na faixa clara/média, e **tom médio não
 * sustenta texto nenhum** — nem claro nem escuro, porque fica longe dos dois
 * extremos. É a mesma parede do laranja `#FB6B3A` (2,17:1) que derrubou a v8.
 *
 * Por isso esta versão desce um degrau de valor mantendo o matiz: `#9A4530` no
 * ponto mais claro do banho, `#6E2E20` nas bordas. O pior contraste da página
 * passa a ser 5,23:1 em vez de 2,79.
 *
 * Quem quiser a terracota exata da referência precisa mudar OUTRA coisa junto:
 * ou o texto solto ganha superfície própria, ou a página inteira muda de
 * estratégia de cor. Só clarear o fundo apaga o texto.
 *
 * Não foi montada na hora: antes daquele commit o cliente trocou o pedido de
 * novo, para o papel kraft com formas em laranja da v15 abaixo. Ficou
 * registrada aqui pelo mesmo motivo que a v9 (as fitas dos quatro cantos)
 * ficou — é trabalho já testado, e refazê-lo do zero sem saber disso é o erro
 * que este arquivo existe para prevenir.
 *
 * **E foi exatamente isso que salvou o dia seguinte.** Em 15/09 o cliente
 * pediu esta terracota de volta; a seção acima era o único registro de que
 * ela existia, de qual era o hex e de por que o valor tinha descido um
 * degrau. Sem ela, a v16 teria recomeçado a busca do zero — e provavelmente
 * parado de novo na terracota clara da referência, que reprova.
 *
 * ── v15: papel kraft, duas formas em laranja, e a lente que a sobreposição desenha sozinha ──
 *
 * Referência do cliente em 14/09, a terceira do dia: uma base de papel kraft
 * (bege-amarronzado, grão de papel visível) com duas grandes formas
 * arredondadas em laranja sobrepostas, e uma lente mais saturada exatamente
 * onde elas se cruzam.
 *
 * **A lente não é uma terceira forma desenhada.** É `mixBlendMode: "multiply"`
 * nas duas formas laranja, empilhadas sobre o kraft: onde só uma forma cobre,
 * o kraft multiplica por ela uma vez; onde as duas se sobrepõem, multiplica
 * duas vezes seguidas — e a região fica sozinha mais escura e mais saturada,
 * sem precisar de um terceiro elemento apontando "aqui é a lente". Tentar
 * desenhar essa região à mão seria repetir o erro que a v13 resolveu do lado
 * da imagem: aproximar de memória algo que a composição já resolve sozinha.
 *
 * **O grão do papel** é um `<svg>` inline com `feTurbulence` (ruído fractal,
 * `type="fractalNoise"`) mais `feColorMatrix` (satura para cinza, senão o
 * ruído também teria matiz aleatório e empurraria a cor medida para fora do
 * previsto) por cima de tudo, em opacidade baixa (`0.05`) com
 * `mixBlendMode: "overlay"`. Zero requisição — é `<filter>`, não arquivo — e
 * discreto de propósito: grão, não chiado. Descartei textura em PNG/WebP
 * porque a v13 já mostrou o preço de imagem aqui (recorte de retrato vs.
 * paisagem) e um ruído fractal não tem enquadramento para cortar.
 *
 * ── A crise de contraste, e por que ela obriga a inverter o texto de novo ──
 *
 * Desde a v11 o texto solto desta página é `text-background` (creme,
 * `#EFE9C2`) porque o fundo era escuro. O kraft e o laranja são CLAROS — o
 * creme sobre eles é quase o mesmo problema que o preto original tinha sobre
 * o creme do site: pouco contraste, na direção oposta.
 *
 * Medido contra os três tons do fundo novo — o pior caso de cada candidato,
 * não uma amostra otimista:
 *
 * | candidato                | kraft `#C6A173` | laranja (1 forma) | lente (2 formas) |
 * |---------------------------|-----------------|-------------------|------------------|
 * | creme `#EFE9C2` (o de antes) | 1,96 ❌      | 2,73 ❌           | 2,72 ❌          |
 * | `--foreground` `#474544`  | 3,97 ❌         | 2,84 ❌           | 2,85 ❌          |
 * | branco                     | 2,40 ❌         | 3,36 ❌           | 3,34 ❌          |
 * | quase-preto `#1A110C`     | **7,74 ✅**     | **7,22 ✅**       | **6,74 ✅**      |
 *
 * **Só o quase-preto passa nos três.** Nem o creme que a página usa desde a
 * v11, nem o `--foreground` normal do tema (cinza escuro demais para este
 * fundo — dá certo sobre o creme do site, não sobre kraft nem laranja).
 *
 * A conversão de texto solto para `text-background` feita na v11 e ampliada
 * na v12 (ver "a consequência obrigatória" acima) é desfeita agora, em
 * sentido contrário. Os mesmos lugares que a v11/v12 listaram voltam, desta
 * vez para `#1A110C`:
 *
 * - Títulos e subtítulos de `MenuSection` (`menu-section.tsx`).
 * - Títulos e notas da ilha de massas em `pasta-builder.tsx`.
 * - Rótulo e linha de uvas do vinho em `wine-list.tsx`.
 * - Nota de sobremesas para viagem em `dessert-list.tsx`.
 * - Estados vazios do buffet em `page.tsx`.
 *
 * O texto de apoio (antes `text-background/70`) vira `#2A1B10` — um tom um
 * degrau mais claro que o título, mas ainda escuro o bastante para passar no
 * pior caso (a lente): 6,03:1 medido, contra o mínimo de 4,5. Não é opacidade
 * sobre o quase-preto: clarear um texto ESCURO com opacidade, sobre um fundo
 * CLARO, empurra a cor em direção ao fundo e reduz o contraste — o oposto do
 * que acontecia na v11/v12, onde o texto era claro sobre fundo escuro e a
 * opacidade escurecia na direção certa. Por isso é uma cor sólida nova, não
 * `text-foreground/70` nem `#1A110C` com alfa.
 *
 * `bg-card` não muda: já fixa `text-card-foreground`, e essa correção não
 * depende da cor do fundo por trás — continua certa com o kraft embaixo.
 *
 * ── Por que a forma não é tão vívida quanto o laranja `#DE6B32` puro ───────
 *
 * As formas usam `#DE6B32` a 8% de intensidade, não opacas. Multiplicar o
 * laranja opaco contra o kraft já dá 3,18:1 numa camada só — reprova; e
 * multiplicar o laranja opaco contra ele mesmo, na lente, dá 2,18:1 —
 * reprova bem pior. É o mesmo aprendizado da v14, uma seção acima: tom
 * "correto" na referência às vezes não sustenta texto nenhum, e a saída é
 * descer um degrau de valor mantendo o matiz — aqui, o degrau é intensidade,
 * não hex. Baixar para 8% deixa a lente e as formas claras o bastante para o
 * quase-preto passar com folga sem perder o matiz laranja nem a diferença
 * visível entre kraft → forma → lente.
 *
 * ── A armadilha: `opacity` não sobrevive à própria varredura ───────────────
 *
 * A primeira tentativa desta versão usava `style={{ opacity: 0.08 }}` nas
 * duas formas — CSS válido, `mixBlendMode` funcionando, tudo certo no
 * navegador. A varredura de contraste (ver `.superpowers/sdd/task-fundo-
 * kraft-report.md`) reprovou catastroficamente mesmo assim: pior caso
 * medido, **1,08:1**. A causa não era a cor — era o script de varredura.
 * Ele injeta `*, *::before, *::after { opacity: 1 !important }` de propósito
 * (para congelar animações de entrada antes de fotografar), e uma regra de
 * folha de estilo com `!important` VENCE `style=""` sem `!important` — então
 * a varredura, sem querer, acendia as duas formas em 100% de força antes de
 * medir. O usuário real nunca vê isso; só a varredura via.
 *
 * A saída: alfa embutido na COR (`rgba(222, 107, 50, 0.08)` via `comAlfa()`),
 * não na propriedade `opacity`. Não existe `background-color: … !important`
 * na regra da varredura, então o alfa sobrevive a ela — e o resultado visual
 * no navegador é idêntico, porque `opacity` e alfa de cor entram na mesma
 * fórmula de composição (`Cb·(1-α) + α·multiply(Cb,Cs)`); só o CAMINHO para
 * chegar no alfa muda. O grão de papel tinha o mesmo risco (`opacity: 0.05`
 * no `<svg>`) e ganhou o mesmo tratamento: `feFuncA` dentro do próprio
 * filtro, alfa cozinhado no pixel antes de qualquer CSS externo tocar o
 * elemento. Se alguém voltar a usar `opacity` num destes dois lugares, ou
 * atualiza a varredura para não forçá-la, ou vai repetir esta reprova.
 *
 * `public/cardapio/fundo-curvas.webp` (a imagem da v13) fica onde está,
 * sem uso: o cliente pode querer voltar a ela, e o arquivo não custa nada
 * parado no disco.
 *
 * ── v16: a v14 de volta — e o degrau que ela nunca tinha medido ────────────
 *
 * Em 15/09 o cliente viu o kraft da v15 no ar e pediu de volta a terracota da
 * véspera: "foi a cor que testamos ontem". É a v14, literalmente — o mesmo
 * `radial-gradient`, os mesmos três hexes que a tabela da v14 aprovou.
 *
 * **Mas não bastava desfazer a v15.** As duas versões discordam sobre a cor do
 * TEXTO, não só sobre a do fundo: a v14 é escura e pede texto creme (herdado
 * da v11/v12); a v15 é clara e inverteu tudo para quase-preto. Voltar o fundo
 * sem voltar o texto deixaria quase-preto sobre terracota: 2,89:1 no ponto
 * mais claro do banho e 1,84:1 na borda — pior do que qualquer coisa que este
 * arquivo já publicou. As duas metades andam
 * juntas, e é para isso que as constantes exportadas no fim do arquivo
 * existem: os cinco arquivos que desenham texto solto (`menu-section.tsx`,
 * `pasta-builder.tsx`, `wine-list.tsx`, `dessert-list.tsx` e a página do
 * cardápio) seguem `TEXTO_SOLTO`/`TEXTO_SOLTO_APOIO` e viraram junto, sem
 * cinco edições paralelas que poderiam divergir.
 *
 * **E aí apareceu o furo que a v14 tinha e ninguém tinha visto.** A tabela da
 * v14 mediu um candidato só: o creme cheio `#EFE9C2` (5,23 ✅). O texto de
 * APOIO daquela época não era creme cheio — era `text-background/70`, creme a
 * 70%. Medido agora, contra o ponto mais claro do banho:
 *
 *   creme cheio  #EFE9C2 .............. 5,23:1  ✅
 *   creme a 90%  #E7D9B3 .............. 4,58:1  ✅ (raspando)
 *   creme a 85%  #E2D0AC .............. 4,24:1  ❌
 *   creme a 70%  (o da v14) ........... 3,41:1  ❌
 *
 * Ou seja: se a v14 tivesse ido ao ar em 14/09 como estava, teria ido com
 * todo o texto de apoio da página reprovando. Ela nunca foi medida nesse
 * ponto porque nunca chegou a ser montada — a mesma razão que a preservou
 * intacta também escondeu o defeito.
 *
 * **Por que 70% funcionava antes e não funciona agora.** A regra não mudou;
 * a distância mudou. Misturar o texto em direção ao fundo SEMPRE reduz o
 * contraste — o que varia é o quanto, e isso depende de quão longe o fundo
 * está do texto. Sobre o quase-preto `#0B0503` da v11/v12, creme a 70% ainda
 * dava **8,17:1**: sobrava folga de sobra para gastar. Sobre esta terracota,
 * o mesmo 70% dá **3,41:1**. Fundo de tom médio não tem folga para gastar —
 * é a mesma parede que derrubou a v8 (laranja `#FB6B3A`, 2,17:1) e que fez a
 * própria v14 descer um degrau de valor. Herdar uma opacidade de uma versão
 * anterior é herdar a folga que aquela versão tinha, não a cor.
 *
 * Por isso `TEXTO_SOLTO_APOIO` aqui é `#E7D9B3` — uma cor sólida, o creme
 * misturado a 90%, não `#EFE9C2` com alfa. Passa em 4,58 e continua
 * visivelmente mais apagado que o título, que é a única coisa que a hierarquia
 * pedia da opacidade. Abaixo de 90% não existe margem: 85% já reprova.
 *
 * **O grão de papel da v15 não veio junto.** O cliente apontou uma tela sem
 * grão e disse "essa"; acrescentar textura seria devolver outra coisa. O
 * `feTurbulence` está no histórico do git (v15) se ele pedir.
 *
 * `bg-card` continua sem mudar, pelo mesmo motivo de sempre: fixa
 * `text-card-foreground` e não depende do que está por trás.
 *
 * `aria-hidden` porque é decoração pura, sem nada para um leitor de tela
 * anunciar. `pointer-events-none` para não roubar clique de nada que esteja
 * por cima. `-z-10` para ficar atrás do conteúdo da página.
 */

/**
 * As duas cores do texto solto desta página (fora de qualquer `bg-card`),
 * exportadas daqui porque este arquivo é a fonte da medição — ver "v16"
 * acima para a tabela completa. `menu-section.tsx`, `pasta-builder.tsx`,
 * `wine-list.tsx`, `dessert-list.tsx` e a página do cardápio importam estas
 * duas em vez de repetir o hex: uma cópia divergente aqui seria uma cor não
 * medida, exatamente o que este arquivo existe para evitar.
 *
 * Elas viram junto com o fundo, sempre. A v15 (kraft, clara) usava
 * quase-preto; esta volta ao creme porque o banho é escuro. Trocar um sem o
 * outro é o erro que a v16 quase cometeu — ver "v16" acima.
 */
export const TEXTO_SOLTO = "#EFE9C2";
/**
 * Texto de apoio — `#EFE9C2` misturado a 90% com o fundo, **como cor sólida**.
 * 4,58:1 contra `#9A4530`, o ponto mais claro do banho. Não use
 * `TEXTO_SOLTO` com alfa nem `text-background/70`: sobre um fundo de tom médio
 * a opacidade come o contraste rápido demais (70% = 3,41:1, reprova), e a v14
 * quase foi ao ar com esse defeito. Ver "v16" acima para a tabela.
 */
export const TEXTO_SOLTO_APOIO = "#E7D9B3";

/**
 * Os três tons do banho, do centro para a borda. Não são escolha livre: o
 * matiz veio da referência do cliente, mas o VALOR desceu um degrau porque a
 * terracota da referência (clara/média) não sustenta texto nenhum. A tabela
 * que fixou estes três hexes está em "v14" acima; a que fixou o texto que vai
 * por cima deles, em "v16".
 */
const CENTRO = "#9A4530";
const MEIO = "#8A3B2A";
const BORDA = "#6E2E20";

export function MenuBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundColor: BORDA,
        /* Uma elipse só, bem mais larga que alta e descentrada para a
           esquerda e para cima — o suficiente para o banho não ficar
           simétrico e parecer um alvo, longe demais de qualquer contorno
           para o olho ter o que seguir. É a lição da v10 ("sem forma
           reconhecível"), aplicada aqui sem nenhuma figura por cima.

           Tudo em `%` da própria caixa, herdado da v10/v11/v12: a proporção
           não muda com a largura da tela, então esta versão não precisa da
           calibração por breakpoint que as fitas da v9 exigiram. */
        backgroundImage: `radial-gradient(120% 95% at 42% 38%, ${CENTRO} 0%, ${MEIO} 45%, ${BORDA} 100%)`,
      }}
    />
  );
}
