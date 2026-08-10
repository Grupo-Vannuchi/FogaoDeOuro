# Remoção do subsistema de funis — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remover o subsistema de funis (quiz conversacional) e a integração com o Google Calendar que só ele usa, sem derrubar o formulário de contato nem a notificação de leads por WhatsApp.

**Architecture:** Remoção em camadas, cada tarefa terminando com o projeto compilando. A gestão de instâncias do Evolution é **preservada primeiro** (hoje ela mora dentro da árvore de funis, mas quem depende dela é a notificação de leads). O código dos funis sai numa tarefa atômica — `lib/funnel-runtime.ts` é importado tanto pelo admin quanto pelo runtime público, então qualquer divisão deixaria um estado que não compila. Depois saem o Google Calendar, os testes, o schema e, por último, as strings.

**Tech Stack:** Next 16 (App Router + Turbopack), React 19 com React Compiler, Prisma 6 + PostgreSQL, next-intl (só `pt`), Vitest, Playwright, Tailwind 4.

## Global Constraints

- **Branch:** `Development`. Nunca `git push` — o humano faz isso manualmente.
- **Validação obrigatória** ao fim de cada tarefa: `npm run typecheck && npm run lint && npm run build`.
- **Banco local precisa estar de pé** para o `build` (prerender de 42 páginas) e para `prisma migrate dev`: `docker compose up -d` (container `n8x-marketing-db`, porta 5433).
- **Nunca remover:** `Lead`, `LeadNotificationConfig`, `src/lib/evolution.ts`, `src/lib/lead-notify.ts`, `src/app/actions/whatsapp.ts`, `src/components/admin/whatsapp-manager.tsx`, `src/components/admin/lead-notify-config.tsx`. O formulário de contato depende deles.
- **`prisma migrate dev` só contra o Docker local.** Em produção quem roda é `migrate deploy`, no build da Vercel.
- **Nunca editar migração já aplicada** (quebra de checksum).
- **Português apenas.** Toda string de UI vive em `src/messages/pt.json`; não existe `en.json`.
- **Commits convencionais**, terminando com `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Prefixo de tarefa do board: **RMV** (remover o que existe).

---

## Mapa de arquivos

**Movidos (1):**
- `src/app/[locale]/admin/(dashboard)/funnels/whatsapp/page.tsx` → `src/app/[locale]/admin/(dashboard)/leads/whatsapp/page.tsx`

**Deletados inteiros (~32 arquivos, contando o conteúdo dos diretórios):**

```
src/app/[locale]/(funnels)/                     grupo de rota inteiro (2 arquivos)
src/app/[locale]/admin/(dashboard)/funnels/     6 arquivos (após mover o whatsapp)
src/app/api/admin/funnels/[id]/export/route.ts
src/app/api/admin/google/                       2 arquivos (callback, connect)
src/app/actions/funnels.ts
src/app/actions/funnels-public.ts
src/components/funnels/                         2 arquivos
src/components/admin/funnel-default-form.tsx
src/components/admin/funnel-delete-button.tsx
src/components/admin/funnel-form.tsx
src/components/admin/submissions-filter.tsx
src/components/admin/google-disconnect-button.tsx
src/lib/funnel-form.ts
src/lib/funnel-runtime.ts
src/lib/google-calendar.ts
src/lib/validations/funnel.ts
src/lib/validations/funnel-submission.ts
prisma/seed-funnel-defaults.ts
prisma/seed-e2e.ts
e2e/funnel.spec.ts
e2e/global-setup.ts
test/funnel-form.test.ts
test/funnel-runner.test.tsx
test/funnel-runtime.test.ts
```

**Editados:**

| Arquivo | O quê |
|---|---|
| `src/lib/queries.ts` | remove `getPublishedFunnelBySlug`, `FunnelRunView`, `FunnelEndingView` e o import de `funnel-runtime` |
| `src/lib/admin-queries.ts` | remove 6 funções de funil + `getGoogleAccount` |
| `src/lib/cache.ts` | remove a tag `funnels` |
| `src/lib/env.ts` | remove `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` |
| `src/components/admin/admin-nav.tsx` | remove o item `funnels` e o ícone `Workflow` |
| `src/app/[locale]/admin/(dashboard)/layout.tsx` | remove `countFunnelSubmissions` e o badge |
| `src/app/[locale]/admin/(dashboard)/leads/page.tsx` | ganha link para `/admin/leads/whatsapp` |
| `prisma/schema.prisma` | remove 6 models e 5 enums |
| `prisma/seed.ts` | remove `seedFunnelDefaults` |
| `playwright.config.ts` | remove `globalSetup` |
| `src/messages/pt.json` | remove o namespace `funnel` e `admin.nav.funnels`; renomeia `admin.whatsapp.backToFunnels` |
| `src/lib/evolution.ts`, `src/lib/rate-limit.ts`, `src/lib/phone.ts` | só comentários que citam funil |

---

### Task 1: Preservar a gestão de instâncias do WhatsApp

A tela que conecta o Evolution (QR code, listar instâncias) mora hoje em `/admin/funnels/whatsapp`. Ela **não é dos funis**: `lead-notify-config.tsx`, na página de Contatos, chama `listInstancesAction` do mesmo módulo, e é essa instância que empurra os leads do formulário para o grupo de WhatsApp. Apagar a árvore de funis sem mover esta página deixaria a notificação de leads sem como ser configurada.

Esta tarefa vem primeiro justamente para que a Task 2 possa apagar `funnels/` inteiro sem pensar.

**Files:**
- Move: `src/app/[locale]/admin/(dashboard)/funnels/whatsapp/page.tsx` → `src/app/[locale]/admin/(dashboard)/leads/whatsapp/page.tsx`
- Modify: `src/app/[locale]/admin/(dashboard)/leads/page.tsx`
- Modify: `src/messages/pt.json` (chave `admin.whatsapp.backToFunnels`)

**Interfaces:**
- Consumes: nada de tarefas anteriores.
- Produces: a rota `/admin/leads/whatsapp`. A Task 2 assume que `src/app/[locale]/admin/(dashboard)/funnels/` já não contém nada que precise sobreviver.

- [ ] **Step 1: Subir o banco local (necessário para o build)**

```bash
docker compose up -d
docker ps --filter "name=n8x-marketing-db" --format "{{.Status}}"
```

Esperado: `Up ... (healthy)`.

- [ ] **Step 2: Mover a página preservando o histórico**

```bash
mkdir -p "src/app/[locale]/admin/(dashboard)/leads/whatsapp"
git mv "src/app/[locale]/admin/(dashboard)/funnels/whatsapp/page.tsx" \
       "src/app/[locale]/admin/(dashboard)/leads/whatsapp/page.tsx"
