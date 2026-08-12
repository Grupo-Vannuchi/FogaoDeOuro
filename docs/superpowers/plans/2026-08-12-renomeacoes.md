# Renomeações: `/novidades`, namespaces do catálogo e âncoras — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Terminar a renomeação que o rebrand deixou pela metade — a última rota pública em inglês vira `/novidades`, o admin acompanha, e os namespaces do `pt.json` param de falar vocabulário de agência (`about`, `portfolio`, `services`).

**Architecture:** Este PR é **mecânico e sem migração de banco**. Nada de schema, nada de dado. Isso o torna barato em raciocínio e caro em atenção: o risco não é conceitual, é de *deixar uma referência para trás* — um `href` literal, uma chave do catálogo, uma entrada do sitemap. Um erro aqui não quebra o `typecheck`; ele produz um 404 silencioso ou um `MISSING_MESSAGE` em runtime.

**Tech Stack:** Next 16 (App Router + Turbopack), React 19 + React Compiler, next-intl (só `pt`), Prisma 6 + PostgreSQL, Vitest, Playwright.

## Global Constraints

- **Branch:** `Development`. **Nunca `git push`** — o dono do projeto envia manualmente.
- **Validação obrigatória** ao fim de cada tarefa: `npm run typecheck && npm run lint && npm run build && npm test`.
- **Banco local de pé**: `docker compose up -d` (container `n8x-marketing-db`, porta 5433). O `build` prerenderiza páginas que leem o banco.
- 🛑 **Nunca** rodar `prisma migrate reset`, nunca definir `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`. Este PR **não toca em `prisma/`**. Se você achar que precisa de uma migração, você entendeu o escopo errado — pare e reporte.
- **Português apenas.** Toda string de UI em `src/messages/pt.json`; não existe `en.json`.
- **`git mv` para mover pastas de rota**, nunca copiar-e-apagar — preserva o histórico e evita o problema de *case* do Windows.
- ⚠️ **Depois de mover uma pasta de rota, `rm -rf .next` antes de validar.** O Next deixa validadores de rota obsoletos em `.next/dev/types/` e o `next build` **não** os limpa: o `typecheck` e o `build` falham com `TS2307` fantasma, apontando para uma rota que já não existe. Confirmado na Task 1 e reproduzido pela revisão.
- Commits convencionais terminando com `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

## Decisões de escopo (tomadas pelo dono do projeto — não reabra)

1. **A renomeação para na superfície visível + catálogo.** Models Prisma, nomes de arquivo, funções, tags de cache e pastas do Storage **continuam em inglês**. `model Information` e `model Testimonial` ficam como estão.

   O motivo não é preguiça: **é a convenção que o próprio repo já estabeleceu.** Os PRs 2 e 3 criaram `MenuCategory` e `GalleryPhoto` — models em inglês servindo `/gastronomia` e `/galeria`. Renomear `Information` → `Novidade` quebraria essa consistência em vez de restaurá-la, custando uma migração de tabela, ~25 arquivos e uma invalidação em massa de cache para não mudar nada que o usuário veja.

2. **Só `/admin/informations` é renomeada no admin.** `/admin/testimonials` e `/admin/leads` **ficam como estão** — as labels dessas seções já estão em português, e mexer na rota de `leads` obrigaria a reescrever a instrução do `docs/RUNBOOK.md` que manda configurar o grupo de WhatsApp em `/admin/leads`.

3. **O achado N2 da revisão do PR 5 entra aqui** (Task 5) — restringir `sourceUrl` a `http`/`https`.

## A armadilha que já nos pegou neste projeto

⚠️ **A URL de um conteúdo aparece em TRÊS superfícies independentes**, e o `typecheck` não conhece nenhuma delas:

| Superfície | Arquivo | Emite `/informations`? |
|---|---|---|
| Sitemap | `src/app/sitemap.ts` | ✅ sim — a rota e cada `[slug]` |
| llms-full | `src/app/llms-full.txt/route.ts` | ✅ sim — cada `[slug]` |
| llms | `src/app/llms.txt/route.ts` | ❌ **não lista a rota** (ver Riscos) |

No PR 2 isso passou batido e o site publicou URLs que já não existiam. **Verifique as três contra um servidor rodando**, não por leitura de código.

---

## Mapa de arquivos

**Rotas movidas (`git mv`):**

| De | Para |
|---|---|
| `src/app/[locale]/(marketing)/informations/` | `src/app/[locale]/(marketing)/novidades/` |
| `src/app/[locale]/admin/(dashboard)/informations/` | `src/app/[locale]/admin/(dashboard)/novidades/` |

**Editados:**

| Arquivo | O quê |
|---|---|
| `src/app/sitemap.ts` | `/informations` → `/novidades` (2 ocorrências) |
| `src/app/llms-full.txt/route.ts` | path do bloco de artigo |
| `src/components/json-ld.tsx` | `localizedUrl(locale, "/informations/…")` |
| `src/components/information-card.tsx` | `href` + namespace |
| `src/components/layout/information-menu.tsx` | `href` (2) + namespace |
| `src/components/layout/header.tsx` | `href` do link de artigo |
| `src/components/admin/admin-nav.tsx` | `href` e `key` do item |
| `src/components/admin/information-form.tsx` | `router.push` + `href` de cancelar |
| `src/lib/lead-landing.ts` | segmento `"informations"` → `"novidades"` (3 ocorrências + comentário) |
| `src/components/sections/menu-preview.tsx` | `id="services"` → `id="gastronomia"` |
| `src/components/sections/gallery-preview.tsx` | `id="portfolio"` → `id="galeria"` |
| `src/components/information-gallery.tsx`, `src/components/menu-item-card.tsx`, `src/components/gallery-photo-card.tsx` | namespace do `useTranslations` |
| `src/app/[locale]/(marketing)/{experiencia,galeria,gastronomia}/page.tsx` | namespace do `getTranslations` |
| `src/messages/pt.json` | renomear 4 namespaces de topo + `admin.informations` + `nav.information` |
| `src/lib/validations/testimonial.ts` | Task 5 — esquema de `sourceUrl` |
| `test/testimonial-url.test.ts` | **novo** (Task 5) |
| `AGENTS.md`, `docs/ARCHITECTURE.md`, spec §7 | Task 6 |

**Intocados de propósito:** `prisma/`, `src/lib/queries.ts`, `src/lib/cache.ts`, `src/lib/storage.ts`, `src/lib/admin-queries.ts`, `src/lib/information-form.ts`, `src/lib/validations/information.ts`, `src/app/actions/informations.ts` (exceto se contiver um `redirect` literal — verifique), `src/components/ui/icon.tsx`. Todos usam `information` como **nome de modelo**, não como rota nem como chave de tradução.

---

### Task 1: A rota pública `/informations` → `/novidades`

**Files:**
- Move: `src/app/[locale]/(marketing)/informations/` → `.../novidades/`
- Modify: `src/app/sitemap.ts`, `src/app/llms-full.txt/route.ts`, `src/components/json-ld.tsx`, `src/components/information-card.tsx`, `src/components/layout/information-menu.tsx`, `src/components/layout/header.tsx`, `src/lib/lead-landing.ts`

**Interfaces:**
- Produz: a rota `/pt/novidades` e `/pt/novidades/[slug]`, ambas 200.
- A rota `/pt/informations` passa a ser 404. **Isso é o esperado** — o site não está no ar, não há SEO a preservar e nenhum redirect é necessário.

- [ ] **Step 1: Mover a pasta**

```bash
git mv "src/app/[locale]/(marketing)/informations" "src/app/[locale]/(marketing)/novidades"
```

Não renomeie o `[slug]/` dentro dela.

- [ ] **Step 2: Trocar as referências literais**

Estas são as ocorrências conhecidas. Encontre-as com
`grep -rn '/informations' src/` e troque **apenas as que são caminho de rota**:

- `src/app/sitemap.ts:15` e `:28`
- `src/app/llms-full.txt/route.ts:99`
- `src/components/json-ld.tsx:154`
- `src/components/information-card.tsx:53`
- `src/components/layout/information-menu.tsx:26` e `:42`
- `src/components/layout/header.tsx:189`
- dentro da pasta movida: `page.tsx:22`, `[slug]/page.tsx:40,89,92,99,151`

⚠️ **Não** troque `src/lib/storage.ts`, `src/lib/cache.ts` nem `src/lib/queries.ts` — ali `informations` é nome de pasta do Storage e de tag de cache, não rota. Trocar invalidaria caches e apontaria uploads para uma pasta que não existe.

- [ ] **Step 3: `lead-landing.ts`**

Trocar as **três** ocorrências do segmento de URL: a chave `informations` em `SECTION_LABELS.pt` (linha 21) e as duas comparações `section === "informations"` (linhas 34 e 58). Atualize também o exemplo no comentário do topo.

O valor da label ("Novidades") já está certo — só a chave muda.

Nenhuma migração de dado é necessária: o comentário do arquivo explica que o rótulo é **congelado no lead** no momento da criação, então leads antigos guardam o texto, não o caminho.

- [ ] **Step 4: Validar contra um servidor rodando**

```bash
npm run typecheck && npm run lint && npm run build
```

Depois — e **isto não é opcional** — suba o servidor e confira as três superfícies:

```bash
# mate qualquer coisa na 3000 antes, senão você testa um build velho
npx kill-port 3000 || true
npm run start &
sleep 8
curl -sL -o /dev/null -w "%{http_code} /pt/novidades\n"  http://localhost:3000/pt/novidades
curl -sL -o /dev/null -w "%{http_code} /pt/informations (deve ser 404)\n" http://localhost:3000/pt/informations
curl -sL http://localhost:3000/sitemap.xml    | grep -c "/novidades" 
curl -sL http://localhost:3000/sitemap.xml    | grep -c "/informations"   # deve ser 0
curl -sL http://localhost:3000/llms-full.txt  | grep -c "/informations"   # deve ser 0
```

Pegue também **uma URL de artigo real** do sitemap e confirme que ela responde 200. Cole toda a saída no relatório. Derrube o servidor ao terminar.

- [ ] **Step 5: Commit**

```bash
git add -A src/
git commit -m "UPD: a rota publica de novidades deixa de falar ingles

