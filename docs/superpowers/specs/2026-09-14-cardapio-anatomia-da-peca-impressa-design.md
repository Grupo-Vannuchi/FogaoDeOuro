# Spec — O cardápio digital ganha a anatomia da peça impressa

**Data:** 2026-09-14
**Pedido:** o cliente quer o cardápio digital parecido com o cardápio físico da
casa. Estrutura e tipografia ficam; muda a gramática visual.
**Fonte normativa:** quatro páginas do cardápio impresso enviadas pelo cliente
em 14/09 — capa, Bebidas (Sucos + Café & Água), Refris & Cerveja, Sobremesas.
**Branch:** `main`.

---

## 1. Objetivo

O cardápio de hoje já usa as cores e a tipografia da casa, e ainda assim não
parece o cardápio da casa. O cliente apontou duas coisas: **o fundo** e **a
diagramação**.

Este spec trata as duas — e parte de uma descoberta que só apareceu ao ler as
páginas impressas.

---

## 2. A descoberta que reorienta o trabalho

**A peça tem duas linguagens, e o site vinha misturando as duas.**

| | Capa | Páginas de conteúdo |
|---|---|---|
| Fundo | couro marrom escuro, em relevo | madeira clara, calma |
| Blocos laranja | sim, grandes, em diagonal | não |
| Papel do laranja | massa de cor | **uma** curva, como acento |
| Tipografia | "MENU" em display | título em display, item em sem-serifa |

O fundo do cardápio digital foi refeito **nove vezes** entre 10 e 11/09, e o
cliente recusou todas. Relendo com as páginas na mão, ele estava certo nas
nove: eu vinha pondo a linguagem da **capa** em todas as telas. Nas páginas
onde o cardápio é lido, a peça é calma — madeira clara, uma foto sangrando no
topo, uma curva laranja. Nada mais.

**Consequência de projeto:** o fundo deixa de ser o assunto. A identidade passa
a ser carregada pelas seções, não por trás delas.

---

## 3. A anatomia de uma página impressa

Lida das três páginas de conteúdo, que repetem a mesma estrutura:

```
████████ foto sangrando, de ponta a ponta ████████
╲_________________ curva laranja _________________
              ╭────────────────╮
              │   Sobremesas   │   pílula marrom, texto branco,
              ╰────────────────╯   centrada, montada sobre a curva

              subtítulo centrado

  NOME DO ITEM ···························· R$ 16,00
  descrição miúda
  OUTRO ITEM ······························ R$ 14,00
  descrição miúda
```

Quatro gestos que o site não tem:

1. **Foto sangrando** — vai até a borda, sem margem nem moldura. Hoje as fotos
   são retângulos com canto arredondado, pousados no meio da coluna.
2. **Curva laranja** na fronteira entre foto e lista. Hoje não existe.
3. **Fio pontilhado** do nome até o preço. É o gesto mais reconhecível de
   cardápio impresso, e o digital não tem nenhum.
4. **Nome em caixa alta, descrição miúda embaixo.** Hoje nome e descrição têm
   pesos próximos.

E um que a peça faz e o site **não deve** copiar: a página impressa cabe numa
folha. A tela rola. "Uma seção por página" renderia cinco telas com muito vazio
no desktop.

---

## 4. Decisões fechadas com o cliente

| # | Decisão | Origem |
|---|---|---|
| 1 | Continuidade de marca, não fidelidade visual | cliente, 14/09 |
| 2 | Estrutura atual fica: mesmas seções, ordem, abas de dia | cliente |
| 3 | Tipografia fica: Grenze Gotisch + Geist | cliente |
| 4 | Títulos de seção, títulos de grupo e subtítulos **centralizados** | cliente |
| 5 | Linhas de item permanecem à esquerda | cliente |
| 6 | Corpo dos títulos e subtítulos **um degrau maior** | cliente |
| 7 | **Sem** os quadradinhos da margem direita | cliente |
| 8 | Display só nos títulos; nome do item em Geist caixa alta | cliente, opção A |

### Por que a decisão 8 não é "mudar a tipografia"

A Grenze Gotisch é uma **Textura** — a gótica de traço reto do letreiro da Rua
Frei Gaspar. Maiúscula de Textura é desenho ornamental, não letra de leitura:
`SUCO NATURAL · JARRA` em gótica vira emaranhado no celular.

A própria peça impressa resolve assim: display nos títulos, sem-serifa em caixa
alta nos itens. A decisão usa cada fonte onde a peça usa — não troca nenhuma.

