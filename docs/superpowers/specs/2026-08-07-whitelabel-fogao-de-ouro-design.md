# Spec — White-label n8x → Fogão de Ouro

**Data:** 2026-08-07
**Fontes:** [`docs/WHITELABEL-FOGAO-DE-OURO.md`](../../WHITELABEL-FOGAO-DE-OURO.md) (contexto técnico) e
`docs/Copy site Institucional—Fogão de Ouro Restaurante.pdf` (copy, tom de voz e diretrizes visuais).
**Repositório:** fork de `Grupo-Vannuchi/n8x`; `origin` = `Grupo-Vannuchi/FogaoDeOuro` (confirmado).
**Branch de trabalho:** `Development` (a criar — hoje o `origin` só tem `main`).

---

## 1. Objetivo

Transformar o site institucional da N8X Marketing (agência) no site do **Fogão de Ouro
Restaurante** — restaurante por quilo no Centro Histórico de Santos/SP, foco em almoço
executivo, público corporativo. Sem reescrever a arquitetura: o projeto já é white-label,
conteúdo vive no banco e é editado pelo admin.

---

## 2. Dados do cliente

### 2.1 Confirmados

| Campo | Valor |
|---|---|
| Nome fantasia | Fogão de Ouro Restaurante |
| `name` (wordmark/títulos) | **Fogão de Ouro** |
| Ano de fundação | **2001** (→ "25 anos" em 2026) |
| Endereço | Rua Frei Gaspar, 46 — Centro Histórico, Santos/SP, CEP 11010-090 |
| Telefone | (13) 3219-1552 |
| E-mail | fogaodeouro@fogaodeouro.com.br |
| Instagram | @fogao.de.ouro *(perfil inativo — feed embedado só após reativação)* |
| Horário | Segunda a sexta, 11h–15h |
| Capacidade | 180 lugares |
| Pagamentos | Cartões de crédito e débito, VR e VA |
| Avaliações | 4,5 ★ · +1.200 no Google |
| Paleta | `#E04F26` brasa · `#E68A08` âmbar · `#474544` grafite · `#EFE9C2` creme |
| Modelo | Buffet por quilo — **sem preços no site** |

### 2.2 Bloqueados (não inventar)

| Dado | Trava |
|---|---|
| Razão social | `legalName`, `legal.ts` |
| CNPJ | `registration`, `legal.ts` |
| E-mail do encarregado de dados (LGPD) | `legal.ts` |
| **Número do WhatsApp** | `contact.whatsapp.*` — **trava todas as reservas** |
| Domínio final | `NEXT_PUBLIC_SITE_URL` (canonical, sitemap, robots, OG) |
| Logo (clara e escura) | `logo.tsx`, `icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`, favicon |
| Fotografia autoral | hero, cards de gastronomia, galeria do salão |

Onde faltar imagem, usar **placeholder neutro** marcado para troca (autorizado pelo dono
do projeto). Onde faltar dado textual, deixar o campo pendente — nunca preencher com
valor inventado.

### 2.3 Conflitos resolvidos

O PDF de copy trazia quatro anos de fundação diferentes: "25 anos de tradição" (§2.2 e
§8) → 2001; "desde 2002" (§2.3); "Desde 2000" (§2.7); "há mais de 20 anos" (§2.1).
**Decisão: 2001.** Toda a copy transcrita deve ser normalizada para "25 anos" / "desde
2001". Este é um erro do documento de origem, não do site.

---

## 3. Decisões de design

### 3.1 Ordem de execução (substitui a do WHITELABEL)

O WHITELABEL manda Fase 1 (rebrand, incluindo copy) → Fase 2 (PT-only). Seguir essa ordem
significa escrever ~838 linhas de copy em português **e em inglês**, e deletar o inglês na
fase seguinte. **Decisão: PT-only vem antes da copy.**

| # | PR | Bloqueado por dado? |
|---|---|---|
| **1a-1** | `refactor(brand)`: paleta, tema, config sem dados pendentes | Não |
| **1a-2** | `feat(brand)`: identidade legal (`legal.ts`), logo, ícones, OG | **Sim** |
| **2** | `refactor(i18n)`: site só em português | Não |
| **1b-1** | `refactor(nav)`: rotas, `NavKey`, remoção de carreiras | Não |
| **1b-2** | `feat(content)`: copy do PDF, tipografia, página `/reservas` | Parcial (imagens) |
| **infra** | Supabase + Vercel (fora do git) | **Sim** |

