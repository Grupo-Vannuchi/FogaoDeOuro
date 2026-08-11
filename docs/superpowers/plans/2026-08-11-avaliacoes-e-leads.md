# Avaliações verificáveis e limpeza de `Lead`/`CAREER` — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar `Testimonial` de depoimento de agência em avaliação **verificável** do Google, e apagar o resíduo de carreiras do `Lead`.

**Architecture:** Duas mudanças independentes num PR só, porque ambas são pequenas alterações de campo em models existentes. A de `Testimonial` é uma fatia vertical modificada — schema, validação, DAL, action, admin e site público. A de `Lead` é uma limpeza de resíduo: a página de carreiras saiu no rebrand e deixou o enum e dois campos para trás.

**Tech Stack:** Next 16 (App Router + Turbopack), React 19 + React Compiler, Prisma 6 + PostgreSQL, next-intl (só `pt`), react-hook-form + zod, Vitest.

## Global Constraints

- **Branch:** `Development`. **Nunca `git push`** — o dono do projeto envia manualmente.
- **Validação obrigatória** ao fim de cada tarefa: `npm run typecheck && npm run lint && npm run build && npm test`.
- **Banco local de pé**: `docker compose up -d` (container `n8x-marketing-db`, porta 5433).
- 🛑 **Nunca** rodar `prisma migrate reset`, nunca definir `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`, nunca aceitar prompt de reset. Se o Prisma pedir reset, **pare e reporte BLOCKED**.
- **Nunca editar migração já aplicada** (quebra de checksum).
- **`prisma migrate dev` não funciona neste ambiente** quando a mudança é destrutiva: ele tenta confirmar interativamente e falha em sessão não-interativa. O caminho conhecido, já usado neste repo: `npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script`, colocar o arquivo à mão em `prisma/migrations/<timestamp>_<nome>/migration.sql` e aplicar com `npx prisma migrate deploy`. Depois **confirme `npx prisma migrate status`**.
- **Português apenas.** Toda string de UI em `src/messages/pt.json`; não existe `en.json`.
- **Nunca devolver linha crua do Prisma ao cliente** — sempre view-model.
- **Toda action de admin** começa com `getCurrentUser()`, revalida com `zod` no servidor e chama `updateTag`.
- **Nenhum formulário do admin usa `zodResolver`** — o servidor é a única validação. Não introduza um.
- Commits convencionais terminando com `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

## A regra que sustenta este PR

⚠️ **As avaliações nunca entram no structured data.** O Google proíbe *self-serving reviews* — emitir `Review` ou `aggregateRating` sobre o próprio negócio, no site dele. As citações aparecem na página; no JSON-LD, nunca. Confirme em `src/components/json-ld.tsx` que nada disso é emitido, e não adicione.

---

## Mapa de arquivos

**Editados:**

| Arquivo | O quê |
|---|---|
| `prisma/schema.prisma` | `Testimonial`: −`company` −`role` +`source` +`sourceUrl`; `Lead`: −`role` −`portfolio`; enum `LeadType`: −`CAREER` |
| `src/lib/validations/testimonial.ts` | schema zod |
| `src/lib/testimonial-form.ts` | ponte formulário ↔ input |
| `src/lib/queries.ts` | `TestimonialView` |
| `src/app/actions/testimonials.ts` | mapeamento dos campos |
| `src/components/admin/testimonial-form.tsx` | campos do formulário |
| `src/app/[locale]/admin/(dashboard)/testimonials/page.tsx` | listagem |
| `src/components/sections/testimonials.tsx` | seção pública |
| `src/app/[locale]/admin/(dashboard)/leads/page.tsx` | filtro de tipo |
| `src/components/admin/lead-filters.tsx` | opção `CAREER` |
| `src/lib/lead-notify.ts` | ramo `CAREER` |
| `src/messages/pt.json` | chaves |
| `test/testimonial-form.test.ts` | **novo** |

**Migrações criadas:** duas — uma para `Testimonial`, outra para `Lead`/`CAREER`.

---

### Task 1: Reformar o model `Testimonial`

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_reform_testimonial/migration.sql`