---

## 5. O que muda, arquivo por arquivo

### 5.1 `components/cardapio/menu-backdrop.tsx` — encolhe a quase nada

As quatro fitas, a sombra e o véu saem. Sobra o chão creme (`--background`).

O componente pode até desaparecer: se nada mais desenha, a `<section>` herda o
creme do `body`. **Manter ou apagar é decisão de implementação**, não de
desenho — apagar é preferível se ficar vazio, para não deixar um componente que
existe sem fazer nada.

> **Registro histórico.** O docblock atual carrega as nove versões e o motivo de
> cada recusa. Esse texto não pode se perder: se o arquivo for apagado, o
> resumo vai para `docs/` ou para o docblock do `MenuSection`. É a memória que
> impede a décima tentativa.

### 5.2 `components/cardapio/menu-section.tsx` — **novo**

O componente que carrega a anatomia. Substitui `MenuPanel` + `MenuHeading`.

```tsx
<MenuSection
  id?="massas"
  photo?={{ src, alt }}      // sangra no topo; ausente → só a curva
  title
  subtitle?
>
  {children}
</MenuSection>
```

Responsabilidades:

- desenhar a foto sangrando, de ponta a ponta, **fora** das margens do
  `Container` — e sem canto arredondado no lado que encosta na borda;
- desenhar a curva laranja na fronteira;
- desenhar a pílula marrom com o título, centrada, montada sobre a curva;
- desenhar o subtítulo centrado;
- devolver a coluna `max-w-3xl` para o conteúdo.

**A curva** é um SVG de caminho único, `preserveAspectRatio="none"` na
horizontal — aqui esticar é correto, porque a forma é uma onda sem ângulo reto
para achatar. Foi ângulo reto esticado que matou a versão 1 do fundo.

### 5.3 As duas seções sem foto única

| Seção | Regra |
|---|---|
| Cardápio da Semana | sem `photo`. A curva vira divisória sobre o creme, e a pílula monta sobre ela. |
| Massas | o `PastaCarousel` **é** o sangramento: sobe para o topo da seção, de ponta a ponta, com as bolinhas abaixo da curva. |

### 5.4 `components/cardapio/menu-line.tsx` — **novo**

A linha do impresso, compartilhada por bebidas, sobremesas, vinhos e adicionais
da ilha:

```
NOME DO ITEM ····························· R$ 16,00
descrição miúda
```

- nome: Geist, `uppercase`, `tracking-wide`, cor `--brand`;
- fio: elemento flexível entre nome e preço, `border-bottom` pontilhada,
  alinhado à linha de base do texto;
- preço: `tabular-nums`, não encolhe;
- descrição: linha própria, corpo menor, `--muted-foreground`.

**Quebra de linha:** em telas estreitas o nome pode ocupar duas linhas. O fio
acompanha a última, e o preço nunca desce sozinho para uma linha órfã.

### 5.5 Listas que passam a usar `MenuLine`

`drink-list.tsx` · `dessert-list.tsx` · `wine-list.tsx` · os adicionais em
`pasta-builder.tsx`.

`dish-row.tsx` **não muda**: o buffet do dia não tem preço por item — o preço é
por quilo, e a decisão de não repetir valor por linha é anterior e continua
válida. Sem preço não há para onde o fio pontilhado ir.

### 5.6 Centralização e corpo

Valores explícitos, para ninguém precisar interpretar "um degrau":

| Elemento | Onde | Hoje | Fica |
|---|---|---|---|
| Título da seção | `ui/section.tsx`, tom `lg` | `text-4xl sm:text-5xl` | `text-5xl sm:text-6xl` |
| Subtítulo da seção | idem | `text-lg sm:text-xl` | `text-xl sm:text-2xl` |
| "Sucos", "Café e água", "Refrigerantes e cerveja" | `drink-list.tsx:39` | `text-xl sm:text-2xl`, à esquerda | `text-2xl sm:text-3xl`, **centralizado** |
| "Monte sua massa", "Adicionais" | `pasta-builder.tsx:76,150` | `text-2xl sm:text-3xl`, à esquerda | `text-3xl sm:text-4xl`, **centralizado** |
| "Adicione uma proteína" e os demais passos da ilha | `pasta-builder.tsx` | à esquerda | **centralizado**, mesma escala do passo |
| Nome do rótulo de vinho | `wine-list.tsx` | à esquerda | **centralizado** |
| Linhas de item | `MenuLine` | — | **à esquerda** |

