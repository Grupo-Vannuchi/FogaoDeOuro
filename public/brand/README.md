# Marca — Fogão de Ouro

Todos os arquivos aqui derivam de **um único original** entregue pelo cliente:

```
docs/Logos-fogao_de_Ouro/SVG/Logo principal Fogão de Ouro sem fundo.svg
```

O original é um lockup empilhado num `viewBox` de 768×768 com bastante ar em
volta: wordmark em cima, o fogão no meio e "Restaurante Grill e Café" curvado
embaixo. Os 54 elementos de desenho se dividem em três blocos contíguos:

| elementos | bloco | cores |
|---|---|---|
| 0–17 | fogão | âmbar/ouro (`#e4ac10` e gradientes) |
| 18–41 | tagline curvada | grafite `#474544` (todos `cls-5`) |
| 42–53 | wordmark "Fogão de Ouro" | gradientes brasa→âmbar |

## Os arquivos

| arquivo | o que é | onde é usado |
|---|---|---|
| `wordmark.svg` | elementos 42–53, `viewBox` justo (4.40:1) | header, login do admin |
| `logo.svg` | lockup completo, cores originais | rodapé |
| `logo-dark.svg` | idem, tagline recolorida para o creme `#EFE9C2` | só como origem do `lockup.png` |
| `symbol.svg` | elementos 1–17, só o fogão | origem dos ícones |
| `symbol.png` | raster 512px de `symbol.svg` | `src/app/icon.tsx`, `apple-icon.tsx` |
| `lockup.png` | raster 1000px de `logo-dark.svg` | `src/app/[locale]/opengraph-image.tsx` |

Os PNG saem de `npm run brand:rasters`. Os SVG foram recortados uma única vez —
se o cliente entregar uma logo nova, o recorte precisa ser refeito à mão.

## Por que cada corte existe

**Wordmark separado.** O lockup é quase quadrado. No header, que tem 64px de
altura, a marca inteira caberia com ~28px e a tagline curvada viraria mancha.

**Cut escuro do lockup.** A tagline é grafite `#474544`; sobre o grafite
`#171615` isso dá **1,97:1** — ilegível. O cut escuro troca só o preenchimento
dessa linha pelo creme `#EFE9C2` (14,72:1). Nenhum outro elemento muda.

O site é **só tema claro** e por isso a página nunca renderiza esse cut: o
rodapé usa sempre o `logo.svg`. Ele continua no repo porque o `lockup.png` — o
card de OG, que mantém o fundo grafite — é rasterizado a partir dele. Se um dia
o lockup escuro sumir, o `npm run brand:rasters` quebra junto.

**Símbolo sem a haste.** O fogão se conecta ao "O" de *Ouro* por uma haste curta.
Ela está dentro do primeiro subpath do contorno, então não dá para removê-la como
forma — mas termina exatamente onde o corpo do fogão começa (`y≈370`), e o
`viewBox` do `symbol.svg` começa em `370.5` justamente para cortá-la fora. O
elemento 0, que era só o preenchimento da haste, foi descartado.

**Gradientes e satori.** As rotas de imagem (`icon`, `apple-icon`,
`opengraph-image`) embutem PNG, não SVG: o satori, que gera essas imagens, não
resolve referências `url(#gradiente)` — e cada peça desta logo é um gradiente.

## O wordmark sobre o creme

O âmbar puro `#E68A08` dá 2,14:1 sobre o creme do tema claro. É baixo, mas é
**exatamente o uso oficial da marca**: o arquivo `Logo principal Fogão de Ouro.svg`
do cliente põe esse mesmo wordmark sobre esse mesmo creme. Logotipos são
explicitamente dispensados do critério de contraste da WCAG (1.4.3), então o
original foi mantido sem alteração. A concessão vale para a logo e só para ela —
texto de interface continua seguindo a paleta corrigida (`#8A5206` no tema claro).