**Interfaces:**
- Consumes: nada.
- Produces: `Testimonial` com `id`, `authorName`, `avatarUrl`, `rating`, `quote`, `source`, `sourceUrl`, `order`, `published`, `createdAt`, `updatedAt`.

A tabela tem **0 linhas**, então nenhuma migração de dados é necessária — confirme antes de agir.

- [ ] **Step 1: Subir o banco e confirmar que a tabela está vazia**

```bash
docker compose up -d
docker exec n8x-marketing-db psql -U agency -d agency -t -c "select count(*) from testimonials;"
```

Esperado: `0`. **Se não for zero, pare e reporte** — a migração descarta colunas e o plano assume que não há nada a preservar.

- [ ] **Step 2: Alterar o model**

Em `prisma/schema.prisma`, substituir o model `Testimonial` por:

```prisma
/// Uma avaliação de cliente, curada a partir das avaliações públicas do Google.
///
/// `source` e `sourceUrl` são o que separam isto de um depoimento inventado: com
/// o link, o visitante confere a avaliação na origem. Por isso não há `company`
/// nem `role` — cargo e empresa eram de depoimento de agência; quem almoça aqui
/// não tem "Diretor de Marketing, Empresa X".
///
/// ⚠️ Estas avaliações NUNCA entram no structured data: o Google proíbe
/// self-serving reviews (`Review`/`aggregateRating` sobre o próprio negócio, no
/// site dele). Aparecem na página, ficam fora do JSON-LD.
model Testimonial {
  id         String   @id @default(cuid())
  authorName String
  avatarUrl  String?
  rating     Int      @default(5)
  quote      Json // LocalizedText
  /// Onde a avaliação foi publicada, ex.: "Google".
  source     String   @default("Google")
  /// Link direto para a avaliação na origem. Opcional, mas é ele que torna a
  /// citação verificável — o admin insiste nele por hint, não por validação.
  sourceUrl  String?
  order      Int      @default(0)
  published  Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("testimonials")
}
```

- [ ] **Step 3: Gerar e aplicar a migração**

```bash
npx prisma migrate dev --name reform_testimonial
```

Se falhar por sessão não-interativa (provável, porque descartar colunas é destrutivo), use o caminho alternativo das Global Constraints: `migrate diff --script` → arquivo à mão → `migrate deploy`.

🛑 Se pedir **reset**, pare e reporte BLOCKED.

- [ ] **Step 4: Conferir o SQL e o resultado**

```bash
cat prisma/migrations/*_reform_testimonial/migration.sql
docker exec n8x-marketing-db psql -U agency -d agency -c "\d testimonials"
npx prisma migrate status
```

Esperado: o SQL descarta `company` e `role`, adiciona `source` e `sourceUrl`, e **não toca em nenhuma outra tabela**. A tabela final tem as onze colunas do model. `migrate status` diz que o banco está em dia.

- [ ] **Step 5: Validar**

```bash
npm run typecheck
```

Esperado: **FALHA**, com erros em `validations/testimonial.ts`, `testimonial-form.ts`, `queries.ts`, `actions/testimonials.ts`, `testimonial-form.tsx`, a listagem do admin e a seção pública. Essa lista é o roteiro das tarefas seguintes — anote-a no relatório.

Este é o único ponto do plano em que uma tarefa termina com o typecheck vermelho: separar o schema do código é o que mantém a migração revisável sozinha. As tarefas 2 a 4 fecham isso.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "UPD: Testimonial vira avaliacao verificavel

Saem company e role — cargo e empresa eram de depoimento de agencia; quem
almoca aqui nao tem 'Diretor de Marketing, Empresa X'.

Entram source e sourceUrl: com o link, a citacao vira verificavel na origem,
e o trabalho passa a ser curadoria das avaliacoes do Google que ja existem,
nao redacao.