/informations era a ultima rota publica com nome em ingles. As tres
superficies que emitem URL (sitemap, llms-full, json-ld) foram conferidas
contra um servidor rodando, nao so por leitura.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: A rota do admin `/admin/informations` → `/admin/novidades`

**Files:**
- Move: `src/app/[locale]/admin/(dashboard)/informations/` → `.../novidades/`
- Modify: `src/components/admin/admin-nav.tsx`, `src/components/admin/information-form.tsx`, e os `href` dentro da pasta movida

**Interfaces:**
- Consome: nada da Task 1 (são rotas independentes), mas o namespace do catálogo ainda é o antigo até a Task 3 — **não** mexa no `pt.json` aqui.

- [ ] **Step 1: Mover a pasta**

```bash
git mv "src/app/[locale]/admin/(dashboard)/informations" "src/app/[locale]/admin/(dashboard)/novidades"
```

- [ ] **Step 2: Trocar os `href` e o `router.push`**

`grep -rn '/admin/informations' src/` acha todos. São 7 ocorrências em 5 arquivos:

- `src/components/admin/admin-nav.tsx:19` — o `href`. **A propriedade `key` deste item é a chave do catálogo (`admin.nav.<key>`); ela muda na Task 3, não aqui.** Deixe `key: "informations"` por enquanto ou o admin renderiza um `MISSING_MESSAGE`.
- `src/components/admin/information-form.tsx:59` (`router.push`) e `:197` (cancelar)
- `novidades/page.tsx:26,75`, `novidades/new/page.tsx:21`, `novidades/[id]/page.tsx:28`