```

- [ ] **Step 3: Corrigir o nome da função e o link de volta**

Em `src/app/[locale]/admin/(dashboard)/leads/whatsapp/page.tsx`, trocar o nome da função e o destino do link (o rótulo passa a apontar para Contatos):

```tsx
export default async function LeadsWhatsappPage({
```

```tsx
        <Link
          href="/admin/leads"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("backToLeads")}
        </Link>
```

- [ ] **Step 4: Renomear a chave de tradução**

Em `src/messages/pt.json`, dentro de `admin.whatsapp`, trocar a chave `backToFunnels` por `backToLeads` e o texto para apontar aos contatos:

```json
      "backToLeads": "Voltar para Contatos",
```

- [ ] **Step 5: Dar acesso à tela a partir da página de Contatos**

Em `src/app/[locale]/admin/(dashboard)/leads/page.tsx`, adicionar o link junto ao cabeçalho (antes de `<LeadNotifyConfig />`):

```tsx
      <Link
        href="/admin/leads/whatsapp"
        className={cn(buttonVariants({ variant: "outline", size: "md" }))}
      >
        <MessagesSquare className="size-4" />
        {t("whatsappLink")}
      </Link>
```

Garantir os imports no topo do arquivo (`Link` de `@/i18n/navigation`, `MessagesSquare` de `lucide-react`, `buttonVariants` de `@/components/ui/button`, `cn` de `@/lib/utils`) e a chave `whatsappLink` em `admin.leads` no `pt.json`:

```json
      "whatsappLink": "Instâncias do WhatsApp",
```

- [ ] **Step 6: Validar**

```bash
npm run typecheck && npm run lint && npm run build
```

Esperado: typecheck sem saída (exit 0), lint com `0 errors`, build `✓ Compiled successfully`. A rota `/[locale]/admin/leads/whatsapp` deve aparecer na listagem do build.

- [ ] **Step 7: Conferir no navegador**

```bash
npm run start
```

Abrir `http://localhost:3000/pt/admin/login`, entrar com `admin@example.com` / `changeme123`, ir em **Contatos** e clicar em "Instâncias do WhatsApp". A tela deve carregar e o "Voltar para Contatos" deve funcionar. Encerrar o servidor depois.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(admin): move a gestao de instancias do WhatsApp para Contatos

A tela vivia dentro da arvore de funis, mas quem depende dela e a
notificacao de leads: lead-notify-config chama listInstancesAction para
escolher a instancia que empurra o formulario de contato para o grupo.
Movida antes da remocao dos funis para nao sair junto.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Remover o código dos funis

Remoção atômica. `src/lib/funnel-runtime.ts` é importado por 9 arquivos — admin **e** runtime público — então qualquer divisão deixaria um estado intermediário que não compila.

**Files:**
- Delete: os 17 arquivos/diretórios de funil listados abaixo
- Modify: `src/lib/queries.ts`, `src/lib/admin-queries.ts`, `src/lib/cache.ts`, `src/components/admin/admin-nav.tsx`, `src/app/[locale]/admin/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: a rota `/admin/leads/whatsapp` da Task 1.
- Produces: nenhum símbolo novo. Depois desta tarefa, `grep -ri funnel src/` só deve retornar comentários (limpos na Task 6).

- [ ] **Step 1: Apagar os arquivos exclusivos dos funis**

```bash
git rm -r "src/app/[locale]/(funnels)" \
          "src/app/[locale]/admin/(dashboard)/funnels" \
          "src/app/api/admin/funnels" \
          src/components/funnels
git rm src/app/actions/funnels.ts \
       src/app/actions/funnels-public.ts \
       src/components/admin/funnel-default-form.tsx \
       src/components/admin/funnel-delete-button.tsx \
       src/components/admin/funnel-form.tsx \
       src/components/admin/submissions-filter.tsx \
       src/lib/funnel-form.ts \
       src/lib/funnel-runtime.ts \
       src/lib/validations/funnel.ts \
       src/lib/validations/funnel-submission.ts \
       test/funnel-form.test.ts \
       test/funnel-runner.test.tsx \
       test/funnel-runtime.test.ts
```

- [ ] **Step 2: Verificar que o typecheck quebra (as referências pendentes)**

```bash
npm run typecheck
```

Esperado: FALHA, com erros de módulo não encontrado em `src/lib/queries.ts`, `src/lib/admin-queries.ts` e `src/app/[locale]/admin/(dashboard)/layout.tsx`. Essa lista é o roteiro dos próximos passos.

- [ ] **Step 3: Limpar a DAL pública (`src/lib/queries.ts`)**

Remover o import do topo:

```ts
import type { FunnelDefaultStep } from "@/lib/funnel-runtime";
```

E remover o bloco inteiro que vai de `/** A funnel reduced to what the public runner needs …` até o fechamento de `getPublishedFunnelBySlug` (tipos `FunnelEndingView`, `FunnelRunView` e a query, linhas ~393–462).

- [ ] **Step 4: Limpar a DAL do admin (`src/lib/admin-queries.ts`)**

Remover as funções `getAdminFunnels`, `getFunnelById`, `getFunnelDefaultTemplate`, `getFunnelSubmissions`, `countFunnelSubmissions` e `getGoogleAccount`, além dos tipos do Prisma que só elas importam (`Funnel`, `FunnelEnding`, `FunnelQuestion`, `FunnelSubmission`, `FunnelDefaultTemplate`, `GoogleAccount` na linha de import do `@prisma/client`).

- [ ] **Step 5: Remover a tag de cache (`src/lib/cache.ts`)**

Remover a linha:

```ts
  funnels: "funnels",
```

- [ ] **Step 6: Remover o item do menu do admin (`src/components/admin/admin-nav.tsx`)**

Remover a entrada da lista `items`:

```tsx
  { href: "/admin/funnels", key: "funnels", icon: Workflow, exact: false },
```

E remover `Workflow` do import de `lucide-react` (nenhum outro item usa).

- [ ] **Step 7: Remover o badge do layout do admin**

Em `src/app/[locale]/admin/(dashboard)/layout.tsx`, remover o import de `countFunnelSubmissions`, a chamada `const funnelSubmissions = await countFunnelSubmissions();` e a prop `badges={{ funnels: funnelSubmissions }}` do `<AdminShell>`. Se `badges` ficar sem nenhum valor, remover a prop inteira.

- [ ] **Step 8: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

Esperado: typecheck exit 0; lint `0 errors`; build `✓ Compiled successfully` **sem** a rota `/[locale]/f/[slug]` na listagem. `npm test` cai de 6 para **3 arquivos** — `Test Files 3 passed (3)` — sobrando `contact-form`, `phone` e `rate-limit`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "RMV: remove o subsistema de funis

O restaurante nao usa o quiz conversacional. Saem o runtime publico
(/f/<slug>), o editor no admin, as server actions, os componentes, as
validacoes e os testes.

Removido de uma vez porque lib/funnel-runtime.ts era importado tanto pelo
admin quanto pelo runtime publico: dividir deixaria um commit que nao
compila.

Preservados: Lead, LeadNotificationConfig, evolution.ts e lead-notify.ts —
o formulario de contato depende deles.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Remover a integração com o Google Calendar

O Google Calendar era usado **exclusivamente** pelos endings do tipo MEETING. Sem funis, some a integração OAuth inteira — e com ela a manutenção manual de reconexão descrita no RUNBOOK.

**Files:**
- Delete: `src/lib/google-calendar.ts`, `src/app/api/admin/google/`, `src/components/admin/google-disconnect-button.tsx`
- Modify: `src/lib/env.ts`
- Modify: `docs/RUNBOOK.md`

**Interfaces:**
- Consumes: a Task 2 já removeu `getGoogleAccount` de `admin-queries.ts`.
- Produces: nenhum. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_REDIRECT_URI` deixam de existir no contrato de env.

- [ ] **Step 1: Apagar os arquivos**

```bash
git rm -r src/app/api/admin/google
git rm src/lib/google-calendar.ts src/components/admin/google-disconnect-button.tsx
```

- [ ] **Step 2: Remover as variáveis de ambiente (`src/lib/env.ts`)**

Remover o comentário e as três linhas:

```ts
  // Google OAuth (Calendar) for MEETING funnels.
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
```

⚠️ **Não** tocar em `EVOLUTION_*`, `KV_REST_API_*`, `SUPABASE_*` nem `WHATSAPP_INBOX_URL`.

- [ ] **Step 3: Atualizar o RUNBOOK**

Em `docs/RUNBOOK.md`, remover a seção de conexão/reconexão do Google (OAuth, publicação do app, tratamento de `invalid_grant`) e pôr no lugar exatamente:

```markdown
## Google Calendar — removido

A integração existia apenas para os endings do tipo MEETING dos funis e saiu
junto com eles em agosto de 2026. Não há mais OAuth para reconectar, nem
`GOOGLE_*` para configurar na Vercel.
```

- [ ] **Step 4: Validar**

```bash
npm run typecheck && npm run lint && npm run build
```

Esperado: exit 0 nos três. A listagem do build **não** deve conter `/api/admin/google/callback` nem `/api/admin/google/connect`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "RMV: remove a integracao com o Google Calendar

Era usada exclusivamente pelos endings MEETING dos funis. Saem
lib/google-calendar.ts, as rotas de OAuth, o botao de desconectar e as
variaveis GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI.

Menos setup manual: some tambem a reconexao periodica descrita no RUNBOOK.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Remover os testes e o seed de e2e

O WHITELABEL avisa: **o CI quebra se isto for esquecido.** `playwright.config.ts` aponta `globalSetup` para um arquivo que semeia um funil.

**Files:**
- Delete: `e2e/funnel.spec.ts`, `e2e/global-setup.ts`, `prisma/seed-e2e.ts`, `prisma/seed-funnel-defaults.ts`
- Modify: `playwright.config.ts`, `prisma/seed.ts`, `package.json`

**Interfaces:**
- Consumes: nada.
- Produces: a suíte e2e passa a ter só `e2e/contact.spec.ts` — que é a prova de que o formulário de contato sobreviveu.

- [ ] **Step 1: Apagar os arquivos**

```bash
git rm e2e/funnel.spec.ts e2e/global-setup.ts prisma/seed-e2e.ts prisma/seed-funnel-defaults.ts
```

- [ ] **Step 2: Remover o `globalSetup` do Playwright**

Em `playwright.config.ts`, remover a linha:

```ts
  globalSetup: "./e2e/global-setup.ts",
```

- [ ] **Step 3: Remover o seed de defaults (`prisma/seed.ts`)**

Remover o import e a chamada:

```ts
import { seedFunnelDefaults } from "./seed-funnel-defaults";
```

```ts
  await seedFunnelDefaults(prisma);
```

- [ ] **Step 4: Remover o script de seed e2e (`package.json`)**

Remover a entrada:

```json
    "db:seed-e2e": "tsx prisma/seed-e2e.ts",
```

- [ ] **Step 5: Rodar a suíte e2e**

```bash
npx playwright test
```

Esperado: só `contact.spec.ts` roda, e passa. Se o Playwright reclamar de browser faltando: `npx playwright install chromium`.

- [ ] **Step 6: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

Esperado: exit 0 em todos.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "RMV: remove os testes e o seed de e2e dos funis

playwright.config apontava globalSetup para um arquivo que semeava um
funil — deixar isso para tras quebraria o CI.

Sobra e2e/contact.spec.ts, que e justamente a prova de que o formulario de
contato continua de pe depois da remocao.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Migração do Prisma

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_remove_funnels/migration.sql` (gerada pelo Prisma)

**Interfaces:**
- Consumes: nenhum código referencia mais os models (Tasks 2–4).
- Produces: schema com **10 models** (16 − 6). Permanecem `AdminUser`, `Information`, `Project`, `Service`, `Client`, `Testimonial`, `TeamMember`, `Stat`, `Lead` e `LeadNotificationConfig` — `Service`, `Client`, `Stat`, `TeamMember` e `Project` saem só nos PRs 2–4 do spec.

- [ ] **Step 1: Remover os models e enums do schema**

Em `prisma/schema.prisma`, apagar a seção inteira sob o cabeçalho `// Funnels (link-shared conversational lead-capture quizzes)`, o que inclui:

- **Models:** `Funnel`, `FunnelEnding`, `FunnelQuestion`, `FunnelSubmission`, `FunnelDefaultTemplate`, `GoogleAccount`
- **Enums:** `FunnelType`, `FunnelStatus`, `FunnelOutcome`, `WhatsappStatus`, `FunnelQuestionKind`

⚠️ `LeadNotificationConfig` está **no meio dessa seção** no arquivo — ela **fica**. Mover a declaração dela para junto do bloco de `Lead`, sob o cabeçalho `// Leads`, onde ela pertence.

- [ ] **Step 2: Verificar que o banco local está de pé**

```bash
docker ps --filter "name=n8x-marketing-db" --format "{{.Status}}"
```

Esperado: `Up ... (healthy)`. Se não estiver: `docker compose up -d`.

- [ ] **Step 3: Gerar e aplicar a migração**

```bash
npx prisma migrate dev --name remove_funnels
```

Esperado: o Prisma cria `prisma/migrations/<timestamp>_remove_funnels/` e aplica. O SQL deve conter `DROP TABLE` para `funnels`, `funnel_endings`, `funnel_questions`, `funnel_submissions`, `funnel_default_templates` e `google_account`, mais os `DROP TYPE` dos enums.

⚠️ Se o Prisma pedir para **resetar** o banco, **pare**. Isso indica divergência entre o histórico de migrações e o banco. Resetar é destrutivo e exige consentimento explícito do dono do projeto — o Prisma tem uma trava própria para agentes.

- [ ] **Step 4: Conferir o SQL gerado**

```bash
cat prisma/migrations/*_remove_funnels/migration.sql
```

Confirmar que **não** há `DROP TABLE "leads"` nem `DROP TABLE "lead_notification_config"`.

- [ ] **Step 5: Conferir as tabelas restantes**

```bash
docker exec n8x-marketing-db psql -U agency -d agency -c "\dt"
```

Esperado: **11 tabelas** — as 10 de model mais `_prisma_migrations`. Nenhuma começando com `funnel`, e nenhuma `google_account`.

- [ ] **Step 6: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

Esperado: exit 0 em todos.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "RMV: dropa os models de funil e a conta do Google

Remove Funnel, FunnelEnding, FunnelQuestion, FunnelSubmission,
FunnelDefaultTemplate e GoogleAccount, mais os enums FunnelType,
FunnelStatus, FunnelOutcome, WhatsappStatus e FunnelQuestionKind.

LeadNotificationConfig estava declarada no meio da secao de funis e ficou:
movida para junto de Lead, que e quem a usa.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Limpar strings e comentários

Última camada: o que sobrou citando funil em texto.

**Files:**
- Modify: `src/messages/pt.json`, `src/lib/evolution.ts`, `src/lib/rate-limit.ts`, `src/lib/phone.ts`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `README.md`

**Interfaces:**
- Consumes: nada.
- Produces: `grep -ri funnel src/ prisma/ e2e/` retorna vazio.

- [ ] **Step 1: Remover o namespace `funnel` do catálogo**

Em `src/messages/pt.json`, remover a chave de topo `"funnel"` inteira e, dentro de `admin.nav`, a chave `"funnels": "Funis"`.

- [ ] **Step 2: Reescrever os comentários que citam funil**

Não há acoplamento de código nestes — só texto que ficaria mentindo:

- `src/lib/evolution.ts` (5 ocorrências): trocar as menções ao "funnel completion flow" pelo uso real, que passa a ser só a notificação de leads. Exemplo, na linha 25: `/** Default instance to send from when none is picked explicitly. */`
- `src/lib/rate-limit.ts` (linha 12): trocar "should never take the funnel down" por "should never take the form down".
- `src/lib/phone.ts` (linha 29): trocar "for funnel inputs" por "for form inputs".

- [ ] **Step 3: Atualizar a documentação**

- `AGENTS.md`: remover a seção "Funnels (inherited subsystem — scheduled for removal)" e a menção a funis em "Where things live" (o grupo de rota `(funnels)`).
- `docs/ARCHITECTURE.md`: remover as seções de funis e do Google Calendar.
- `README.md`: remover as menções a funis.

- [ ] **Step 4: Confirmar que não sobrou nada**

```bash
grep -rin "funnel" src/ prisma/ e2e/ test/ 2>/dev/null
grep -rin "google" src/lib/env.ts
```

Esperado: a primeira busca sem saída. A segunda também sem saída (Google Fonts e Google Maps não passam por `env.ts`).

- [ ] **Step 5: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

Esperado: exit 0 em todos. O build deve listar 42 páginas menos as de funil.

- [ ] **Step 6: Conferir o admin no navegador**

```bash
npm run start
```

Entrar em `/pt/admin/login` (`admin@example.com` / `changeme123`) e confirmar: o menu lateral não tem mais "Funis", a página de Contatos abre, e o link "Instâncias do WhatsApp" continua funcionando. Encerrar o servidor.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "RMV: limpa strings e docs dos funis

Remove o namespace funnel do catalogo e o item Funis do menu do admin.
Reescreve os comentarios de evolution.ts, rate-limit.ts e phone.ts, que
citavam o funil como consumidor — agora quem usa e a notificacao de leads
e o formulario de contato.

AGENTS.md, ARCHITECTURE.md e README deixam de descrever um subsistema que
nao existe mais.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Critérios de aceite do PR

- `npm run typecheck && npm run lint && npm run build` verde.
- `npm test` verde, com 3 arquivos de teste (`contact-form`, `phone`, `rate-limit`).
- `npx playwright test` verde, só com `contact.spec.ts`.
- `grep -rin "funnel" src/ prisma/ e2e/ test/` sem saída.
- Banco local com 10 models (11 tabelas contando `_prisma_migrations`).
- O formulário de contato envia e a configuração de notificação em `/admin/leads` continua acessível, com a tela de instâncias em `/admin/leads/whatsapp`.
- Nenhum `git push` — o dono do projeto envia manualmente.