A tabela tinha 0 linhas, entao nao houve migracao de dados.

O typecheck fica vermelho ate as proximas tarefas: separar o schema do
codigo mantem a migracao revisavel sozinha.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Validação e ponte do formulário (TDD)

**Files:**
- Modify: `src/lib/validations/testimonial.ts`, `src/lib/testimonial-form.ts`
- Test: `test/testimonial-form.test.ts` (novo)

**Interfaces:**
- Consumes: o model da Task 1.
- Produces: `testimonialSchema`, `TestimonialInput`, `TestimonialFormValues`, `emptyTestimonialForm()`, `testimonialToForm(row)`, `formToInput(values)` — os mesmos nomes de hoje, com os campos trocados.

- [ ] **Step 1: Escrever os testes que falham**

Criar `test/testimonial-form.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  emptyTestimonialForm,
  testimonialToForm,
  formToInput,
} from "@/lib/testimonial-form";
import { testimonialSchema } from "@/lib/validations/testimonial";

describe("avaliação", () => {
  it("o formulário vazio não passa: autor e citação são obrigatórios", () => {
    expect(
      testimonialSchema.safeParse(formToInput(emptyTestimonialForm())).success,
    ).toBe(false);
  });

  it("preenchido, passa — sourceUrl é opcional", () => {
    const v = emptyTestimonialForm();
    v.authorName = "Ana Paula";
    v.quote.pt = "Melhor almoço do Centro.";
    const input = formToInput(v);
    expect(input.sourceUrl).toBe("");
    expect(testimonialSchema.safeParse(input).success).toBe(true);
  });

  it("o formulário vazio já vem com o source padrão", () => {
    expect(emptyTestimonialForm().source).toBe("Google");
  });

  it("recusa um sourceUrl que não é URL", () => {
    const v = emptyTestimonialForm();
    v.authorName = "Ana";
    v.quote.pt = "Ótimo.";
    v.sourceUrl = "google.com/maps";
    expect(testimonialSchema.safeParse(formToInput(v)).success).toBe(false);
  });

  it("aceita um sourceUrl válido", () => {
    const v = emptyTestimonialForm();
    v.authorName = "Ana";
    v.quote.pt = "Ótimo.";
    v.sourceUrl = "https://maps.google.com/?cid=123";
    expect(testimonialSchema.safeParse(formToInput(v)).success).toBe(true);
  });

  it("recusa nota fora de 1–5", () => {
    const v = emptyTestimonialForm();
    v.authorName = "Ana";
    v.quote.pt = "Ótimo.";
    v.rating = "6";
    expect(testimonialSchema.safeParse(formToInput(v)).success).toBe(false);
  });

  it("testimonialToForm lê sourceUrl nulo como texto vazio", () => {
    const form = testimonialToForm({
      authorName: "Ana",
      avatarUrl: null,
      rating: 5,
      quote: { pt: "Ótimo." },
      source: "Google",
      sourceUrl: null,
      order: 0,
      published: true,
    });
    expect(form.sourceUrl).toBe("");
    expect(form.avatarUrl).toBe("");
    expect(form.source).toBe("Google");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
npx vitest run test/testimonial-form.test.ts
```

Esperado: FALHA — os módulos ainda têm `company`/`role` e não têm `source`/`sourceUrl`.

- [ ] **Step 3: Atualizar o schema zod**

Em `src/lib/validations/testimonial.ts`, substituir o objeto exportado por:

```ts
export const testimonialSchema = z.object({
  authorName: z.string().trim().min(1).max(120),
  avatarUrl: z.union([url, z.literal("")]),
  rating: z.coerce.number().int().min(1).max(5),
  quote: localizedText(1000),
  source: z.string().trim().min(1).max(60),
  sourceUrl: z.union([url, z.literal("")]),
  order: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
});
```

