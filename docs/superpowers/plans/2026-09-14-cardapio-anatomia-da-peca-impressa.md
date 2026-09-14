# Cardápio com a anatomia da peça impressa — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** dar às seções do `/cardapio` a anatomia de uma página do cardápio impresso — foto sangrando, curva laranja, pílula marrom com o título e lista com fio pontilhado — e tirar o fundo decorativo, que passa a não ser mais necessário.

**Architecture:** dois componentes novos carregam a identidade. `MenuSection` desenha a anatomia da página (foto de ponta a ponta, curva, pílula, subtítulo) e devolve a coluna de leitura para o conteúdo; `MenuLine` desenha a linha do impresso (nome em caixa alta, fio pontilhado, preço). As cinco seções de hoje viram sete, porque cada grupo de bebida passa a ser uma seção própria — é o que a peça faz, uma página por grupo. O `MenuBackdrop` é apagado: com as seções carregando a cor, o fundo vira creme liso.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19 com React Compiler, Tailwind v4, next-intl (só `pt`), Vitest + Testing Library + vitest-axe, sharp para imagens.

## Global Constraints

- **Spec normativo:** [`docs/superpowers/specs/2026-09-14-cardapio-anatomia-da-peca-impressa-design.md`](../specs/2026-09-14-cardapio-anatomia-da-peca-impressa-design.md). Em divergência, o spec vence.
- **Tipografia não muda.** `font-serif` é Grenze Gotisch e fica só em títulos. Nome de item é `font-sans` (Geist) em caixa alta. **Nunca** caixa alta na gótica.
- **Nenhum texto sobre laranja.** `--foreground` sobre `#FB6B3A` dá **2,17:1**. A curva é fronteira, nunca superfície de texto.
- **Critério de contraste:** 0 reprovas abaixo de **4,5:1** em 1920 / 1440 / 390, medido no composto renderizado.
- **Antes de qualquer medição visual:** `rm -rf .next/dev/cache/images`. Trocar arquivo em `public/` não invalida as versões otimizadas.
- **Catálogo:** só existe `src/messages/pt.json`. Não há `en.json` para sincronizar.
- **Commits:** convenção do repositório (`UPD:`, `CRE:`, `CRX:`, `RMV:`), e a mensagem termina com `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **Validação a cada tarefa:** `npm run typecheck && npm run lint && npx vitest run`. Lint tem base de **11 avisos e 0 erros** — subir de 11 é regressão.
- **Não rodar `npm run build` com o servidor de desenvolvimento no ar:** o build destrói `.next/dev/routes-manifest.json`.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/components/cardapio/menu-line.tsx` | **novo** — a linha do impresso: nome, fio pontilhado, preço, observação |
| `src/components/cardapio/menu-section.tsx` | **novo** — a anatomia da página: foto sangrando, curva, pílula, subtítulo |
| `src/components/cardapio/menu-panel.tsx` | **apagado** — `MenuSection` o substitui |
| `src/components/cardapio/menu-backdrop.tsx` | **apagado** — o fundo sai |
| `src/app/[locale]/(marketing)/cardapio/page.tsx` | passa a montar 7 seções com `MenuSection` |
| `src/components/cardapio/drink-list.tsx` | deixa de renderizar título e foto; passa a receber um grupo |
| `src/components/cardapio/dessert-list.tsx` | usa `MenuLine` |
| `src/components/cardapio/wine-list.tsx` | usa `MenuLine` |
| `src/components/cardapio/pasta-builder.tsx` | usa `MenuLine` nos adicionais; títulos centralizados |
| `src/components/ui/section.tsx` | o tom `lg` cresce um degrau |
| `src/components/cardapio/menu-hero.tsx` | ganha a faixa de capa no topo |
| `public/sobremesas/petit-gateau-largo.webp` | **novo** — a foto que sangra em Sobremesas |
| `test/o-preco-nunca-se-separa-do-item.test.tsx` | **novo** |
| `test/a-curva-laranja-nunca-carrega-texto.test.tsx` | **novo** |
| `scripts/varre-contraste.mjs` | **novo** — a varredura do composto, com a trava de pertencimento |

### As sete seções, na ordem

| # | Seção | Âncora | Foto que sangra |
|---|---|---|---|
| 1 | Cardápio da Semana | — | nenhuma (só a curva) |
| 2 | Massas | `massas` | o `PastaCarousel` |
| 3 | Sobremesas | — | `/sobremesas/petit-gateau-largo.webp` |
| 4 | Sucos | `bebidas` | `/bebidas/suco.webp` |
| 5 | Café e água | — | nenhuma (só a curva) |
| 6 | Refrigerantes e cerveja | — | `/bebidas/refrigerante.webp` |
| 7 | Carta de vinhos | — | `/bebidas/carta-de-vinhos.webp` |

> **As âncoras `massas` e `bebidas` são preservadas** ainda que nada no site aponte para elas — link externo indexado não aparece numa busca do repositório, e manter o `id` custa zero.

> **"Café e água" fica sem foto de propósito.** As duas fotos de café que chegaram foram recusadas: uma saía com a xícara fatiada (85% da silhueta direita era parede reta) e a outra tinha marca d'água de banco de imagens.

---

### Task 1: `MenuLine` — a linha do impresso

**Files:**
- Create: `src/components/cardapio/menu-line.tsx`
- Test: `test/o-preco-nunca-se-separa-do-item.test.tsx`

**Interfaces:**
- Consumes: `formatBRL` de `@/config/menu`
- Produces: `MenuLine({ name, price, note? }: { name: string; price: number; note?: string })` — renderiza um `<li>`. Tarefas 4 e 5 consomem.

- [ ] **Step 1: Write the failing test**

Create `test/o-preco-nunca-se-separa-do-item.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { MenuLine } from "@/components/cardapio/menu-line";

/**
 * O fio pontilhado é decoração, e decoração não pode virar conteúdo.
 *
 * No impresso, o fio leva o olho do nome até o preço. Na tela ele é um
 * elemento vazio com borda pontilhada — e um leitor de tela que o anunciasse
 * leria ruído entre o prato e o valor. Daí o `aria-hidden`.
 *
 * O segundo teste é o que mais importa: nome e preço têm de sair na MESMA
 * linha da árvore, porque é essa vizinhança que diz "este valor é deste item".
 * Se alguém separar os dois em blocos irmãos para facilitar o layout, a
 * relação some para quem não vê a tela.
 */
describe("MenuLine", () => {
  it("não deixa o fio pontilhado virar conteúdo lido", () => {
    const { container } = render(
      <ul>
        <MenuLine name="Suco natural" price={12} note="300 ml" />
      </ul>,
    );
    const fio = container.querySelector("[data-fio]");
    expect(fio).not.toBeNull();
    expect(fio).toHaveAttribute("aria-hidden", "true");
    expect(fio).toHaveTextContent("");
  });

  it("mantém nome e preço dentro do mesmo item de lista", () => {
    render(
      <ul>
        <MenuLine name="Suco natural" price={12} />
      </ul>,
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent("Suco natural");
    expect(item).toHaveTextContent("R$ 12,00");
  });

  it("só desenha a observação quando ela existe", () => {
    const { rerender } = render(
      <ul>
        <MenuLine name="Café expresso" price={7} note="50 ml" />
      </ul>,
    );
    expect(screen.getByText("50 ml")).toBeInTheDocument();

    rerender(
      <ul>
        <MenuLine name="Café expresso com leite" price={7} />
      </ul>,
    );
    expect(screen.queryByText("50 ml")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run test/o-preco-nunca-se-separa-do-item.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/cardapio/menu-line"`.

