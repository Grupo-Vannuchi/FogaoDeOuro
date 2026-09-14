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
 *
 * ── Por que "sem forma reconhecível" venceu ───────────────────────────────
 *
 * Toda versão anterior tinha uma forma que dava para apontar e nomear —
 * círculo (v3), faixa (v8), fita (v5, v6, v9) — e nomear a forma foi
 * exatamente a queixa que derrubou cada uma: "parece uma mancha", "parece um
 * círculo", "muito escuro, muito feio". Um gradiente radial simples,
 * centrado na página e bem mais largo que alto (`120% 90%`), não desenha
 * contorno nenhum para o olho seguir — só esquenta o canto e esfria para o
 * centro. Não existe versão 11 óbvia aqui porque não sobrou forma para
 * trocar.
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
        background:
          "radial-gradient(120% 90% at 50% 40%, transparent 45%, rgba(126,57,35,0.16) 100%)",
      }}
    />
  );
}