Remover `company` e `role` do objeto. Manter os helpers `localizedText` e `url` que já existem no arquivo, e atualizar o comentário do topo, que descreve os campos.

- [ ] **Step 4: Atualizar a ponte do formulário**

Em `src/lib/testimonial-form.ts`: em `TestimonialFormValues`, trocar `company: string` e `role: LocalizedStrings` por `source: string` e `sourceUrl: string`. Em `emptyTestimonialForm()`, `source: "Google"` e `sourceUrl: ""`. Em `TestimonialRow`, trocar `company: string` e `role: unknown` por `source: string` e `sourceUrl: string | null`. Em `testimonialToForm`, `source: t.source` e `sourceUrl: t.sourceUrl ?? ""`. Em `formToInput`, `source: values.source.trim()` e `sourceUrl: values.sourceUrl.trim()`.

- [ ] **Step 5: Rodar os testes**

```bash
npx vitest run test/testimonial-form.test.ts
```

Esperado: PASS, 7 testes.

- [ ] **Step 6: Validar**

```bash
npm run typecheck
```

Esperado: ainda **falha**, mas agora só em `queries.ts`, `actions/testimonials.ts`, `testimonial-form.tsx`, a listagem do admin e a seção pública. Registre a lista.

```bash
npm test
```

Esperado: passa, com 6 arquivos de teste.

- [ ] **Step 7: Commit**

```bash
git add src/lib/validations/testimonial.ts src/lib/testimonial-form.ts test/testimonial-form.test.ts
git commit -m "UPD: validacao e ponte de formulario da avaliacao

Escrito por TDD. Os testes cobrem o que erra calado: sourceUrl nulo lido
como texto vazio, source ja vindo como 'Google' no formulario novo, e um
sourceUrl que nao e URL sendo recusado — e o caso oposto, um link valido do
Maps passando.

sourceUrl e opcional de proposito: forcar o link bloquearia avaliacoes
legitimas sem permalink. O admin insiste nele por hint.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: DAL e server action

**Files:**
- Modify: `src/lib/queries.ts`, `src/app/actions/testimonials.ts`

**Interfaces:**
- Consumes: `TestimonialInput` (Task 2).
- Produces: `TestimonialView` = `{ id, authorName, avatarUrl, rating, quote, source, sourceUrl }`.

- [ ] **Step 1: Atualizar o view-model e a query**

Em `src/lib/queries.ts`, no tipo `TestimonialView`, trocar `company: string` e `role: string` por `source: string` e `sourceUrl: string | null`. Em `getTestimonials`, trocar o mapeamento correspondente: `source: t.source`, `sourceUrl: t.sourceUrl`, e remover as linhas de `company` e `role` (inclusive o `localize(t.role, locale)`).

- [ ] **Step 2: Atualizar a server action**

Em `src/app/actions/testimonials.ts`, na função `toData`, trocar `company: input.company` e `role: input.role` por:

```ts
    source: input.source,
    sourceUrl: input.sourceUrl || null,
```

O `|| null` segue o padrão que o `avatarUrl` já usa no mesmo objeto: string vazia vira `null` na coluna nullable.

Não mexer na checagem de auth, na revalidação nem no `safeParse` — só no mapeamento de campos.

- [ ] **Step 3: Validar**

```bash
npm run typecheck
```

Esperado: ainda falha, agora só em `testimonial-form.tsx`, na listagem do admin e na seção pública. Registre.

```bash
npm test
```

Esperado: passa.

- [ ] **Step 4: Commit**

```bash
git add src/lib/queries.ts src/app/actions/testimonials.ts
git commit -m "UPD: DAL e action da avaliacao acompanham os campos novos

sourceUrl vazio vira null na coluna, seguindo o que avatarUrl ja fazia no
mesmo mapeamento.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Admin e site público

Esta tarefa fecha o typecheck.

**Files:**
- Modify: `src/components/admin/testimonial-form.tsx`, `src/app/[locale]/admin/(dashboard)/testimonials/page.tsx`, `src/components/sections/testimonials.tsx`, `src/messages/pt.json`