- [ ] **Step 3: Write the component**

Create `src/components/cardapio/menu-line.tsx`:

```tsx
import { formatBRL } from "@/config/menu";

/**
 * Uma linha do cardápio, no desenho da peça impressa:
 *
 *     NOME DO ITEM ····························· R$ 16,00
 *     observação miúda
 *
 * ── Por que caixa alta em Geist, e não na gótica ──────────────────────────
 *
 * A `font-serif` deste projeto é a Grenze Gotisch, uma **Textura** tirada do
 * letreiro da Rua Frei Gaspar. Maiúscula de Textura é desenho ornamental, não
 * letra de leitura: "SUCO NATURAL · JARRA" em gótica vira um emaranhado no
 * celular.
 *
 * A peça impressa resolve do mesmo jeito — display no título da seção,
 * sem-serifa em caixa alta no item. Isto não troca tipografia; usa cada fonte
 * onde a peça usa.
 *
 * ── O fio ─────────────────────────────────────────────────────────────────
 *
 * `flex-1` entre nome e preço, com borda pontilhada. `self-end` mais uma
 * margem em `em` o assentam na linha de base: um elemento vazio não tem linha
 * de base própria, então `items-baseline` sozinho o jogaria para o topo.
 *
 * `aria-hidden` porque é decoração. Sem isso, um leitor de tela anuncia ruído
 * entre o prato e o valor.
 *
 * ── Quebra em tela estreita ───────────────────────────────────────────────
 *
 * `min-w-0` no nome o deixa quebrar em duas linhas em vez de empurrar o preço
 * para fora. O fio acompanha a última linha (é `self-end`), e o preço não
 * encolhe — nunca desce sozinho para uma linha órfã.
 */
export function MenuLine({
  name,
  price,
  note,
}: {
  name: string;
  price: number;
  note?: string;
}) {
  return (
    <li className="py-3">
      <div className="flex items-baseline gap-2">
        <span className="min-w-0 font-sans text-sm font-semibold uppercase tracking-wide text-brand sm:text-base">
          {name}
        </span>
        <span
          aria-hidden
          data-fio
          className="mb-[0.3em] min-w-4 flex-1 self-end border-b border-dotted border-brand/40"
        />
        <span className="shrink-0 font-sans text-sm font-semibold tabular-nums text-brand sm:text-base">
          {formatBRL(price)}
        </span>
      </div>
      {note ? (
        <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>
      ) : null}
    </li>
  );
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run test/o-preco-nunca-se-separa-do-item.test.tsx`
Expected: PASS — 3 testes.

- [ ] **Step 5: Validate and commit**

```bash
npm run typecheck && npm run lint && npx vitest run
git add src/components/cardapio/menu-line.tsx test/o-preco-nunca-se-separa-do-item.test.tsx
git commit -m "$(cat <<'MSG'
CRE: a linha do cardápio ganha o fio pontilhado da peça impressa

Nome em caixa alta, fio pontilhado até o preço, observação miúda embaixo — o
gesto mais reconhecível de cardápio impresso, e o digital não tinha nenhum.

Caixa alta em Geist e não na gótica: a Grenze Gotisch é uma Textura, e
maiúscula de Textura é ornamento, não letra de leitura. A peça impressa faz
igual — display no título, sem-serifa no item.

O fio é `aria-hidden`: decoração que um leitor de tela anunciasse viraria
ruído entre o prato e o valor.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
)"
```

---

### Task 2: `MenuSection` — a anatomia da página

**Files:**
- Create: `src/components/cardapio/menu-section.tsx`
- Test: `test/a-curva-laranja-nunca-carrega-texto.test.tsx`

**Interfaces:**
- Consumes: `Container` de `@/components/ui/container`
- Produces:
  ```ts
  MenuSection({
    id?: string;
    photo?: { src: string; alt: string };
    bleed?: React.ReactNode;   // alternativa à foto: o carrossel das massas
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  })
  ```
  Tarefa 3 consome.

- [ ] **Step 1: Write the failing test**

Create `test/a-curva-laranja-nunca-carrega-texto.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { MenuSection } from "@/components/cardapio/menu-section";

/**
 * A regra dura desta página: **nada de texto sobre o laranja.**
 *
 * `--foreground` sobre `#FB6B3A` dá 2,17:1 — menos da metade do mínimo de 4,5.
 * Não há ajuste de token que salve; a única saída é a curva nunca carregar
 * texto.
 *
 * O teste trava isso na estrutura, não na aparência: a curva é um SVG
 * `aria-hidden` e não pode ter nenhum descendente de texto. Se alguém um dia
 * resolver pôr o nome da seção "dentro" da curva para economizar altura, o
 * teste reprova antes de a tela chegar a alguém.
 *
 * O segundo caso cobre as duas seções sem foto (Cardápio da Semana e Café e
 * água): sem imagem, a curva continua existindo e vira divisória. Sem ela, a
 * seção perderia o gesto que a liga à peça impressa.
 */