Confira também `src/app/actions/informations.ts` — se houver um `redirect()` literal para a rota antiga, ele é a única forma de o formulário levar a um 404 depois de salvar.

- [ ] **Step 3: Validar, inclusive no navegador**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

Depois **entre no admin e navegue de verdade** — este é o tipo de quebra que só aparece em runtime:

- `http://localhost:3000/pt/admin/login` → `admin@example.com` / `changeme123`
- clique em "Novidades" no menu lateral → deve listar
- abra um artigo → deve carregar o formulário
- clique em "Cancelar" → deve voltar para a lista, não dar 404

⚠️ **Ao automatizar o login, mire o botão pelo nome acessível, nunca por `button[type="submit"]`** — o shell do admin tem um botão "Sair" que também é `submit`, e clicar nele parece exatamente uma sessão perdida. Isso já custou um diagnóstico errado neste projeto.

- [ ] **Step 4: Commit**

```bash
git add -A src/
git commit -m "UPD: a rota do admin acompanha /novidades

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Os namespaces do catálogo e as âncoras do DOM

Esta é a tarefa com mais arquivos e a de falha mais silenciosa: **um namespace renomeado sem o consumidor correspondente não quebra o `typecheck`** — o `next-intl` tipa o catálogo, então na verdade quebra sim, e é bom que quebre. O que **não** quebra é uma chave *interna* renomeada que ninguém lê.

**Files:**
- Modify: `src/messages/pt.json`, `src/app/[locale]/(marketing)/{experiencia,galeria,gastronomia}/page.tsx`, `src/app/[locale]/(marketing)/novidades/page.tsx`, `src/app/[locale]/(marketing)/novidades/[slug]/page.tsx`, `src/components/{information-card,information-gallery,menu-item-card,gallery-photo-card}.tsx`, `src/components/layout/information-menu.tsx`, `src/components/admin/admin-nav.tsx`, `src/components/sections/{menu-preview,gallery-preview}.tsx`

**Interfaces:**
- Consome: as rotas já renomeadas (Tasks 1 e 2).
- Produz: `pt.json` sem vocabulário de agência nos namespaces de topo.

- [ ] **Step 1: Renomear os namespaces de topo do `pt.json`**

Renomeie a **chave**, preservando o valor inteiro e a posição no arquivo:

| De | Para | Tamanho |
|---|---|---|
| `about` | `experiencia` | 11 chaves |
| `portfolio` | `galeria` | 11 chaves |
| `services` | `gastronomia` | 12 chaves |
| `informations` | `novidades` | 15 chaves |

Mais duas chaves aninhadas:

- `admin.informations` → `admin.novidades` (32 chaves)
- `nav.information` → `nav.novidades` — note o **singular** na chave antiga, que é justamente o tipo de inconsistência que este PR existe para apagar. O valor já é "Novidades".

⚠️ **Não toque em `admin.testimonials`, `admin.leads`, `admin.cardapio`, `admin.galeria`** — as rotas correspondentes não foram renomeadas (decisão de escopo 2).

⚠️ **Um valor, não só chaves.** `src/messages/pt.json:348` traz
`"slugHint": "Usado na URL: /informations/seu-slug"`. A Task 1 renomeou a rota mas o
`pt.json` estava fora do escopo dela, então **esta string virou uma instrução falsa no
formulário do admin** — e é a última ocorrência de `/informations` no HTML servido.
Troque o **valor** para `/novidades/seu-slug`. Sem isso o critério de aceite
`grep -rn '/informations' src/` falha no fim do PR.

Varra o `pt.json` por outros **valores** (não só chaves) que citem rota antiga ou
vocabulário de agência: `grep -n '/informations\|portf[oó]lio\|servi[cç]os' src/messages/pt.json`.
Julgue caso a caso — "serviços" pode ser uma palavra legítima numa frase sobre o
restaurante; o que não pode é apontar para uma rota que não existe.

- [ ] **Step 2: Atualizar os consumidores**

`grep -rn 'Translations("' src/` lista todos. Os que mudam:

| Arquivo | De | Para |
|---|---|---|
| `(marketing)/experiencia/page.tsx` | `"about"` | `"experiencia"` |
| `(marketing)/galeria/page.tsx` | `"portfolio"` | `"galeria"` |
| `(marketing)/gastronomia/page.tsx` | `"services"` | `"gastronomia"` |
| `(marketing)/novidades/page.tsx` e `[slug]/page.tsx` | `"informations"` | `"novidades"` |
| `components/gallery-photo-card.tsx` | `"portfolio"` | `"galeria"` |
| `components/menu-item-card.tsx` | `"services"` | `"gastronomia"` |
| `components/information-card.tsx`, `information-gallery.tsx`, `layout/information-menu.tsx` | `"informations"` | `"novidades"` |

E o `key` do item de nav do admin (`admin-nav.tsx:19`), que a Task 2 deixou propositalmente para trás: `key: "informations"` → `key: "novidades"`.

Procure também usos indiretos — `t("nav.information")`, `tn("information")` e qualquer template literal que monte a chave. O `[slug]/page.tsx:89` usa `tn("information")`.

- [ ] **Step 3: Âncoras do DOM**

- `src/components/sections/menu-preview.tsx:20` — `<Section id="services">` → `id="gastronomia"`
- `src/components/sections/gallery-preview.tsx:19` — `<Section id="portfolio">` → `id="galeria"`

**Nada no repo aponta para essas âncoras hoje** (`grep -rn '#services\|#portfolio' src/ e2e/` volta vazio), então a troca é segura. Confirme você mesmo antes de mexer — se aparecer um link, ele muda junto.

Não confunda com `/gastronomia#${c.slug}` no `llms.txt`: aquilo são âncoras de **categoria do cardápio**, geradas a partir do slug do banco, e não têm relação com o `id` da `Section`.