**Interfaces:**
- Consumes: `TestimonialFormValues` (Task 2), `TestimonialView` (Task 3).
- Produces: nada — é a ponta.

- [ ] **Step 1: Ajustar as chaves de tradução**

Em `src/messages/pt.json`, dentro de `admin.testimonials`, remover `company`, `role` e `roleHint`, e acrescentar:

```json
      "source": "Onde foi publicada",
      "sourceHint": "Normalmente \"Google\". É o que aparece junto do link.",
      "sourceUrl": "Link para a avaliação",
      "sourceUrlHint": "Cole o link direto da avaliação no Google. É ele que deixa a citação verificável — sem ele, a avaliação parece inventada.",
```

Em `home.testimonials`, se alguma chave citar cargo ou empresa, ajuste o texto. Manter o `eyebrow` e o `subtitle` como estão — eles falam da nota e do volume de avaliações, que continuam verdadeiros.

- [ ] **Step 2: Ajustar o formulário do admin**

Em `src/components/admin/testimonial-form.tsx`: remover o campo `company` e o campo localizado `role`; acrescentar dois campos de texto, `source` e `sourceUrl`, com os hints das chaves novas. `sourceUrl` recebe `placeholder="https://maps.google.com/…"`.

Espelhe a estrutura dos campos vizinhos do próprio arquivo (label, input, `FieldError`, parágrafo de hint) — não invente marcação nova. **Não** adicione `zodResolver`.

- [ ] **Step 3: Ajustar a listagem do admin**

Em `src/app/[locale]/admin/(dashboard)/testimonials/page.tsx`, a linha secundária de cada item mostra hoje `{localize(item.role, locale)} · {item.company}`. Trocar por `item.source`, e — quando `item.sourceUrl` existir — um link para ele. Remover o import de `localize` se ficar sem uso.

- [ ] **Step 4: Ajustar a seção pública**

Em `src/components/sections/testimonials.tsx`, a linha que hoje renderiza `{item.role} · {item.company}` passa a mostrar a origem. Quando `item.sourceUrl` existir, envolver em um `<a>` com `target="_blank"` e `rel="noopener noreferrer"`; quando não existir, texto simples.

O nome do autor e a nota em estrelas continuam como estão.

- [ ] **Step 5: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

Esperado: **agora sim, exit 0 em todos**. É aqui que o vermelho da Task 1 fecha.

- [ ] **Step 6: Conferir no navegador**

```bash
npm run start
```

Entrar em `http://localhost:3000/pt/admin/login` (`admin@example.com` / `changeme123`), abrir **Depoimentos**, criar uma avaliação com link (`https://maps.google.com/?cid=123`), conferir que ela aparece na listagem com a origem, e então abrir `http://localhost:3000/pt` e confirmar que a seção de avaliações renderiza com o link clicável. Encerrar o servidor.

⚠️ **Nunca** use `page.click('button[type="submit"]')` sem escopo em script de navegador — o painel tem botões "Sair" que casam com esse seletor, e acertar um parece perda de sessão. Mire pelo nome acessível: `getByRole("button", { name: "Salvar alterações" })` ou o rótulo que o formulário usar.

- [ ] **Step 7: Confirmar que nada disso vazou para o structured data**

```bash
curl -s http://localhost:3000/pt | grep -o "aggregateRating\|\"Review\"" | sort | uniq -c
```

Esperado: **nenhuma saída**. O Google proíbe *self-serving reviews*; a citação aparece na página e nunca no JSON-LD.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "UPD: admin e site publico exibem a origem da avaliacao

O formulario troca cargo e empresa por origem e link. A listagem e a secao
publica mostram a origem, com link para a avaliacao quando houver — e o
hint do admin explica que e o link que separa uma citacao verificavel de uma
que parece inventada.

Nada disso entra no JSON-LD: o Google proibe self-serving reviews.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Remover o resíduo de carreiras do `Lead`