`1a-1` e `2` não dependem de nada do cliente e podem entrar imediatamente. `1a-2` e
`infra` esperam. Ordem obrigatória: **2 antes de 1b-2**.

### 3.2 Paleta — dark-first

O PDF §7 define fundo escuro ("preto/grafite") e destaque "dourado/âmbar (remete a
'Ouro')". Isso reatribui os papéis das cores: **âmbar é a marca, brasa é o accent**.
Decisão: **dark-first mantendo os dois temas** — escuro é o padrão, claro continua
disponível.

Contrastes calculados (WCAG 2.1). Reprodutível com
`node docs/superpowers/specs/2026-08-07-palette-contrast.mjs`:

**Tema escuro (padrão) — tudo passa AA:**

| token | hex | contraste sobre o fundo |
|---|---|---|
| `background` | `#171615` | — |
| `foreground` | `#EFE9C2` | 14.72:1 ✅ |
| `brand` | `#E68A08` | 6.89:1 ✅ |
| `brandForeground` | `#171615` | 6.89:1 sobre `brand` ✅ |
| `accent` | `#E04F26` | 4.57:1 ✅ |
| `card` / `border` | `#232120` / `#474544` | 13.06:1 ✅ |

**Tema claro (secundário):**

| token | hex | contraste |
|---|---|---|
| `background` | `#EFE9C2` | — |
| `foreground` | `#474544` | 7.77:1 ✅ |
| `brand` | `#8A5206` | 5.20:1 ✅ (branco sobre ele: 6.38:1 ✅) |
| `brandForeground` | `#ffffff` | 6.38:1 ✅ |
| `accent` | `#E04F26` | 3.22:1 — gráfico/UI apenas, nunca texto |
| `card` / `border` | `#FBF7E6` / derivado | 8.88:1 ✅ |

**Concessão declarada:** `#E68A08` puro sobre creme dá 2.14:1 (ilegível). O tema claro usa
`#8A5206` — o mesmo âmbar, mais escuro. Não é cor nova; o projeto já tinha precedente de
hex por tema (n8x: `#0B0050` claro / `#4D9CFB` escuro). O documento do cliente não
especifica tema claro, então não há diretriz contrariada.

**Neutros:** [`globals.css`](../../../src/app/globals.css) fixa `card`/`muted`/`border` em
cinza-frio (`#ffffff`, `#f4f4f5`, `#e4e4e7`). Precisam ser aquecidos nos dois temas, senão
brigam com o creme e o grafite. Não são cores de marca.

### 3.3 Navegação e rotas

| Menu (PDF §1) | Rota | Origem |
|---|---|---|
| Início | `/` | existe |
| A Experiência | `/experiencia` | renomeia `about` |
| Nossa Gastronomia | `/gastronomia` | renomeia `services` |
| Horários & Reservas | `/reservas` | **nova** |
| Contato | `/contato` | renomeia `contact` |
| *(fora do menu)* | `/galeria` | renomeia `portfolio` |
| *(fora do menu)* | `/informations` | blog — mantido, sem link no menu |
| ~~Carreiras~~ | — | **removida**: rota, formulário, copy e lead `CAREER` |

Renomear rota exige mexer em três lugares acoplados: o type `NavKey` em
[`site.ts`](../../../src/config/site.ts), as chaves `nav` em
[`pt.json`](../../../src/messages/pt.json) e as pastas em `src/app/[locale]/(marketing)/`.

### 3.4 Reservas

**Link direto de WhatsApp**, sem backend. Todos os CTAs de reserva ("Fazer minha reserva",
"Reserve a sua Mesa", "Falar no WhatsApp") usam `whatsappLink()` com mensagem
pré-preenchida de reserva. `contact.whatsapp.defaultMessage` deixa de ser "saber mais sobre
os serviços" e vira texto de reserva.

O formulário de contato (`Lead` tipo `CONTACT`) e a notificação em grupo
([`lead-notify.ts`](../../../src/lib/lead-notify.ts)) **permanecem** — são da página de
Contato, não das reservas.

### 3.5 Tipografia

PDF §7 pede serifada nos títulos + sans no corpo. Hoje é Geist Sans em tudo. Adicionar uma
serifada via `next/font` (self-hosted, sem requisição externa, sem custo de LCP), aplicada
a `h1`–`h3`. Escopo novo, não previsto no WHITELABEL.