- [ ] **Step 4: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

O `typecheck` é seu aliado aqui: o `Messages` é tipado a partir do `pt.json` (`src/global.d.ts`), então **todo consumidor esquecido vira erro de compilação**. Se o typecheck passar de primeira, desconfie e confira se você renomeou mesmo o `pt.json`.

Depois suba o servidor e abra as quatro páginas — `/pt/experiencia`, `/pt/galeria`, `/pt/gastronomia`, `/pt/novidades` — mais o admin. **Um `MISSING_MESSAGE` não derruba o build; ele aparece na página.** Procure por esse texto no HTML servido:

```bash
for p in experiencia galeria gastronomia novidades; do
  echo -n "$p: "; curl -sL "http://localhost:3000/pt/$p" | grep -c "MISSING_MESSAGE"
done
```

Todos devem imprimir `0`.

- [ ] **Step 5: Commit**

```bash
git add -A src/
git commit -m "UPD: o catalogo para de falar vocabulario de agencia

about/portfolio/services/informations viram experiencia/galeria/
gastronomia/novidades, junto com os ids de ancora das secoes da home.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Chaves aninhadas, copy do admin e chaves órfãs

Cinco PRs de remoção passaram por aqui. O `typecheck` acusa chave **faltando**, nunca chave **sobrando** — então o `pt.json` provavelmente carrega labels de coisas que já não existem (serviços, projetos, equipe, clientes, números, carreiras).

A Task 3 renomeou os namespaces **de topo**. Esta tarefa fecha três pontas que ficaram, todas levantadas pela revisão da Task 3.

**Files:**
- Modify: `src/messages/pt.json`, `src/components/sections/menu-preview.tsx`, `src/components/sections/gallery-preview.tsx`, e o que os greps apontarem

- [ ] **Step 0a: As chaves aninhadas em `home`**

`home.services` (`pt.json:58`) e `home.portfolio` (`pt.json:63`) sobreviveram porque são **aninhadas**, não de topo. Renomeie para `home.gastronomia` e `home.galeria`, e acompanhe os consumidores: `menu-preview.tsx:12` faz `getTranslations("home.services")` duas linhas acima de um `<Section id="gastronomia">`, e `gallery-preview.tsx:12` faz o mesmo com `home.portfolio`.

- [ ] **Step 0b: A copy do admin passa a dizer "Novidades"**

**Decisão do dono do projeto.** A Task 3 corrigiu a *chave* (`admin.novidades`), mas os *valores* ainda dizem "Informações" — então o administrador clica em "Informações", cai em `/admin/novidades` e edita uma página pública intitulada "Novidades".

Percorra as 32 chaves de `admin.novidades` mais `admin.nav.novidades` e troque a copy visível:

| Chave | De | Para |
|---|---|---|
| `admin.nav.novidades` | "Informações" | "Novidades" |
| `admin.novidades.title` | "Informações" | "Novidades" |
| `admin.novidades.new` | "Nova informação" | "Nova novidade" |
| demais chaves | qualquer "informação"/"informações" na frase | "novidade"/"novidades" |

Leia cada string antes de trocar — **concordância de gênero muda**: "esta informação" → "esta novidade" funciona, mas "o ícone exibido na listagem de informações" → "…de novidades" precisa de conferência frase a frase. Não troque no braço com `sed`.

⚠️ Isto é **valor**, não chave: `admin.testimonials`, `admin.leads`, `admin.cardapio` e `admin.galeria` continuam intocados, chave *e* valor.

- [ ] **Step 1: Levantar as candidatas órfãs**

Para cada chave folha do catálogo, verifique se algo em `src/` a referencia. Um script de varredura serve melhor que o olho — mas **atenção aos falsos positivos**, que aqui são a regra:

- chaves montadas dinamicamente (`t(\`items.${i}.title\`)`, muito usado nas listas da home)
- namespaces inteiros passados a `useTranslations(ns)` e depois acessados por caminho relativo
- `validation.*`, consumido por caminho a partir do zod
- `metadata.*`, lido pelo `generateMetadata`