A página de carreiras saiu no rebrand e deixou para trás o valor `CAREER` do enum e dois campos que só ela preenchia.

**Files:**
- Modify: `prisma/schema.prisma`, `src/app/[locale]/admin/(dashboard)/leads/page.tsx`, `src/components/admin/lead-filters.tsx`, `src/lib/lead-notify.ts`, `src/messages/pt.json`
- Create: `prisma/migrations/<timestamp>_remove_career_lead/migration.sql`

**Interfaces:**
- Consumes: nada.
- Produces: `LeadType` com um único valor, `CONTACT`. `Lead` sem `role` nem `portfolio`.

- [ ] **Step 1: ⚠️ Tratar os dados ANTES de mexer no enum**

O banco tem **1 lead com `type = 'CAREER'`** e **1 com `role`/`portfolio` preenchidos** — resíduo do seed da agência. **Postgres não permite remover um valor de enum que está em uso**: a migração falha se você não tratar isso antes.

Confirme o estado atual:

```bash
docker exec n8x-marketing-db psql -U agency -d agency -c "select type, count(*) from leads group by type;"
```

A migração precisa **converter** essas linhas antes de alterar o tipo — converter, não apagar: a linha registra que alguém enviou um formulário, e os campos que carregavam a informação específica de carreira estão sendo descartados de qualquer forma.

- [ ] **Step 2: Alterar o schema**

Em `prisma/schema.prisma`:

```prisma
enum LeadType {
  CONTACT
}
```

E no model `Lead`, remover as linhas `role` e `portfolio`. **Manter `company`** — um lead corporativo de almoço pode informar a empresa.

- [ ] **Step 3: Gerar a migração e ACRESCENTAR o passo de dados**

```bash
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
```

Crie `prisma/migrations/<timestamp>_remove_career_lead/migration.sql` com o SQL gerado, mas **com esta linha inserida antes de qualquer alteração no tipo**:

```sql
-- Converte o residuo do seed da agencia antes de remover o valor do enum:
-- Postgres recusa remover um valor em uso. Converter em vez de apagar — a
-- linha registra um envio real de formulario, e os campos especificos de
-- carreira estao sendo descartados de qualquer forma.
UPDATE "leads" SET "type" = 'CONTACT' WHERE "type" = 'CAREER';
```

Use o mesmo timestamp/formato de nome das 20 migrações vizinhas, e inclua um cabeçalho `/* Warnings: ... */` como o de `prisma/migrations/20260810161444_remove_funnels/migration.sql`, já que a mudança descarta colunas.

- [ ] **Step 4: Aplicar e conferir**

```bash
npx prisma migrate deploy
npx prisma migrate status
docker exec n8x-marketing-db psql -U agency -d agency -c "select type, count(*) from leads group by type;"
docker exec n8x-marketing-db psql -U agency -d agency -c "\d leads"
```

Esperado: `migrate status` em dia; todos os leads com `type = CONTACT`; a tabela sem `role` e sem `portfolio`, **com `company` ainda lá**; e a contagem total de leads **inalterada** (nada foi apagado).

🛑 Se o `migrate deploy` falhar, **não force nada** — reporte BLOCKED com a mensagem exata.

- [ ] **Step 5: Limpar o código**

- `src/app/[locale]/admin/(dashboard)/leads/page.tsx`: `LEAD_TYPES` passa a `["CONTACT"]`; remover a entrada `CAREER` do mapa de rótulos.
- `src/components/admin/lead-filters.tsx`: remover a `<option value="CAREER">`.
- `src/lib/lead-notify.ts`: o tipo passa a `"CONTACT"`; remover o ramo `if (lead.type === "CAREER")` e a atribuição condicional de `source`, que agora é sempre "Contato".
- `src/messages/pt.json`: remover `admin.leads.typeCareer`.

Se o filtro de tipo ficar com uma opção só, avalie se ele ainda faz sentido — **reporte a observação, mas não remova o filtro nesta tarefa**; é decisão de produto.

