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
| `logo.png` | raster 1000px de `logo.svg` (claro) | `src/app/icon.tsx`, `apple-icon.tsx` |
| `monogram-o.svg` | o "O" de Ouro, recortado do `wordmark.svg` | nada hoje — ver abaixo |
| `monogram-o.png` | raster 512px de `monogram-o.svg` | nada hoje — ver abaixo |
| `symbol.svg` | **o fogão da marca ANTIGA** | nada — história |
| `symbol.png` | raster 512px de `symbol.svg` | nada — história |

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

## O favicon é o logotipo inteiro — decidido em 25/09/2026

`src/app/icon.svg` é o `logo.svg` numa moldura quadrada: mesma viewBox alargada
para 1739×1739 com folga de 8%, e um retângulo creme `#EFE9C2` atrás. Nada foi
recortado — o cliente pediu a marca inteira, com "RESTAURANTE" e tudo.

É a terceira marca neste lugar. A primeira foi o fogão da logo ANTIGA, posto
por decisão explícita do cliente em 21/08/2026 — o site carregou por um mês o
favicon de uma marca aposentada, e o README chamava isso de assimetria
consciente. Em 22/09 ele reviu e entrou o monograma do "O". Em 25/09 pediu o
logotipo completo.

`monogram-o.svg`/`.png` continuam no repositório e **não são código morto**:
são peças da marca, e voltar atrás é trocar um caminho em `icon.tsx`,
`apple-icon.tsx` e a viewBox do `icon.svg`.

### O que se perde no tamanho pequeno, medido

Renderizando o `icon.svg` em cada tamanho e ampliando sem suavizar:

| tamanho | resultado |
| --- | --- |
| 16×16 | mancha; lêem-se duas linhas laranja, não as palavras |
| **32×32** | **"Fogão" e "Ouro" legíveis**; "RESTAURANTE" vira borrão |
| 48×48 | confortável |
| 64×64 | nítido |

O caso que importa é o de 32: a aba pede 16 CSS px, mas em tela de densidade
dupla — a regra hoje — o sistema busca 32 de dispositivo. Em 16 real (favoritos
antigos, alguns leitores de feed) sobram a cor e a silhueta, que ainda
identificam a casa. O monograma ganhava nesse caso extremo; o cliente preferiu
ser reconhecido pelo nome no caso comum.

📌 **Correção de um número que circulou aqui.** Esta seção afirmava que a logo
é 1,71:1, e era sobre esse número que se apoiava o veredito de que o logotipo
inteiro "reprovou". Medida no `viewBox` do `logo.svg` — `614 253 1499 1086` —
ela é **1,38:1**. O aperto vertical é bem menor do que o texto antigo dizia.

⚠️ **Ao medir, não encadeie dois `resize` no mesmo pipeline do sharp** — ele
colapsa e aplica só o último sobre o original, e você "mede" uma imagem que
nunca existiu. Grave o arquivo pequeno em disco e releia para ampliar.

### As três rotas, e por que são três

| rota | formato | para quem |
| --- | --- | --- |
| `/icon.svg` | SVG, 2 KB | navegadores modernos — nítido em qualquer densidade |
| `/icon` | PNG 512 | fallback de quem não lê SVG |
| `/apple-icon` | PNG 180 | iOS, que não aceita SVG |

O SVG estático é o que **destrava o degradê**: ele não passa pelo satori (ver
a seção abaixo), então as referências `url(#gradiente)` funcionam. O
`apple-icon` leva recuo porque o iOS mascara o ícone num quadrado arredondado.

`symbol.svg`/`symbol.png` (o fogão) e `monogram-o.svg`/`.png` ficam no
repositório: são história e alternativas da marca, e não custam nada parados.

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