describe("MenuSection", () => {
  it("mantém a curva fora da árvore de acessibilidade e sem texto", () => {
    const { container } = render(
      <MenuSection title="Sobremesas" subtitle="Sempre disponíveis.">
        <p>conteúdo</p>
      </MenuSection>,
    );
    const curva = container.querySelector("[data-curva]");
    expect(curva).not.toBeNull();
    expect(curva).toHaveAttribute("aria-hidden", "true");
    expect(curva).toHaveTextContent("");
  });

  it("desenha a curva mesmo sem foto", () => {
    const { container } = render(
      <MenuSection title="Café e água">
        <p>conteúdo</p>
      </MenuSection>,
    );
    expect(container.querySelector("[data-curva]")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("põe o título num cabeçalho de seção e mostra a foto quando existe", () => {
    render(
      <MenuSection
        title="Sucos"
        photo={{ src: "/bebidas/suco.webp", alt: "Três copos de suco" }}
      >
        <p>conteúdo</p>
      </MenuSection>,
    );
    expect(
      screen.getByRole("heading", { name: "Sucos", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Três copos de suco")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run test/a-curva-laranja-nunca-carrega-texto.test.tsx`
Expected: FAIL — `Failed to resolve import "@/components/cardapio/menu-section"`.

- [ ] **Step 3: Write the component**

Create `src/components/cardapio/menu-section.tsx`:

```tsx
import Image from "next/image";
import { Container } from "@/components/ui/container";

/**
 * A curva laranja que separa a foto da lista.
 *
 * `preserveAspectRatio="none"` **é correto aqui**, ao contrário do que matou a
 * primeira versão do fundo em 10/09: lá a forma tinha ângulo reto, e esticar
 * achata ângulo. Onda não tem ângulo para achatar — esticar só a alonga.
 *
 * O laranja preenche a faixa colada na foto; abaixo da onda fica transparente,
 * e o creme da página aparece. Assim a curva lê como fronteira, não como banda.
 */
function CurvaLaranja() {
  return (
    <svg
      aria-hidden
      data-curva
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      className="-mt-px block h-5 w-full sm:h-8"
    >
      <path
        d="M0,0 H1440 V12 C1140,40 900,2 660,22 C420,42 200,8 0,26 Z"
        fill="#FB6B3A"
      />
    </svg>
  );
}

/**
 * A pílula marrom com o nome da seção.
 *
 * Vem da peça impressa, onde cada página abre com um retângulo escuro e o nome
 * em branco. Não é o cartão que o cliente recusou em 10/09 — aquele
 * emoldurava o conteúdo inteiro; este é o letreiro da seção.
 *
 * As cores saem do arquivo da arte, não de escolha: `#7F3923` é o couro
 * iluminado e `#5E2B1F` o couro na sombra. Branco sobre eles dá 8,36:1 e
 * 11,41:1.
 */
function Pilula({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-full px-8 py-3 shadow-sm sm:px-12 sm:py-4"
      style={{ background: "linear-gradient(135deg, #7F3923 0%, #5E2B1F 100%)" }}
    >
      {children}
    </div>
  );
}

/**
 * Uma seção do cardápio com a anatomia de uma página da peça impressa:
 *
 *     ████ foto sangrando, de ponta a ponta ████
 *     ╲________ curva laranja _________________
 *              ╭──────────────╮
 *              │  Sobremesas  │
 *              ╰──────────────╯
 *              subtítulo centrado
 *
 *              conteúdo, na coluna de leitura
 *
 * ── Sangrar ──────────────────────────────────────────────────────────────
 *
 * A foto vai até a borda da tela, sem margem nem canto arredondado. É o que a
 * peça faz e é o que separa "site com as cores do cardápio" de "cardápio na
 * tela". Por isso ela fica FORA do `Container` — quem entra na coluna é só o
 * conteúdo.
 *
 * `bleed` é a alternativa à foto, para a seção de massas: lá quem sangra é o
 * carrossel. Passar os dois é erro de uso; `photo` vence.
 *
 * ── Sem foto, a curva fica ───────────────────────────────────────────────
 *
 * Duas seções não têm foto (Cardápio da Semana e Café e água). A curva
 * continua e vira divisória: é ela que liga a seção à peça impressa.
 *
 * ── A regra dura ─────────────────────────────────────────────────────────
 *
 * **Nenhum texto sobre a curva.** `--foreground` sobre `#FB6B3A` dá 2,17:1.
 * A pílula monta sobre ela com margem negativa, mas o texto vive dentro da
 * pílula, sobre o couro — não sobre o laranja.
 */
export function MenuSection({
  id,
  photo,
  bleed,
  title,
  subtitle,
  children,
}: {
  id?: string;
  photo?: { src: string; alt: string };
  bleed?: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pb-12 sm:pb-16">
      {photo ? (
        <div className="relative h-[42vw] max-h-80 min-h-40 w-full">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            loading="lazy"
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : (
        bleed
      )}

      <CurvaLaranja />

      <Container className="max-w-3xl">
        <div className="-mt-6 flex flex-col items-center gap-4 text-center sm:-mt-8">
          <Pilula>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
          </Pilula>
          {subtitle ? (
            <p className="max-w-xl text-pretty text-xl text-muted-foreground sm:text-2xl">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run test/a-curva-laranja-nunca-carrega-texto.test.tsx`
Expected: PASS — 3 testes.

- [ ] **Step 5: Validate and commit**

```bash
npm run typecheck && npm run lint && npx vitest run
git add src/components/cardapio/menu-section.tsx test/a-curva-laranja-nunca-carrega-texto.test.tsx
git commit -m "$(cat <<'MSG'
CRE: a seção do cardápio ganha a anatomia da página impressa

Foto sangrando de ponta a ponta, curva laranja na fronteira, pílula marrom com
o nome da seção montada sobre ela. É o que as quatro páginas do impresso fazem,
e é o que faltava para a tela parecer o cardápio da casa.

A foto fica FORA do `Container` de propósito: sangrar é ir até a borda, sem
margem. Quem entra na coluna de leitura é só o conteúdo.

`preserveAspectRatio="none"` na curva é correto, ao contrário da primeira
versão do fundo em 10/09: lá a forma tinha ângulo reto, e esticar achata
ângulo. Onda não tem ângulo para achatar.

O teste trava a regra dura: nenhum texto sobre o laranja, que dá 2,17:1.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
)"
```

---

### Task 3: A foto larga de sobremesa

**Files:**
- Create: `public/sobremesas/petit-gateau-largo.webp`
- Modify: `src/messages/pt.json` (nova chave `dessertsPhotoAlt`)

**Interfaces:**
- Produces: o arquivo e a chave que a Task 4 usa na seção de Sobremesas.

- [ ] **Step 1: Gerar o arquivo**

A origem é a foto que o cliente mandou em 11/09. O card das sobremesas usa o recorte quadrado; aqui é preciso um 16:9 para sangrar.

```bash
cd "c:/Users/Usuario/OneDrive - Moraes Vannuchi/Documentos/GitHub/FogaoDeOuro"
node -e "
const sharp=require('sharp');const fs=require('fs');
(async()=>{
  const src='C:/Users/Usuario/Downloads/ChatGPT Image 11 de set. de 2026, 15_41_29.png';
  const m=await sharp(src).metadata();
  const alvoH=Math.round(m.width*9/16);
  const topo=Math.round((m.height-alvoH)*0.55);
  await sharp(src).extract({left:0,top:topo,width:m.width,height:alvoH})
    .resize(1600,900).webp({quality:82}).toFile('public/sobremesas/petit-gateau-largo.webp');
  const n=await sharp('public/sobremesas/petit-gateau-largo.webp').metadata();
  console.log(n.width+'x'+n.height, (fs.statSync('public/sobremesas/petit-gateau-largo.webp').size/1024).toFixed(0)+' KB');
})();
"
```

Expected: `1600x900` e peso abaixo de 160 KB.

> Se o arquivo de origem não existir mais em Downloads, pare e peça a foto ao cliente. **Não** aproveitar `public/sobremesas/petit-gateau.webp`: ele é 640×640, e esticar um quadrado para 16:9 deforma o prato.

- [ ] **Step 2: Conferir o recorte com os próprios olhos**

Abra `public/sobremesas/petit-gateau-largo.webp`. O prato tem de aparecer inteiro, sem corte na borda inferior. Se estiver cortado, ajuste o `0.55` do passo anterior para baixo e regenere.

- [ ] **Step 3: Adicionar o texto alternativo**

Em `src/messages/pt.json`, no objeto `cardapio`, logo depois de `"dessertsNote"`:

```json
    "dessertsPhotoAlt": "Petit gâteau de chocolate com sorvete de creme e calda, servido no salão do Fogão de Ouro",
```

- [ ] **Step 4: Conferir que o JSON continua válido**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/messages/pt.json','utf8')); console.log('ok')"`
Expected: `ok`

- [ ] **Step 5: Commit**

```bash
git add public/sobremesas/petit-gateau-largo.webp src/messages/pt.json
git commit -m "$(cat <<'MSG'
CRE: a foto larga do petit gâteau, para sangrar em Sobremesas

O card das sobremesas usa o recorte quadrado de 640px; a seção precisa de um
16:9 para ir de ponta a ponta. Mesma origem, recorte próprio — esticar o
quadrado deformaria o prato.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
)"
```

---

### Task 4: A página passa a montar sete seções

**Files:**
- Modify: `src/app/[locale]/(marketing)/cardapio/page.tsx` (arquivo inteiro)
- Modify: `src/components/cardapio/drink-list.tsx` (deixa de desenhar título e foto)
- Delete: `src/components/cardapio/menu-panel.tsx`

**Interfaces:**
- Consumes: `MenuSection` (Task 2), `dessertsPhotoAlt` (Task 3)
- Produces: `DrinkGroupList({ group }: { group: (typeof drinkGroups)[number] })` — só o `<ul>` do grupo.

- [ ] **Step 1: Reduzir `drink-list.tsx` à lista**

Substitua o conteúdo de `src/components/cardapio/drink-list.tsx` por:

```tsx
import { drinkGroups } from "@/config/menu";
import { MenuLine } from "@/components/cardapio/menu-line";

/**
 * A lista de um grupo de bebidas.
 *
 * ── O grupo virou a seção ─────────────────────────────────────────────────
 *
 * Até 14/09 este componente desenhava os três grupos, cada um com título e
 * foto, dentro de uma seção "Bebidas". A peça impressa faz diferente: **cada
 * página é um grupo** — Sucos e Café numa, Refris & Cerveja noutra —, com sua
 * foto e seu letreiro.
 *
 * Agora a página monta uma `MenuSection` por grupo, e o que sobra aqui é a
 * lista. Título e foto são responsabilidade da seção.
 *
 * O volume vai como observação do `MenuLine`, e é ele que distingue duas
 * linhas homônimas: refrigerante de 200 ml e de 350 ml são itens diferentes,
 * com preços diferentes.
 */
export function DrinkGroupList({
  group,
}: {
  group: (typeof drinkGroups)[number];
}) {
  return (
    <ul className="mt-10 divide-y divide-border">
      {group.items.map((bebida) => (
        <MenuLine
          key={`${bebida.name}-${bebida.volume}`}
          name={bebida.name}
          price={bebida.price}
          note={bebida.volume || undefined}
        />
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Reescrever a página**

Substitua o corpo do `return` em `src/app/[locale]/(marketing)/cardapio/page.tsx`. Ajuste os imports do topo: sai `MenuBackdrop`, saem `MenuPanel`/`MenuHeading`, sai `SectionHeader`, sai `DrinkList`; entram `MenuSection`, `DrinkGroupList` e `drinkGroups`.

```tsx
  return (
    <>
      <MenuHero />

      {/* 1 — O buffet do dia. Sem foto: são dezenas de pratos que mudam toda
             semana, e nenhuma imagem representa "quarta-feira". A curva vira
             divisória e a seção abre direto no letreiro. */}
      <MenuSection title={t("title")} subtitle={t("subtitle")}>
        <div className="mt-10">
          <PriceCallout />
        </div>

        {buffet.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="mt-12">
            <DayTabs
              labels={labels}
              todayLabel={t("today")}
              selectorLabel={t("daySelectorLabel")}
            >
              {WEEKDAYS.map((day) => {
                const dishes = dishesOf(day);
                if (dishes.length === 0) {
                  return (
                    <p key={day} className="text-center text-muted-foreground">
                      {t("emptyDay")}
                    </p>
                  );
                }
                return (
                  <ul
                    key={day}
                    className="overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    {dishes.map((dish) => (
                      <DishRow key={dish.id} dish={dish} />
                    ))}
                  </ul>
                );
              })}
            </DayTabs>
          </div>
        )}
      </MenuSection>

      {/* 2 — A ilha de massas. Quem sangra aqui é o carrossel: a ilha tem mais
             de um formato, e uma foto só a venderia como se tivesse um. */}
      <MenuSection
        id="massas"
        bleed={
          <PastaCarousel
            photos={pastaPhotos.map((f) => ({
              image: f.photo,
              alt: t("dishImageAlt", { name: f.name }),
            }))}
            labels={{
              carousel: t("pastaCarousel"),
              prev: t("pastaPrevPhoto"),
              next: t("pastaNextPhoto"),
              goTo: t("pastaGoToPhoto", { n: "{n}" }),
            }}
          />
        }
        title={`${t("pastaLabel")} — ${formatBRL(menuPricing.pasta)}`}
        subtitle={t("pastaNote")}
      >
        {pasta.length > 0 ? (
          <ul className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
            {pasta.map((dish) => (
              <DishRow key={dish.id} dish={dish} />
            ))}
          </ul>
        ) : null}

        <PastaBuilder />
      </MenuSection>

      {/* 3 — Sobremesas. */}
      <MenuSection
        photo={{
          src: "/sobremesas/petit-gateau-largo.webp",
          alt: t("dessertsPhotoAlt"),
        }}
        title={t("dessertsLabel")}
        subtitle={t("dessertsNote")}
      >
        <DessertList />
      </MenuSection>

      {/* 4, 5 e 6 — Uma seção por grupo de bebida, como no impresso: cada
             página de lá é um grupo, com sua foto e seu letreiro.

             A âncora `bebidas` fica no primeiro grupo. Nada no site aponta
             para ela, mas link externo indexado não aparece numa busca do
             repositório, e manter o `id` custa zero. */}
      {drinkGroups.map((grupo, i) => {
        const foto = "photo" in grupo ? grupo.photo : undefined;
        const alt = "altKey" in grupo ? grupo.altKey : undefined;
        return (
          <MenuSection
            key={grupo.labelKey}
            id={i === 0 ? "bebidas" : undefined}
            photo={foto && alt ? { src: foto, alt: t(alt) } : undefined}
            title={t(grupo.labelKey)}
            /* A ressalva de que bebida não entra no quilo vale para os três
               grupos, e repeti-la em cada um viraria ruído. Fica no primeiro. */
            subtitle={i === 0 ? t("drinksNote") : undefined}
          >
            <DrinkGroupList group={grupo} />
          </MenuSection>
        );
      })}

      {/* 7 — A carta de vinhos. */}
      <MenuSection
        photo={{
          src: "/bebidas/carta-de-vinhos.webp",
          alt: t("winesPhotoAlt"),
        }}
        title={t("winesLabel")}
        subtitle={t("winesNote")}
      >
        <WineList />
      </MenuSection>
    </>
  );
```

- [ ] **Step 3: Tirar o carrossel de dentro do `PastaBuilder`**

O carrossel subiu para o `bleed` da seção. Em `src/components/cardapio/pasta-builder.tsx`, remova o bloco `{photos.length > 0 ? (<PastaCarousel …/>) : null}` e a prop `photos` da assinatura, junto com os imports que ficarem sem uso (`PastaCarousel`, `PastaPhoto`).

Ajuste o docblock do arquivo: onde ele explica o carrossel, registre que ele passou a ser o sangramento da seção.

- [ ] **Step 4: Apagar o painel antigo**

```bash
git rm src/components/cardapio/menu-panel.tsx
```

- [ ] **Step 5: Validar**

```bash
npm run typecheck && npm run lint && npx vitest run
```

Expected: typecheck limpo; lint com **11 avisos e 0 erros**; 143+ testes passando.

> Se o typecheck reclamar de `t(alt)`, é o estreitamento do `as const satisfies`: `altKey` só existe em dois dos três grupos. O `"altKey" in grupo` acima resolve; não troque por `grupo.altKey` direto.

- [ ] **Step 6: Olhar a página**

```bash
rm -rf .next/dev/cache/images
npm run dev
```

Abra `http://localhost:3000/cardapio` e confira as sete seções na ordem, a foto sangrando de ponta a ponta e a pílula montada sobre a curva.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'MSG'
UPD: o cardápio passa a ter sete seções, uma por página do impresso

"Bebidas" deixa de ser uma seção com três grupos dentro. Sucos, Café e água e
Refrigerantes e cerveja viram seções próprias, cada uma com sua foto sangrando
e seu letreiro — que é exatamente o que a peça impressa faz: cada página é um
grupo.

O carrossel de massas sobe para o topo da seção e passa a ser o sangramento
dela, em vez de um retângulo pousado no meio da coluna.

Duas seções ficam sem foto, e de propósito: o buffet do dia muda toda semana e
nenhuma imagem representa "quarta-feira"; Café e água está sem porque as duas
fotos que chegaram foram recusadas — uma com a xícara fatiada, outra com marca
d'água de banco de imagens.

A âncora `bebidas` fica no primeiro grupo: nada no site aponta para ela, mas
link externo indexado não aparece numa busca do repositório.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
)"
```

---

### Task 5: As listas passam a usar `MenuLine`

**Files:**
- Modify: `src/components/cardapio/dessert-list.tsx`
- Modify: `src/components/cardapio/wine-list.tsx`
- Modify: `src/components/cardapio/pasta-builder.tsx` (só os adicionais)

**Interfaces:**
- Consumes: `MenuLine` (Task 1)

- [ ] **Step 1: Sobremesas**

Em `src/components/cardapio/dessert-list.tsx`, troque o `<ul>` e o `<li>` por `MenuLine`, mantendo a miniatura à esquerda. O `MenuLine` desenha um `<li>`, então a miniatura entra como conteúdo antes dele — use a variante com foto:

```tsx
<ul className="mt-10 divide-y divide-border">
  {desserts.map((sobremesa) => (
    <li key={sobremesa.name} className="flex items-center gap-4 py-3 sm:gap-5">
      {sobremesa.photo ? (
        <Image
          src={sobremesa.photo}
          alt={t("dishImageAlt", { name: sobremesa.name })}
          width={320}
          height={320}
          loading="lazy"
          sizes="80px"
          className="size-16 shrink-0 rounded-xl object-cover sm:size-20"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="min-w-0 font-sans text-sm font-semibold uppercase tracking-wide text-brand sm:text-base">
            {sobremesa.name}
          </span>
          <span
            aria-hidden
            data-fio
            className="mb-[0.3em] min-w-4 flex-1 self-end border-b border-dotted border-brand/40"
          />
          <span className="shrink-0 font-sans text-sm font-semibold tabular-nums text-brand sm:text-base">
            {formatBRL(sobremesa.price)}
          </span>
        </div>
        {sobremesa.note ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{sobremesa.note}</p>
        ) : null}
      </div>
    </li>
  ))}
</ul>
```

Mantenha a linha de "sobremesas para viagem" que existe abaixo da lista.

> **Por que não reaproveitar `MenuLine` aqui:** ele é um `<li>` inteiro, e a sobremesa precisa da miniatura como irmã do bloco de texto. Envolver `MenuLine` num `<li>` externo aninharia `li` dentro de `li`, que é HTML inválido. A duplicação é de cinco linhas e está documentada nos dois lugares — melhor que uma prop `leading` que só um consumidor usa.

- [ ] **Step 2: Vinhos**

Em `src/components/cardapio/wine-list.tsx`, troque o `<ul>` das doses por:

```tsx
<ul className="mt-4 divide-y divide-border">
  {vinho.servings.map((dose) => (
    <MenuLine
      key={dose.label}
      name={dose.label}
      price={dose.price}
      note={dose.volume}
    />
  ))}
</ul>
```

E centralize o nome do rótulo (decisão 4 do spec):

```tsx
<h3 className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-center font-serif text-2xl font-bold tracking-tight sm:text-3xl">
```

O parágrafo dos `labels` logo abaixo também centraliza: acrescente `text-center` e troque `mt-2` por `mt-2 text-center`.

- [ ] **Step 3: Adicionais da ilha de massas**

Em `src/components/cardapio/pasta-builder.tsx`, o `<ul>` dos `extras`:

```tsx
<ul className="mt-6 divide-y divide-border">
  {pastaChoices.extras.map((extra) => (
    <MenuLine
      key={extra.name}
      name={extra.name}
      price={extra.price}
      note={extra.weight}
    />
  ))}
</ul>
```

- [ ] **Step 4: Validar**

```bash
npm run typecheck && npm run lint && npx vitest run
```

Expected: typecheck limpo, lint em 11 avisos, todos os testes passando.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'MSG'
UPD: sobremesas, vinhos e adicionais ganham o fio pontilhado

As três listas passam a desenhar a linha da peça impressa — nome em caixa alta,
fio pontilhado, preço à direita, observação miúda embaixo.

A sobremesa repete as cinco linhas do `MenuLine` em vez de reusá-lo: ela
precisa da miniatura como irmã do texto, e envolver o componente num `li`
externo aninharia `li` dentro de `li`.

O buffet do dia fica de fora: não tem preço por item — o preço é por quilo — e
sem preço não há para onde o fio ir.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
)"
```

---

### Task 6: Centralização e corpo

**Files:**
- Modify: `src/components/ui/section.tsx:38-47` (escala `lg`)
- Modify: `src/components/cardapio/pasta-builder.tsx` (títulos dos passos)

- [ ] **Step 1: O tom `lg` cresce um degrau**

Em `src/components/ui/section.tsx`, no `HEADER_SIZES`:

```ts
  lg: {
    title: "text-5xl sm:text-6xl",
    subtitle: "text-xl sm:text-2xl",
  },
```

O tom `md` **não muda** — é o do site inteiro.

- [ ] **Step 2: Centralizar e crescer os títulos da ilha**

Em `src/components/cardapio/pasta-builder.tsx`, os dois `h3` (`pastaBuild` e `pastaExtras`):

```tsx
<h3 className="mt-10 text-center font-serif text-3xl font-bold tracking-tight sm:text-4xl">
```

O parágrafo da porção logo abaixo do primeiro ganha `text-center` e `mx-auto`.

Os títulos de cada passo (`h4`, "Adicione uma proteína" e os demais) ganham `justify-center` e o `li` que os contém ganha `text-center`.

- [ ] **Step 3: Medir a primeira dobra no celular**

O spec avisa: `text-6xl` em Grenze Gotisch pode empurrar a lista para baixo da dobra.

```bash
rm -rf .next/dev/cache/images
npm run dev
```

Com o servidor no ar, em outro terminal:

```bash
node -e "
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:390,height:844}});
  await p.goto('http://localhost:3000/cardapio',{waitUntil:'networkidle'});
  const y=await p.evaluate(()=>{
    const h=[...document.querySelectorAll('h2')].find(e=>e.textContent.includes('Cardápio'));
    const lista=h.closest('section').querySelector('ul,[role=tablist]');
    return lista ? Math.round(lista.getBoundingClientRect().top) : null;
  });
  console.log('primeira lista começa em y =', y, y<844?'(dentro da dobra)':'(ABAIXO DA DOBRA)');
  await b.close();
})();
"
```

Expected: `(dentro da dobra)`.

> Se vier `ABAIXO DA DOBRA`, aplique o plano B do spec: o degrau do celular volta e só o `sm:` cresce — `title: "text-4xl sm:text-6xl"`.

> **Playwright não está instalado neste projeto.** Use o do projeto irmão: `node --experimental-loader` não é necessário; basta `require` pelo caminho absoluto `c:/Users/Usuario/restaurantePrato/node_modules/playwright`. Se preferir, instale como `devDependency` — mas isso é decisão de fora deste plano.

- [ ] **Step 4: Validar e commitar**

```bash
npm run typecheck && npm run lint && npx vitest run
git add -A
git commit -m "$(cat <<'MSG'
UPD: títulos do cardápio centralizados e um degrau maiores

Pedido do cliente: título de seção, subtítulo e títulos de grupo centralizados
e com mais corpo. As linhas de item continuam à esquerda — é o alinhamento que
o fio pontilhado precisa para levar o olho até o preço.

O tom `md` do SectionHeader não muda: ele é do site inteiro, e esta mudança é
do cardápio. Só o `lg` cresce.

A altura da primeira dobra no celular foi medida depois da mudança: a lista
continua acima dela.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
)"
```

---

### Task 7: O fundo sai

**Files:**
- Delete: `src/components/cardapio/menu-backdrop.tsx`
- Create: `docs/CARDAPIO-FUNDO.md`
- Modify: `src/app/[locale]/(marketing)/cardapio/page.tsx` (remover o import, se ainda houver)

- [ ] **Step 1: Salvar a memória antes de apagar**

O docblock do `menu-backdrop.tsx` guarda as nove versões e o motivo de cada recusa. **É essa memória que impede a décima tentativa.**

Crie `docs/CARDAPIO-FUNDO.md` com o conteúdo abaixo, e confira contra o docblock do arquivo antes de apagá-lo — se ele tiver ganhado alguma versão nova, acrescente.

```markdown
# O fundo do cardápio: nove versões, e por que ele acabou saindo

Entre 10 e 11/09/2026 o fundo da página `/cardapio` foi refeito nove vezes. O
cliente recusou todas. Em 14/09, ao ler quatro páginas do cardápio impresso, o
motivo ficou claro — e a décima versão foi **não ter fundo**.

## As nove

1. **SVG esticado**, viewBox quadrado com `preserveAspectRatio="none"`.
   Esticar 100×100 para 1440×1000 **achata o ângulo**: as diagonais viraram
   faixas verticais.
2. **Gradiente linear.** Guarda o ângulo, mas "parece mancha".
3. **Blocos arredondados em `div`.** "Parece um círculo" — o raio era grande
   demais para o tamanho do bloco.
4. **A arte do cliente como imagem.** Funcionava na leitura, mas o rodapé era
   `bg-muted/30` e o couro quase preto atravessava, apagando a tagline e o
   CNPJ. Corrigido deixando o rodapé opaco.
5. **Fitas curvas desfocadas.** "Manchas laranjas feias."
6. **Fitas nítidas com sombra forte em volta.** A sombra a 0,62 de alfa
   desenhou um anel escuro em volta do texto: "muito escuro, muito feio".
7. **A arte de volta, como imagem.**
8. **Faixas diagonais repetidas pela página.** Obrigavam cartão creme em volta
   de cada seção, porque texto escuro sobre `#FB6B3A` dá **2,17:1**.
9. **Fitas nos cantos com sombra fraca.** A que foi ao ar em 11/09.

## Por que nenhuma funcionou

**A peça impressa tem duas linguagens, e o site vinha misturando as duas.**

| | Capa | Páginas de conteúdo |
|---|---|---|
| Fundo | couro marrom escuro | madeira clara, calma |
| Blocos laranja | grandes, em diagonal | não existem |
| Papel do laranja | massa de cor | **uma** curva, como acento |

Todas as nove tentativas puseram a linguagem da **capa** nas telas onde o
cardápio é lido. O cliente estava certo nas nove.

## O que ficou no lugar

Nada. O fundo é o creme do projeto (`--background`), liso.

A identidade passou para as **seções**: foto sangrando no topo, curva laranja
na fronteira, pílula marrom com o nome. A cor vem do conteúdo, não de trás
dele. Ver `src/components/cardapio/menu-section.tsx`.

A linguagem da capa ficou onde pertence: a faixa estreita no topo do
`MenuHero`.

## Se alguém quiser tentar a décima

Meça antes. Duas regras que custaram um dia:

- **Texto escuro sobre `#FB6B3A` dá 2,17:1.** Não há token que salve.
- **Meça o composto renderizado**, não o token declarado, e com a trava de que
  o ponto amostrado pertence ao elemento medido (`document.elementFromPoint`).
  Sem ela, a varredura acusa dezenas de falsos positivos e esconde o real.
- **Apague `.next/dev/cache/images` antes de olhar.** Trocar arquivo em
  `public/` não invalida as versões otimizadas, e você mede a versão errada.
```

- [ ] **Step 2: Apagar o componente**

```bash
git rm src/components/cardapio/menu-backdrop.tsx
grep -rn "MenuBackdrop" --include="*.tsx" --include="*.ts" src/ || echo "nenhuma referência restante"
```

Expected: `nenhuma referência restante`. Se sobrar alguma, remova o import.

- [ ] **Step 3: Validar**

```bash
npm run typecheck && npm run lint && npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "$(cat <<'MSG'
RMV: o fundo do cardápio sai, e a memória das nove versões vai para docs

Nove versões entre 10 e 11/09, todas recusadas. Ao ler as páginas do cardápio
impresso em 14/09 ficou claro por quê: a peça tem duas linguagens, e as nove
tentativas puseram a da CAPA nas telas onde o cardápio é lido. As páginas de
conteúdo do impresso são calmas — madeira clara, uma foto sangrando, uma curva.

A décima versão é não ter fundo. A identidade passou para as seções, e a
linguagem da capa ficou onde pertence, no topo do hero.

O docblock com as nove e o motivo de cada recusa vai para `docs/CARDAPIO-FUNDO.md`
em vez de sumir com o arquivo. É a memória que impede a décima tentativa.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
)"
```

---

### Task 8: A capa assina o topo

**Files:**
- Modify: `src/components/cardapio/menu-hero.tsx`

- [ ] **Step 1: Acrescentar a faixa**

Em `src/components/cardapio/menu-hero.tsx`, **antes** do `<Image>` da foto do buffet e como irmã dele dentro da `<section>`, insira:

```tsx
      {/* A capa da peça impressa, como assinatura.
          Ela é couro escuro com blocos laranja em diagonal — e é onde essa
          linguagem pertence. Durante 10 e 11/09 ela foi espalhada por todas as
          telas do cardápio e recusada nove vezes; aqui ela tem o lugar certo,
          e em faixa estreita: a foto do buffet e o preço continuam na primeira
          dobra, porque comida vende e couro não. */}
      <div
        aria-hidden
        className="relative flex h-16 items-center justify-center overflow-hidden sm:h-20"
        style={{ background: "linear-gradient(135deg, #5E2B1F 0%, #7F3923 100%)" }}
      >
        <span className="absolute -left-6 top-1/2 size-16 -translate-y-1/2 rotate-45 rounded-lg bg-[#FB6B3A] sm:size-20" />
        <span className="absolute -right-6 top-1/2 size-16 -translate-y-1/2 rotate-45 rounded-lg bg-[#FB6B3A] sm:size-20" />
        <span className="font-serif text-3xl font-bold tracking-[0.2em] text-[#EFE9C2] sm:text-4xl">
          MENU
        </span>
      </div>
```

> A faixa é `aria-hidden`: "MENU" repete o `<h1>` da página e o título do navegador. Para quem usa leitor de tela, anunciá-la seria a terceira vez.

- [ ] **Step 2: Conferir que a `<section>` não corta a faixa**

A `<section>` do hero é `relative isolate overflow-hidden`, e a foto do buffet é `fill` — ela preenche a seção inteira e passaria **por baixo** da faixa. Dê à faixa `relative z-10`, ou mova a foto para um `<div className="relative">` próprio abaixo da faixa. Prefira o segundo: mais explícito que empilhar `z-index`.

- [ ] **Step 3: Olhar**

```bash
rm -rf .next/dev/cache/images && npm run dev
```

Confira em `http://localhost:3000/cardapio`: a faixa no topo, os blocos laranja nas pontas, a foto do buffet logo abaixo com o logo e o preço.

- [ ] **Step 4: Validar e commitar**

```bash
npm run typecheck && npm run lint && npx vitest run
git add -A
git commit -m "$(cat <<'MSG'
UPD: a capa do cardápio impresso assina o topo da página

Faixa estreita com o couro, os blocos laranja em diagonal e "MENU" em creme.
É a linguagem da capa da peça — e é aqui que ela pertence.

Em faixa estreita de propósito: a foto do buffet e o preço por quilo continuam
na primeira dobra. Comida vende, couro não.

`aria-hidden` porque "MENU" repete o h1 da página e o título do navegador.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
)"
```

---

### Task 9: A varredura que aprova a página

**Files:**
- Create: `scripts/varre-contraste.mjs`

**Interfaces:**
- Consumes: nada do plano; lê o site no ar.

- [ ] **Step 1: Escrever a varredura**

Create `scripts/varre-contraste.mjs`:

```js
/**
 * Varredura de contraste no COMPOSTO RENDERIZADO.
 *
 * Não mede token declarado: esconde o texto, fotografa, e amostra a cor que
 * sobra sob cada elemento. É a única forma de pegar texto que cai sobre foto,
 * gradiente ou forma decorativa.
 *
 * ⚠️ **A trava de pertencimento é obrigatória.** Sem confirmar que o ponto
 * amostrado pertence ao elemento medido, a varredura mede a cor do texto
 * contra o que estiver por cima ou ao lado — em 11/09 isso rendeu dezenas de
 * falsos positivos e escondeu o único defeito real.
 *
 * ⚠️ Apague `.next/dev/cache/images` antes de rodar: trocar arquivo em
 * `public/` não invalida as versões otimizadas.
 *
 * Uso: node scripts/varre-contraste.mjs /cardapio,/
 */
import { pathToFileURL } from "node:url";

const PLAYWRIGHT = "c:/Users/Usuario/restaurantePrato/node_modules/playwright/index.js";
const _pw = await import(pathToFileURL(PLAYWRIGHT).href);
const { chromium } = _pw.default ?? _pw;
const sharp = (await import("sharp")).default;

const MINIMO = 4.5;
const LARGURAS = [
  ["desktop", 1920, 950],
  ["laptop", 1440, 900],
  ["celular", 390, 844],
];

const lum = ([r, g, b]) => {
  const c = [r, g, b]
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const razao = (a, b) => {
  const [hi, lo] = lum(a) > lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)];
  return (hi + 0.05) / (lo + 0.05);
};
const cor = (s) => s.match(/\d+/g).slice(0, 3).map(Number);

const rotas = (process.argv[2] ?? "/cardapio").split(",");
const navegador = await chromium.launch();
let reprovas = 0;

for (const rota of rotas) {
  for (const [nome, w, h] of LARGURAS) {
    const p = await navegador.newPage({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    await p.goto(`http://localhost:3000${rota}`, { waitUntil: "networkidle", timeout: 60000 });
    await p.addStyleTag({ content: `*,*::before,*::after{animation:none!important;transition:none!important;opacity:1!important}` });

    const altura = await p.evaluate(() => document.body.scrollHeight);
    let amostras = 0;
    let pior = { r: 99 };

    for (let y = 0; y < altura - h * 0.15; y += Math.floor(h * 0.75)) {
      await p.evaluate((yy) => window.scrollTo(0, yy), y);
      await p.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
      await p.waitForTimeout(400);

      const alvos = await p.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("main p, main h1, main h2, main h3, main h4, main span, main li, main a, footer p, footer a, footer h3")) {
          const t = el.textContent?.trim();
          if (!t || t.length < 3) continue;
          if (el.children.length > 0) continue; // só folhas
          const r = el.getBoundingClientRect();
          const top = Math.max(r.top, 1);
          const bot = Math.min(r.bottom, window.innerHeight - 1);
          const esq = Math.max(r.left, 1);
          const dir = Math.min(r.right, window.innerWidth - 1);
          if (bot - top < 6 || dir - esq < 6) continue;
          const ym = (top + bot) / 2;
          const pts = [];
          for (let k = 1; k <= 5; k++) {
            const x = esq + ((dir - esq) * k) / 6;
            // A trava: o ponto tem de pertencer a ESTE elemento.
            const alvo = document.elementFromPoint(x, ym);
            if (alvo !== el && !el.contains(alvo)) continue;
            pts.push([x, ym]);
          }
          if (pts.length) out.push({ txt: t.slice(0, 40), cor: getComputedStyle(el).color, pts });
        }
        return out;
      });
      if (!alvos.length) continue;

      const esconde = await p.addStyleTag({ content: `main *, footer * { color: transparent !important }` });
      await p.waitForTimeout(150);
      const { data, info } = await sharp(await p.screenshot()).raw().toBuffer({ resolveWithObject: true });
      await esconde.evaluate((n) => n.remove());

      const px = (x, y) => {
        const i = (Math.round(y) * info.width + Math.round(x)) * info.channels;
        return [data[i], data[i + 1], data[i + 2]];
      };

      for (const a of alvos) {
        const c = cor(a.cor);
        for (const [x, yy] of a.pts) {
          if (x < 0 || yy < 0 || x >= info.width || yy >= info.height) continue;
          const fundo = px(x, yy);
          // O botão do WhatsApp flutua por cima: sobreposição, não contraste.
          if (fundo[0] === 37 && fundo[1] === 211 && fundo[2] === 102) continue;
          amostras++;
          const r = razao(c, fundo);
          if (r < MINIMO) {
            reprovas++;
            console.log(`  ❌ ${r.toFixed(2)}  "${a.txt}"  sobre rgb(${fundo})`);
          }
          if (r < pior.r) pior = { r, txt: a.txt };
        }
      }
    }

    const larguraRolagem = await p.evaluate(() => document.documentElement.scrollWidth);
    const vazando = larguraRolagem > w;
    if (vazando) {
      reprovas++;
      console.log(`  ❌ rolagem horizontal: ${larguraRolagem}px numa tela de ${w}px`);
    }

    console.log(`${rota} ${nome.padEnd(8)} ${String(amostras).padStart(5)} amostras | pior ${pior.r.toFixed(2)} | rolagem ${vazando ? "VAZA" : "ok"}`);
    await p.close();
  }
}

await navegador.close();
console.log(reprovas === 0 ? "\n✅ 0 reprovas" : `\n❌ ${reprovas} reprovas`);
process.exit(reprovas === 0 ? 0 : 1);
```

- [ ] **Step 2: Rodar com o servidor no ar**

```bash
rm -rf .next/dev/cache/images
npm run dev
```

Noutro terminal:

```bash
node scripts/varre-contraste.mjs /cardapio,/
```

Expected: `✅ 0 reprovas`, e `rolagem ok` nas três larguras das duas rotas.

> Se acusar reprova sobre `#FB6B3A` ou um tom dele, é texto caindo na curva — o erro que o spec proíbe. Corrija a posição da pílula ou a altura da curva; **não** mude a cor do texto para "resolver".

- [ ] **Step 3: Build limpo**

Pare o servidor de desenvolvimento antes — o build destrói `.next/dev/routes-manifest.json`.

```bash
npm run build
```

Expected: build conclui, sem erro.

- [ ] **Step 4: Commit**

```bash
git add scripts/varre-contraste.mjs
git commit -m "$(cat <<'MSG'
CRE: a varredura de contraste que mede o composto, não o token

Esconde o texto, fotografa e amostra a cor que sobra sob cada elemento, nas
três larguras. É a única forma de pegar texto que cai sobre foto, gradiente ou
forma decorativa.

A trava de pertencimento (`document.elementFromPoint`) é o que separa esta
varredura da anterior: sem ela, a ferramenta media a cor do texto contra o que
estivesse por cima ou ao lado, e em 11/09 rendeu dezenas de falsos positivos
enquanto escondia o único defeito real.

Confere também rolagem horizontal, que é o risco da foto sangrando.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
)"
```

---

## Auto-revisão do plano

**Cobertura do spec:**

| Requisito do spec | Tarefa |
|---|---|
| §5.1 fundo sai, docblock migrado | 7 |
| §5.2 `MenuSection` | 2 |
| §5.3 seções sem foto única | 4 (passos 2 e 3) |
| §5.4 `MenuLine` | 1 |
| §5.5 listas migradas | 5 |
| §5.6 centralização e corpo | 6 |
| §5.7 faixa de capa | 8 |
| §6 contraste e critério de aceitação | 9 |
| §8 risco de rolagem horizontal | 9 (passo 2) |
| §8 risco do título maior na dobra | 6 (passo 3) |

Uma decisão foi tomada no plano e **não** está no spec: a foto que sangra em Sobremesas (Task 3). O spec não a definia; o impresso tem foto na página de sobremesas, e a do petit gâteau é a única de sobremesa em tamanho útil. Se o cliente preferir sem, apagar a prop `photo` da seção 3 resolve.

**Consistência de nomes:** `MenuLine({name, price, note})` na Task 1 é consumido com os mesmos três nomes nas Tasks 5. `MenuSection({id, photo, bleed, title, subtitle, children})` na Task 2 é consumido com os mesmos nomes na Task 4. `DrinkGroupList({group})` é criado e consumido na Task 4.