- [ ] **Step 6: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

- [ ] **Step 7: Conferir o formulário de contato de ponta a ponta**

```bash
npm run start
```

Abrir `http://localhost:3000/pt/contato`, enviar o formulário e confirmar a mensagem de sucesso. Depois conferir no banco que a linha entrou com `type = CONTACT`:

```bash
docker exec n8x-marketing-db psql -U agency -d agency -c "select name, type, \"landingLabel\" from leads order by \"createdAt\" desc limit 1;"
```

Encerrar o servidor. Este é o único endpoint público de escrita do site — se ele quebrar, o PR não pode ir.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "RMV: remove o residuo de carreiras do Lead

A pagina de carreiras saiu no rebrand e deixou o valor CAREER do enum e dois
campos que so ela preenchia (role, portfolio).

A migracao converte o unico lead CAREER para CONTACT ANTES de alterar o
enum: o Postgres recusa remover um valor em uso, entao sem esse passo a
migracao falharia. Converter em vez de apagar — a linha registra um envio
real, e os campos de carreira estao sendo descartados de qualquer forma.

Lead.company fica: um lead corporativo de almoco pode informar a empresa.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Documentação

**Files:**
- Modify: `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/superpowers/specs/2026-08-10-schema-e-admin-do-restaurante-design.md`

**Interfaces:**
- Consumes: nada.
- Produces: documentação que descreve o estado atual.

- [ ] **Step 1: Atualizar o spec**

Em `docs/superpowers/specs/2026-08-10-schema-e-admin-do-restaurante-design.md`, marcar o PR 5 da tabela de ordem de execução (§7) como concluído, do mesmo jeito que os anteriores.

⚠️ Esta é a **única** edição autorizada sob `docs/superpowers/` — é o spec vivo que rege esta série de PRs, e marcar progresso nele é o padrão já usado. **Não** edite nada em `docs/superpowers/plans/`.

- [ ] **Step 2: Atualizar `AGENTS.md` e `docs/ARCHITECTURE.md`**

Se algum dos dois descreve `Testimonial` com cargo e empresa, ou o `Lead` com campos de carreira, corrija. Acrescente, onde couber, a regra que vale para sempre: **as avaliações nunca entram no structured data**, porque o Google proíbe self-serving reviews.

`AGENTS.md` é carregado como instrução em toda sessão — uma descrição errada ali desinforma todo trabalho futuro.

- [ ] **Step 3: Confirmar que não sobrou referência**

```bash
grep -rn "CAREER\|typeCareer" src/ prisma/schema.prisma
grep -rni "company\|\brole\b" src/lib/validations/testimonial.ts src/lib/testimonial-form.ts src/components/sections/testimonials.tsx
```

Esperado: nenhuma saída nos dois.

- [ ] **Step 4: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
npx playwright test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: avaliacoes verificaveis e Lead sem carreiras

Registra no AGENTS.md a regra que vale para sempre: as avaliacoes aparecem
na pagina e NUNCA no structured data, porque o Google proibe self-serving
reviews sobre o proprio negocio.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Critérios de aceite do PR

- `npm run typecheck && npm run lint && npm run build` verde.
- `npm test` verde, com 6 arquivos (`contact-form`, `phone`, `rate-limit`, `menu-form`, `gallery-form`, `testimonial-form`).
- `npx playwright test` verde.
- `Testimonial` sem `company` e sem `role`, com `source` e `sourceUrl`.
- `LeadType` com um valor só; `Lead` sem `role` e sem `portfolio`, **com `company`**.
- **Nenhum lead apagado** — o `CAREER` foi convertido, não removido.
- O formulário de contato envia e grava com `type = CONTACT`.
- **Nenhum `aggregateRating` ou `Review` no JSON-LD.**
- 8 models, 9 tabelas (nenhuma tabela criada ou removida neste PR).
- Nenhum `git push`.