**Regra:** na dúvida, **mantenha e reporte**. Apagar uma chave viva produz `MISSING_MESSAGE` em produção; manter uma chave morta não custa nada além de bytes. Liste no relatório tudo que você considerou e não apagou, com o motivo.

**Uma candidata já identificada:** `nav.galeria`. O tipo `NavKey` (`src/config/site.ts:27-33`) não tem `"galeria"` — a nav é `inicio · experiencia · gastronomia · reservas · contato`. Mas **isso não prova que a chave é morta**: `nav.novidades` também está fora do `NavKey` e é lida como literal solto em `header.tsx:183`. Procure um consumidor literal antes de apagar.

- [ ] **Step 2: Remover só o que for comprovadamente órfão**

Para cada chave removida, cole no relatório o comando que prova a ausência de consumidor.

- [ ] **Step 3: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

E a varredura de runtime da Task 3 (o `grep -c MISSING_MESSAGE`), agora em **todas** as rotas públicas: `/pt`, `/pt/experiencia`, `/pt/gastronomia`, `/pt/galeria`, `/pt/reservas`, `/pt/contato`, `/pt/novidades`, `/pt/privacy`, `/pt/terms` — mais uma página de artigo e as telas do admin. Todos `0`.

- [ ] **Step 4: Commit** (se algo foi removido; se nada foi, reporte e siga)