### 3.6 Fase 4 — reduzida

O WHITELABEL previa criar `MenuCategory` + `MenuItem` com preço e CRUD completo. O PDF §7
determina **"Sem preços no site"**, o que remove a razão de existir desses models. Os
models atuais absorvem quase tudo:

| Bloco do PDF | Model | Observação |
|---|---|---|
| 6 cards de Gastronomia (§4.2) | `Service` | encaixe direto — o que faltava era preço |
| Faixa de números (§2.2) | `Stat` | ⚠️ `value` é `Int`; "4,5 ★" não cabe |
| Depoimentos (§2.5, §3.5) | `Testimonial` | `company` fica sem sentido |
| Galeria do salão (§3.3) | `Project` | `clientName` e `year` ficam sem sentido |
| Chef / equipe | `TeamMember` | **sem uso** — §7 proíbe rostos |

Sobra como trabalho real da Fase 4:

1. **"A Semana no Fogão"** (§4.3) — 5 pratos fixos por dia útil. Avaliar model próprio vs.
   copy estática (muda raramente).
2. **Horário de funcionamento** — não existe no projeto. Config ou model.
3. **schema.org `Restaurant`** — substitui `Organization`, com `servesCuisine`, `menu`,
   `openingHoursSpecification`, `acceptsReservations`, `address` (`postalCode` incluído).
   `priceRange` é opcional e, se usado, deve ser a faixa simbólica (`"$$"`) — **não** um
   valor: a diretriz §7 "sem preços no site" vale para a página, e estampar valor no
   structured data reapareceria nos resultados do Google.

### 3.7 Ajustes de tipo em `site.ts`

- `parentOrganization` → **removido** (era Grupo Vannuchi).
- `author` → **removido** (§7 proíbe rostos; blog fora do menu).
- `social` → só `instagram`; remover `tiktok` e `linkedin`.
- `address` → **adicionar `postalCode`** (obrigatório num `PostalAddress` bem formado do
  schema `Restaurant`; hoje o tipo só tem street/city/region/country).
- `NavKey` → novo conjunto de chaves (§3.3).

---

## 4. Dívidas e riscos conhecidos

1. **`Stat.value` é `Int`** ([`schema.prisma:156`](../../../prisma/schema.prisma)) — a nota
   "4,5 ★" não cabe. Ou vira label ("4,5 ★ no Google", `value` = 1200 avaliações), ou o
   campo passa a decimal. Decidir na Fase 4.
2. **`Project` e `Testimonial` carregam campos de agência** (`clientName`, `year`,
   `company`) que não fazem sentido para galeria e avaliações do Google. Não bloqueiam;
   avaliar limpeza depois do rebrand.
3. **`TeamMember` fica sem uso.** Não remover junto com o rebrand — decidir na Fase 4.
4. **Instagram inativo** — feed embedado só depois da reativação do perfil (§6).
5. **Senha do admin:** [`prisma/seed.ts`](../../../prisma/seed.ts) usa `changeme123` por
   padrão. Nunca subir para produção assim — usar `SEED_ADMIN_PASSWORD` ou
   `npm run db:set-admin`.
6. **`DATABASE_URL`** no pooler do Supabase (6543, `?pgbouncer=true`) **sem**
   `connection_limit=1` — força `P2024` no prerender das páginas estáticas.
7. **Bucket `media`** precisa existir no Storage do Supabase novo, senão o upload de
   imagem do admin falha.
8. **Funis (Fase 3)** saem em PR dedicado, depois do rebrand. Não remover junto: `Lead`,
   `LeadNotificationConfig`, `evolution.ts`, `lead-notify.ts` — o formulário de contato
   depende deles.

---

## 5. Critérios de aceite

- `npm run typecheck && npm run lint && npm run build` verde em cada PR.
- Nenhuma string "n8x", "N8X", "N8 Company" ou "Vannuchi" no site público.
- `legal.ts` refletindo o Fogão de Ouro (LGPD) — ou o PR 1a-2 não sai.
- Nenhum dado do cliente inventado: o que não veio, fica pendente e visível.
- Toda string de UI em `pt.json` (e, até a Fase 2, também em `en.json`).
- Nenhum segredo em `NEXT_PUBLIC_*`.
- `AGENTS.md`, `CLAUDE.md`, `README` e `docs/` atualizados para descrever o Fogão de Ouro.
