# Marca — Fogão de Ouro

Em **agosto de 2026 o restaurante refez a marca**. A logo nova é puramente
tipográfica: "Fogão de Ouro" empilhado em duas linhas, com "RESTAURANTE" em
versalete espaçado embaixo, entre dois traços. **O fogão saiu do desenho**, e a
tagline deixou de ser "Restaurante Grill e Café".

O original entregue:

```
docs/Logos-fogao_de_Ouro/rebrand-2026-08/logo-principal.jpg   (2682x1568)
```

**Não houve entrega de vetor** — só esse JPEG, com o fundo creme queimado no
arquivo. Como o site precisa da marca a 44px no header, com fundo transparente e
com a tagline repintável para fundo escuro, o raster foi vetorizado aqui:

```
npm i -D potrace svgo && node scripts/vectorize-logo.mjs
```

O script está comentado com o método e os números. O resumo: a geometria vai
para o potrace, a cor é medida à parte e reproduzida como `<linearGradient>`
nativo, e o ajuste é **por letra** — a arte reinicia a queda de vermelho para
laranja a cada caractere, e um gradiente global deixava erro visível no miolo
das letras. Contra o JPEG original, o traçado erra **0,18% dos pixels**.

O script é determinístico: rodar de novo devolve os mesmos arquivos, byte a
byte. Se o cliente entregar o vetor um dia, jogue-o direto em `logo.svg` /
`wordmark.svg` / `logo-dark.svg` e o resto do site não precisa saber.

## Os arquivos

| arquivo | o que é | onde é usado |
|---|---|---|
| `wordmark.svg` | só "Fogão de Ouro", sem a tagline (1,56:1) | header, sidebar e login do admin |
| `logo.svg` | lockup completo, cores originais (1,38:1) | rodapé |
| `logo-dark.svg` | idem, tagline repintada de creme `#EFE9C2` | só como origem do `lockup.png` |
| `lockup.png` | raster 1000px de `logo-dark.svg` | `src/app/[locale]/opengraph-image.tsx` |
| `symbol.svg` | **o fogão da marca ANTIGA** | origem dos ícones |
| `symbol.png` | raster 512px de `symbol.svg` | `src/app/icon.tsx`, `apple-icon.tsx` |

Os PNG saem de `npm run brand:rasters`.

## Por que cada corte existe

**Wordmark separado.** O lockup é quase quadrado (1,38:1) e a linha
"RESTAURANTE" ocupa só 5% da sua altura. Numa barra de 64px, a tagline sairia
com 2px e viraria mancha — então o header carrega só o nome.

**A marca nova pede mais altura que a antiga.** A logo anterior era uma linha
deitada, 4,4:1, confortável a 28px. Esta é empilhada, então o header a mostra com
**44px** (`h-11`). Abaixo de ~40px o "de" fecha e some.

**Cut escuro do lockup.** A tagline é marrom `#85572b`; sobre o grafite
`#171615` do card de OG isso é ilegível. O cut escuro troca só o preenchimento
dessa linha pelo creme `#EFE9C2` (14,7:1). Nenhum outro elemento muda — o
wordmark em brasa já resolve sobre grafite (o laranja da ponta do degradê dá
5,99:1).

O site é **só tema claro** e por isso a página nunca renderiza esse cut: o rodapé
usa sempre o `logo.svg`. Ele continua no repo porque o `lockup.png` é rasterizado
a partir dele — se o lockup escuro sumir, o `npm run brand:rasters` quebra junto.

## ⚠️ O favicon ainda é o fogão da marca antiga

`symbol.svg` e `symbol.png` **não** vieram do rebrand: são o fogão recortado da
logo anterior, mantidos **por decisão explícita do cliente** em 21/08/2026.

O motivo de a pergunta existir: a marca nova não tem elemento compacto. É
tipografia empilhada em três linhas, e a 32×32 do favicon ela não se lê. Como o
rebrand não veio com um símbolo, e inventar um seria decisão de design que não
cabe aqui, o fogão antigo segue nos ícones.

Isso é uma assimetria consciente: **o favicon não bate com a marca do site.**
Não "conserte" trocando o `symbol.svg` pelo wordmark novo — a 32px o resultado é
uma mancha. A saída real é pedir ao designer uma versão compacta (um monograma
do "O" de Ouro é o candidato natural, é a letra mais distintiva da marca).

## Gradientes e satori

As rotas de imagem (`icon`, `apple-icon`, `opengraph-image`) embutem PNG, não
SVG: o satori, que gera essas imagens, não resolve referências `url(#gradiente)`
— e cada letra desta logo é um gradiente próprio.

## O wordmark sobre o creme

O degradê do wordmark vai de `#c1432a` a `#e6760f`. Sobre o creme `#EFE9C2` do
tema claro, a ponta laranja fica em torno de 2,4:1. É baixo, mas é **o uso
oficial da marca**: o próprio arquivo do cliente põe esse wordmark sobre esse
creme. Logotipos são explicitamente dispensados do critério de contraste da WCAG
(1.4.3), então o original foi mantido. A concessão vale para a logo e só para
ela — texto de interface continua seguindo a paleta corrigida (`#8A5206` no tema
claro).