---

### Task 5: `sourceUrl` só aceita `http` e `https`

Achado N2 da revisão final do PR 5. O `.url()` do zod aceita `javascript:`, `data:` e `vbscript:` — e esse valor vai para o `href` de um link **público** em `src/components/sections/testimonials.tsx:57`.

Não é um buraco vivo: só o admin autenticado escreve o campo, e o React 19 bloqueia `href="javascript:…"` no render. Mas a validação é a camada que deveria dizer não, e ela hoje diz sim.

**Files:**
- Create: `test/testimonial-url.test.ts`
- Modify: `src/lib/validations/testimonial.ts`, e `src/messages/pt.json` se a mensagem de erro precisar de chave nova

- [ ] **Step 1: Teste primeiro (TDD)**

Escreva `test/testimonial-url.test.ts` no padrão de `test/testimonial-form.test.ts`. Deve **falhar** antes da correção:

- rejeita `javascript:alert(1)`
- rejeita `data:text/html,<script>alert(1)</script>`
- rejeita `vbscript:msgbox(1)`
- aceita `https://g.co/kgs/exemplo`
- aceita `http://exemplo.com/avaliacao`
- aceita string vazia (o campo é opcional e vira `null` na action — confirme o comportamento atual antes de assumir)

Rode e **cole a saída vermelha** no relatório.

- [ ] **Step 2: Corrigir a validação**

Em `src/lib/validations/testimonial.ts`, restrinja o esquema de `sourceUrl`. Um `.refine()` sobre o `.url()` existente, checando `new URL(v).protocol`, mantém a mensagem de erro atual para URL malformada e adiciona uma para esquema proibido. Siga a convenção de mensagens do arquivo — se as outras usam chave do catálogo, esta também usa.

- [ ] **Step 3: Validar**

```bash
npm test && npm run typecheck && npm run lint && npm run build
```

Teste verde. Cole a saída.

- [ ] **Step 4: Commit**