O tom `md` do `SectionHeader` **não muda** — ele é usado pelo site inteiro, e
esta mudança é do cardápio. Só o `lg` cresce.

> **Cuidado com o título maior.** `text-6xl` em Grenze Gotisch, num título longo
> como "Massas — R$ 41,90", ocupa duas linhas no celular e pode empurrar a lista
> para baixo da dobra. Medir a altura da primeira dobra em 390px depois da
> mudança; se empurrar, o degrau do celular volta e só o `sm:` cresce.

### 5.7 `components/cardapio/menu-hero.tsx` — a capa assina

Faixa estreita no topo: couro `#5E2B1F → #7F3923`, dois blocos laranja
`#FB6B3A` em diagonal, "MENU" em Grenze Gotisch creme.

A foto do buffet e o preço por quilo **continuam onde estão**, logo abaixo. A
capa assina a página; não ocupa a primeira dobra — comida vende, couro não.

---

## 6. Contraste: o que a peça permite e o que não permite

Medições já feitas neste projeto, no composto renderizado:

| Combinação | Razão | Veredito |
|---|---|---|
| Branco sobre couro `#5E2B1F` | 11,41:1 | ✅ pílula e capa |
| Branco sobre couro `#7F3923` | 8,36:1 | ✅ |
| Creme `#EFE9C2` sobre couro | 9,29 / 6,81:1 | ✅ subtítulo na pílula |
| `--foreground` sobre laranja `#FB6B3A` | **2,17:1** | ❌ **nunca** |
| `--muted-foreground` sobre creme | 5,11:1 | ✅ |

**Regra dura:** a curva laranja é fronteira, nunca superfície de texto. Nenhum
texto pode cair sobre ela em nenhuma largura.

### Como verificar

Varredura do composto renderizado, com o texto escondido e a cor amostrada sob
cada elemento, em 1920 / 1440 / 390.

A varredura **precisa** da trava de pertencimento (`document.elementFromPoint`
confirma que o ponto amostrado pertence ao elemento medido). Sem ela, a
ferramenta acusou dezenas de falsos positivos em 11/09 e escondeu o único
defeito real. Antes de medir, apagar `.next/dev/cache/images` — trocar arquivo
em `public/` não invalida as versões otimizadas.

**Critério de aceitação:** 0 reprovas abaixo de 4,5:1 nas três larguras, nas
rotas `/cardapio` e `/`.

---

## 7. Fora de escopo

- **Fotos por item no buffet do dia.** O impresso mostra foto por item; o
  digital decidiu não mostrar, e a decisão continua válida: são dezenas de itens
  que mudam toda semana, e reservar espaço de imagem rende uma página altíssima
  com marcadores no lugar de comida (`dish-row.tsx`).
- **Reordenar ou reagrupar seções.** O cliente pediu a estrutura atual.
- **Trocar fontes.** Decisão 3.
- **A página `/` e as demais rotas.** Só `MenuHero` muda, e só no topo do
  cardápio.

---

## 8. Riscos

| Risco | Mitigação |
|---|---|
| A foto sangrando exige sair das margens do `Container`; feito errado, aparece rolagem horizontal | `overflow-x` conferido na varredura, comparando `scrollWidth` com `innerWidth` nas três larguras |
| O carrossel de massas sangrando pode brigar com o gesto de deslizar perto da borda | testar no toque; se brigar, o carrossel volta para dentro da coluna e a seção fica só com a curva |
| Nove versões de fundo recusadas — a décima pode ser recusada também | desta vez o fundo **sai** em vez de ser redesenhado; não há o que recusar |
| O docblock com as nove versões se perder ao apagar o `menu-backdrop` | migrar o resumo antes de apagar (§5.1) |

---

## 9. Ordem de execução sugerida

1. `MenuSection` e `MenuLine`, com as seções ainda usando o fundo antigo.
2. Migrar as cinco seções para `MenuSection`.
3. Migrar as listas para `MenuLine`.
4. Centralização e corpo (§5.6).
5. Remover o fundo antigo, migrando o docblock.
6. A faixa de capa no `MenuHero`.
7. Varredura de contraste e de rolagem horizontal.

Cada passo é publicável sozinho. O 5 depois do 2 de propósito: enquanto as
seções não carregarem a identidade, tirar o fundo deixa a página crua.