```bash
git add src/lib/validations/testimonial.ts test/testimonial-url.test.ts src/messages/pt.json
git commit -m "CRX: sourceUrl da avaliacao so aceita http e https

O .url() do zod aceitava javascript:, data: e vbscript:, e o valor vai
para o href de um link publico. Admin-gated e o React ja bloqueia no
render, entao e defesa em profundidade — mas a validacao e a camada que
deveria recusar.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Documentação

**Files:**
- Modify: `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/superpowers/specs/2026-08-10-schema-e-admin-do-restaurante-design.md`

⚠️ **A única edição autorizada sob `docs/superpowers/` é marcar progresso no §7 do spec.** Não edite nada em `docs/superpowers/plans/`.

- [ ] **Step 1: `AGENTS.md`**

- A lista de rotas (linha ~45) troca `/informations` por `/novidades`
- O parágrafo que descreve as seis seções do admin diz hoje *"informações (route/namespace `informations`, due to become novidades)"* e *"depoimentos (route/namespace `testimonials`, due to become avaliações)"*. A primeira **aconteceu** — reescreva no passado. A segunda **não vai acontecer**: registre que a rota `/admin/testimonials` fica em inglês por decisão de escopo, e **por quê** (models e rotas de admin em inglês, superfície pública em português), senão o próximo agente "termina" o trabalho achando que ficou pela metade.
- Registre a convenção em uma frase: **superfície pública e catálogo em português; model, arquivo, função, tag de cache e pasta de Storage em inglês.**

- [ ] **Step 2: `docs/ARCHITECTURE.md`**

Mesma troca de rota e a convenção acima. Corrija qualquer menção a `about`/`portfolio`/`services` como namespace.

- [ ] **Step 3: `docs/RUNBOOK.md`**

Confira se algum passo cita `/admin/informations`. Se citar, atualize. A instrução do grupo de WhatsApp aponta para `/admin/leads`, que **não** mudou — deixe.

- [ ] **Step 4: spec §7**

Marque o PR 6 como concluído, no mesmo formato do PR 5. **A revisão do PR 5 notou que os PRs 1 a 4 nunca foram marcados** apesar de concluídos — marque-os também, com a mesma convenção.

- [ ] **Step 5: Validar e commitar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
npx playwright test
```

---

## Critérios de aceite do PR

- [ ] `npm run typecheck && npm run lint && npm run build && npm test` verde; `npx playwright test` verde
- [ ] **Nenhum caminho de rota** aponta para `/informations`:
      `grep -rnE '(href|router\.push|redirect|localizedUrl).*/informations' src/` volta vazio.
      ⚠️ Um `grep -rn '/informations' src/` cru **não serve** e foi um erro na primeira versão
      deste plano: ele acerta os `import … from "@/app/actions/informations"`, que são
      *module specifiers* de um arquivo que o próprio plano manda **não** renomear.
      As duas ocorrências restantes devem ser exatamente essas.
- [ ] Nenhuma superfície servida emite `/informations`: HTML público, `sitemap.xml`, `llms.txt`, `llms-full.txt`
- [ ] `grep -rn 'Translations("\(about\|portfolio\|services\|informations\)"' src/` volta **vazio**
- [ ] `grep -n '"about"\|"portfolio"\|"services"\|"informations"' src/messages/pt.json` volta vazio — **de topo e aninhadas** (`home.services` e `home.portfolio` inclusas)
- [ ] O admin diz "Novidades", não "Informações", no menu lateral e no título da tela
- [ ] `/pt/novidades` e `/pt/novidades/<slug-real>` respondem 200; `/pt/informations` responde 404
- [ ] `sitemap.xml`, `llms.txt` e `llms-full.txt` não contêm `/informations`
- [ ] Nenhuma rota pública nem tela do admin contém `MISSING_MESSAGE`
- [ ] O admin navega: lista → editar → cancelar, sem 404
- [ ] `git status` não mostra arquivo de rota deletado-e-recriado (sinal de que o `git mv` não foi usado)
- [ ] **Nada em `prisma/` foi tocado**

---

## Riscos e armadilhas

**O `typecheck` não vê rota.** Ele valida chave de tradução (o `Messages` é tipado), mas `href` é string. Toda a garantia sobre URL vem das checagens contra o servidor rodando — não pule.

**Servidor velho na porta 3000.** Um `npm run start` antigo serve assets com hash de um build anterior e produz páginas sem CSS ou com rota fantasma. Mate a porta antes de subir. Já aconteceu neste projeto.

**`git mv` em pasta com `[colchetes]`.** O `[slug]` e o `[id]` precisam de aspas no comando, senão o shell expande como glob.

**`llms.txt` nunca listou a rota de novidades.** Ele expõe as 5 páginas principais + categorias do cardápio; `/informations` não está lá, embora esteja no sitemap e no `llms-full.txt`. **Isso é uma inconsistência anterior a este PR e não deve ser corrigida aqui** — o PR 7 vai zerar o banco e a seção fica sem conteúdo até o restaurante publicar a primeira novidade. Anote no relatório final para decidir depois.

**Chave órfã × chave dinâmica.** A Task 4 é a única com risco de *remover algo vivo*. O viés correto é conservador: manter e reportar.

**`information` no singular.** A chave `nav.information` (singular) e o helper `tn("information")` são fáceis de perder num `grep` por `informations`. Procure pelas duas formas.
