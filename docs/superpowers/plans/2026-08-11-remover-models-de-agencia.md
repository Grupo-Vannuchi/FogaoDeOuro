# Remoção dos models de agência — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remover `Service`, `Client`, `Stat`, `TeamMember` e `Project` — os cinco models que sobraram da agência e que já não alimentam nada no site.

**Architecture:** Remoção em camadas, cada tarefa terminando com o projeto compilando: primeiro as seções da home (a mudança visível), depois o admin inteiro dos cinco, depois a DAL e os componentes órfãos, então a migração do Prisma e por fim as strings e a documentação. Os PRs do cardápio e da galeria já migraram todos os consumidores públicos, então esta é a demolição do que ficou vazio.

**Tech Stack:** Next 16 (App Router + Turbopack), React 19 + React Compiler, Prisma 6 + PostgreSQL, next-intl (só `pt`), Vitest, Playwright.

## Global Constraints

- **Branch:** `Development`. **Nunca `git push`** — o dono do projeto envia manualmente.
- **Validação obrigatória** ao fim de cada tarefa: `npm run typecheck && npm run lint && npm run build && npm test`.
- **Banco local de pé**: `docker compose up -d` (container `n8x-marketing-db`, porta 5433).
- 🛑 **Nunca** rodar `prisma migrate reset`, nunca definir `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`, nunca aceitar prompt de reset. Se o Prisma pedir reset, **pare e reporte BLOCKED**.
- **Nunca editar migração já aplicada** (quebra de checksum).
- **Português apenas.** Toda string de UI em `src/messages/pt.json`; não existe `en.json`.
- Commits convencionais terminando com `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Prefixo do board: **RMV**.

## O que NÃO pode ser removido

- `Lead`, `LeadNotificationConfig`, `AdminUser`, `Information`, `Testimonial`, `MenuCategory`, `MenuItem`, `GalleryPhoto` — os oito models que ficam.
- `src/lib/evolution.ts`, `src/lib/lead-notify.ts`, `src/app/actions/whatsapp.ts`, o formulário de contato e o rate limit.
- ⚠️ **`src/components/service-regions.tsx` FICA.** O nome engana: apesar do "service", ele **não usa o model `Service`** — é um bloco de copy sobre as regiões atendidas, renderizado em `src/app/[locale]/(marketing)/informations/[slug]/page.tsx`. Deletá-lo quebra a página de artigos. Confirme com `grep -n "prisma\|getService" src/components/service-regions.tsx` antes de tocar nele: não há nenhuma.
- ⚠️ **`src/components/admin/lead-status-buttons.tsx` FICA.** Casa com buscas por "stat" por causa de "status"; é dos leads.
- ⚠️ **`src/components/sections/services.tsx` e `src/components/sections/portfolio-preview.tsx` FICAM.** Os nomes enganam: desde os PRs anteriores eles leem `getMenu` e `getGalleryPhotos`. A Task 5 os renomeia.

---

## Mapa de arquivos

**Deletados inteiros:**

```
src/app/[locale]/admin/(dashboard)/services/     3 arquivos
src/app/[locale]/admin/(dashboard)/projects/     3 arquivos
src/app/[locale]/admin/(dashboard)/clients/      3 arquivos
src/app/[locale]/admin/(dashboard)/stats/        3 arquivos
src/app/[locale]/admin/(dashboard)/team/         3 arquivos
src/app/actions/services.ts   projects.ts   clients.ts   stats.ts   team.ts
src/components/admin/service-form.tsx     service-delete-button.tsx
src/components/admin/project-form.tsx     project-delete-button.tsx
src/components/admin/client-form.tsx      client-delete-button.tsx
src/components/admin/stat-form.tsx        stat-delete-button.tsx
src/components/admin/team-form.tsx        team-delete-button.tsx
src/lib/service-form.ts  project-form.ts  client-form.ts  stat-form.ts  team-form.ts
src/lib/validations/service.ts  project.ts  client.ts  stat.ts  team.ts
src/components/service-card.tsx        (0 consumidores)
src/components/project-card.tsx        (0 consumidores)
src/components/sections/clients.tsx    stats.tsx    team.tsx
prisma/seed-services.ts  seed-projects.ts  seed-projects-content.ts  seed-clients.ts
```

**Editados:** `prisma/schema.prisma`, `src/lib/queries.ts`, `src/lib/admin-queries.ts`, `src/lib/cache.ts`, `src/components/admin/admin-nav.tsx`, `src/app/[locale]/(marketing)/page.tsx`, `src/app/[locale]/admin/(dashboard)/page.tsx`, `src/components/json-ld.tsx`, `src/messages/pt.json`, `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `SNAPSHOT.md`.

**Renomeados (Task 5):** `sections/services.tsx` → `sections/menu-preview.tsx`; `sections/portfolio-preview.tsx` → `sections/gallery-preview.tsx`.

---

### Task 1: Remover as seções da home

Três seções da home ainda leem os models da agência. São os **últimos consumidores públicos** deles — depois desta tarefa, `getClients`, `getStats` e `getTeam` ficam sem chamador.

**Files:**
- Delete: `src/components/sections/clients.tsx`, `src/components/sections/stats.tsx`, `src/components/sections/team.tsx`
- Modify: `src/app/[locale]/(marketing)/page.tsx`

**Interfaces:**
- Consumes: nada.
- Produces: a home passa a ser `Hero · Services(cardápio) · PortfolioPreview(galeria) · Testimonials · CTA`.

- [ ] **Step 1: Subir o banco**

```bash
docker compose up -d
docker ps --filter "name=n8x-marketing-db" --format "{{.Status}}"
```

- [ ] **Step 2: Apagar os três componentes**

```bash
git rm src/components/sections/clients.tsx src/components/sections/stats.tsx src/components/sections/team.tsx
```

- [ ] **Step 3: Tirar da home**

Em `src/app/[locale]/(marketing)/page.tsx`, remover os três imports (`Clients`, `Stats`, `Team`) e as três linhas do JSX (`<Clients />`, `<Stats locale={locale} />`, `<Team locale={locale} />`).

Ficam, nesta ordem: `<Hero />`, `<Services locale={locale} />`, `<PortfolioPreview locale={locale} />`, `<Testimonials locale={locale} />`, `<CTA />`.

⚠️ **Não** remova `<Services>` nem `<PortfolioPreview>`: os nomes são herdados, mas eles já leem o cardápio e a galeria.

- [ ] **Step 4: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

- [ ] **Step 5: Conferir a home no navegador**

```bash
npm run start
```

Abrir `http://localhost:3000/pt` e confirmar: some a faixa de logos, some a faixa de números, some a seção de equipe; ficam o hero, o cardápio, a galeria, as avaliações e o CTA. Encerrar o servidor.

⚠️ Se for usar script de navegador, **nunca** use `page.click('button[type="submit"]')` sem escopo — o painel admin tem botões "Sair" que casam com esse seletor. Mire pelo nome acessível.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "RMV: remove as secoes de agencia da home

Saem a faixa de logos de clientes, os contadores e a secao de equipe — tres
blocos que so faziam sentido para uma agencia. Eram os ultimos consumidores
publicos de Client, Stat e TeamMember.

A home fica: hero, cardapio, galeria, avaliacoes e CTA.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Remover o admin dos cinco recursos

Remoção atômica: `admin-nav.tsx`, `admin-queries.ts` e o dashboard são compartilhados pelos cinco, então dividir deixaria um estado que não compila.

**Files:**
- Delete: os cinco diretórios sob `src/app/[locale]/admin/(dashboard)/` (`services`, `projects`, `clients`, `stats`, `team`), as cinco server actions, os dez componentes de formulário/exclusão, os cinco `src/lib/*-form.ts` e os cinco `src/lib/validations/*.ts`
- Modify: `src/components/admin/admin-nav.tsx`, `src/lib/admin-queries.ts`, `src/app/[locale]/admin/(dashboard)/page.tsx`

**Interfaces:**
- Consumes: nada da Task 1.
- Produces: o admin fica com **Visão geral · Cardápio · Galeria · Novidades · Avaliações · Contatos**.

- [ ] **Step 1: Apagar os arquivos**

```bash
git rm -r "src/app/[locale]/admin/(dashboard)/services" \
          "src/app/[locale]/admin/(dashboard)/projects" \
          "src/app/[locale]/admin/(dashboard)/clients" \
          "src/app/[locale]/admin/(dashboard)/stats" \
          "src/app/[locale]/admin/(dashboard)/team"
git rm src/app/actions/services.ts src/app/actions/projects.ts \
       src/app/actions/clients.ts src/app/actions/stats.ts src/app/actions/team.ts
git rm src/components/admin/service-form.tsx src/components/admin/service-delete-button.tsx \
       src/components/admin/project-form.tsx src/components/admin/project-delete-button.tsx \
       src/components/admin/client-form.tsx src/components/admin/client-delete-button.tsx \
       src/components/admin/stat-form.tsx src/components/admin/stat-delete-button.tsx \
       src/components/admin/team-form.tsx src/components/admin/team-delete-button.tsx
git rm src/lib/service-form.ts src/lib/project-form.ts src/lib/client-form.ts \
       src/lib/stat-form.ts src/lib/team-form.ts
git rm src/lib/validations/service.ts src/lib/validations/project.ts \
       src/lib/validations/client.ts src/lib/validations/stat.ts src/lib/validations/team.ts
```

⚠️ **Não** apague `src/components/admin/lead-status-buttons.tsx` — apesar do "stat" em "status", ele é dos leads.

- [ ] **Step 2: Ver o typecheck quebrar**

```bash
npm run typecheck
```

Esperado: FALHA, com referências pendentes em `admin-nav.tsx`, `admin-queries.ts` e no dashboard. Essa lista é o roteiro dos próximos passos.

- [ ] **Step 3: Limpar o menu do admin**

Em `src/components/admin/admin-nav.tsx`, remover as cinco entradas da lista `items` (`projects`, `services`, `clients`, `testimonials` **não** — essa fica —, `team`, `stats`) e os ícones que ficarem sem uso no import de `lucide-react`.

A lista final, nesta ordem: `dashboard`, `cardapio`, `galeria`, `informations`, `testimonials`, `leads`.

- [ ] **Step 4: Limpar a DAL do admin**

Em `src/lib/admin-queries.ts`, remover `getAdminProjects`, `getProjectById`, `getAdminServices`, `getServiceById`, `getAdminClients`, `getClientById`, `getAdminTeam`, `getTeamMemberById`, `getAdminStats`, `getStatById`, e os tipos do Prisma que só elas importam (`Project`, `Service`, `Client`, `TeamMember`, `Stat`) na linha de import do `@prisma/client`.

- [ ] **Step 5: Consertar os contadores do dashboard**

`getDashboardStats` conta projetos e serviços publicados — dois models que estão saindo. Trocar por contagens que façam sentido para o restaurante.

Em `src/lib/admin-queries.ts`:

```ts
export type DashboardStats = {
  newLeads: number;
  totalMenuItems: number;
  totalGalleryPhotos: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [newLeads, totalMenuItems, totalGalleryPhotos] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.menuItem.count({ where: { available: true } }),
    prisma.galleryPhoto.count({ where: { published: true } }),
  ]);
  return { newLeads, totalMenuItems, totalGalleryPhotos };
}
```

Em `src/app/[locale]/admin/(dashboard)/page.tsx`, trocar os dois cartões que exibiam `stats.totalProjects` e `stats.totalServices` pelos novos campos, com ícones adequados (`UtensilsCrossed` e `Images`, os mesmos do menu lateral) e as chaves de tradução novas:

```tsx
    { label: t("totalMenuItems"), value: stats.totalMenuItems, icon: UtensilsCrossed },
    { label: t("totalGalleryPhotos"), value: stats.totalGalleryPhotos, icon: Images },
```

Em `src/messages/pt.json`, dentro de `admin.dashboard`, substituir `totalProjects` e `totalServices` por:

```json
      "totalMenuItems": "Pratos disponíveis",
      "totalGalleryPhotos": "Fotos publicadas",
```

- [ ] **Step 6: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

Esperado: exit 0. O build **não** deve listar nenhuma rota `/[locale]/admin/(services|projects|clients|stats|team)`.

- [ ] **Step 7: Conferir o admin no navegador**

```bash
npm run start
```

Entrar em `http://localhost:3000/pt/admin/login` (`admin@example.com` / `changeme123`) e confirmar: o menu lateral tem exatamente seis itens, e o dashboard mostra "Pratos disponíveis" e "Fotos publicadas" com números coerentes. Encerrar o servidor.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "RMV: remove o admin de servicos, portfolio, clientes, numeros e time

Cinco recursos que so existiam para a agencia. Removido de uma vez porque
admin-nav, admin-queries e o dashboard sao compartilhados pelos cinco:
dividir deixaria um commit que nao compila.

Os contadores do dashboard contavam projetos e servicos publicados. Passam a
contar pratos disponiveis e fotos publicadas — o conteudo que o restaurante
de fato administra.

O admin fica com: Visao geral, Cardapio, Galeria, Novidades, Avaliacoes e
Contatos.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Remover a DAL pública, os componentes órfãos e os seeds

**Files:**
- Delete: `src/components/service-card.tsx`, `src/components/project-card.tsx`, `prisma/seed-services.ts`, `prisma/seed-projects.ts`, `prisma/seed-projects-content.ts`, `prisma/seed-clients.ts`
- Modify: `src/lib/queries.ts`, `src/lib/cache.ts`, `src/components/json-ld.tsx`

**Interfaces:**
- Consumes: as Tasks 1 e 2 já removeram todos os chamadores.
- Produces: nenhum símbolo novo. Depois desta tarefa, `grep -rn "getServices\|getProjects\|getClients\|getStats\|getTeam\b" src/` retorna vazio.

- [ ] **Step 1: Apagar os órfãos e os seeds**

```bash
git rm src/components/service-card.tsx src/components/project-card.tsx
git rm prisma/seed-services.ts prisma/seed-projects.ts prisma/seed-projects-content.ts prisma/seed-clients.ts
```

Os dois componentes têm **zero** consumidores (confirme com `grep -rl "components/service-card\"\|components/project-card\"" src/` — deve não retornar nada). Os quatro seeds são scripts avulsos, não referenciados por `prisma/seed.ts`.

- [ ] **Step 2: Limpar a DAL pública**

Em `src/lib/queries.ts`, remover:

- os view-models `ServiceView`, `ServiceDetailView`, `ProjectView`, `ProjectDetailView`, `ClientView`, `StatView`, `TeamMemberView` (e quaisquer tipos auxiliares que só eles usem)
- as funções `getServices`, `getServiceBySlug`, `getServiceSlugs`, `getServiceSitemapEntries`, `getProjects`, `getProjectBySlug`, `getProjectSlugs`, `getProjectSitemapEntries`, `getClients`, `getStats`, `getTeam`

Manter tudo de `Information`, `Testimonial`, `MenuCategory`/`MenuItem` e `GalleryPhoto`, e o tipo `SitemapEntry` (ainda usado pelas informações).

- [ ] **Step 3: Limpar as tags de cache**

Em `src/lib/cache.ts`, remover as entradas `services`, `projects`, `clients`, `stats` e `team` do objeto `tags`. Manter `informations`, `testimonials`, `menu`, `gallery`, `whatsappInstances` e `whatsappGroups`.

- [ ] **Step 4: Remover o structured data órfão**

Em `src/components/json-ld.tsx`, remover `CreativeWorkJsonLd` (o schema.org de estudo de caso, que monta URLs `/galeria/<slug>` de uma rota que não existe mais) e qualquer helper que só ele use. Confirme antes que não há consumidor: `grep -rn "CreativeWorkJsonLd" src/`.

Se `ServiceJsonLd` ainda existir no arquivo, remova também — mesma situação.

- [ ] **Step 5: Confirmar que não sobrou nada**

```bash
grep -rn "getServices\|getProjects\|getClients\|getStats\|getTeam\b\|ServiceView\|ProjectView\|ClientView\|StatView\|TeamMemberView" src/
```

Esperado: **nenhuma saída**.

- [ ] **Step 6: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "RMV: remove a DAL, os componentes orfaos e os seeds de agencia

service-card e project-card ficaram sem consumidor quando /gastronomia e
/galeria passaram a ler o cardapio e as fotos. CreativeWorkJsonLd montava
URLs /galeria/<slug> de uma rota que nao existe mais.

Os quatro seeds eram scripts avulsos que populavam o conteudo de
demonstracao da agencia.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Migração do Prisma

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_remove_agency_models/migration.sql` (gerada pelo Prisma)

**Interfaces:**
- Consumes: nenhum código referencia mais os cinco models (Tasks 1–3).
- Produces: schema com **8 models** — `AdminUser`, `Information`, `Testimonial`, `MenuCategory`, `MenuItem`, `GalleryPhoto`, `Lead`, `LeadNotificationConfig`. Banco com **9 tabelas** contando `_prisma_migrations`.

- [ ] **Step 1: Remover os models do schema**

Em `prisma/schema.prisma`, apagar os models `Service`, `Project`, `Client`, `Stat` e `TeamMember`. Não há enums exclusivos deles.

Confirme que ficam exatamente oito `model` blocks.

- [ ] **Step 2: Confirmar o banco de pé**

```bash
docker ps --filter "name=n8x-marketing-db" --format "{{.Status}}"
```

- [ ] **Step 3: Gerar e aplicar a migração**

```bash
npx prisma migrate dev --name remove_agency_models
```

🛑 Se o Prisma pedir **reset**, **pare e reporte BLOCKED**. Este banco tem dados de trabalho (cardápio e galeria de teste) e a política do projeto proíbe reset sem consentimento explícito do humano.

⚠️ Este comando **apaga dados**: 150 artigos não — esses ficam —, mas 10 projetos, 8 serviços e 13 logos de cliente somem. Isso é intencional: é conteúdo de demonstração da agência anterior, e o próprio spec prevê a remoção.

- [ ] **Step 4: Conferir o SQL gerado**

```bash
cat prisma/migrations/*_remove_agency_models/migration.sql
```

Confirmar que dropa exatamente `services`, `projects`, `clients`, `stats` e `team_members` — e **nenhuma** outra tabela. Em particular, não pode aparecer `leads`, `informations`, `testimonials`, `menu_categories`, `menu_items`, `gallery_photos` nem `admin_users`.

- [ ] **Step 5: Conferir o banco**

```bash
docker exec n8x-marketing-db psql -U agency -d agency -c "\dt"
```

Esperado: **9 tabelas** — as 8 de model mais `_prisma_migrations`.

- [ ] **Step 6: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
npx playwright test
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "RMV: dropa Service, Project, Client, Stat e TeamMember

Os cinco models de agencia que sobraram. Nenhum codigo os referenciava mais
depois das tarefas anteriores.

A migracao apaga o conteudo de demonstracao da agencia anterior: 10
projetos, 8 servicos e 13 logos de cliente. Intencional — o spec preve
exatamente isso, e o conteudo do restaurante entra pelo admin.

Schema fica com 8 models: AdminUser, Information, Testimonial,
MenuCategory, MenuItem, GalleryPhoto, Lead e LeadNotificationConfig.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Renomear as seções e limpar strings e documentação

**Files:**
- Rename: `src/components/sections/services.tsx` → `src/components/sections/menu-preview.tsx`; `src/components/sections/portfolio-preview.tsx` → `src/components/sections/gallery-preview.tsx`
- Modify: `src/app/[locale]/(marketing)/page.tsx`, `src/messages/pt.json`, `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `SNAPSHOT.md`

**Interfaces:**
- Consumes: nada.
- Produces: `grep -rin "portfolio\|\bservice\b" src/components/sections/` não retorna mais nomes de arquivo enganosos.

- [ ] **Step 1: Renomear os dois componentes**

```bash
git mv src/components/sections/services.tsx src/components/sections/menu-preview.tsx
git mv src/components/sections/portfolio-preview.tsx src/components/sections/gallery-preview.tsx
```

Renomear também os componentes exportados: `Services` → `MenuPreview`, `PortfolioPreview` → `GalleryPreview`. Atualizar os imports e o JSX em `src/app/[locale]/(marketing)/page.tsx`.

Os nomes ficaram herdados desde que essas seções passaram a ler o cardápio e a galeria. Com os models `Service` e `Project` fora, um arquivo chamado `services.tsx` vira armadilha para a próxima pessoa.

⚠️ **Não** renomeie as chaves de tradução que eles usam (`home.services`, `home.portfolio`) — a renomeação de namespaces é o PR seguinte, e misturar as duas espalha o diff.

- [ ] **Step 2: Remover as chaves de tradução órfãs**

Em `src/messages/pt.json`, remover os namespaces e chaves que ficaram sem leitor:

- `home.clients`, `home.stats`, `home.team`
- `admin.projects`, `admin.services`, `admin.clients`, `admin.stats`, `admin.team` (namespaces inteiros)
- em `admin.nav`: `projects`, `services`, `clients`, `stats`, `team`

Depois de remover, confirme que o build passa — o catálogo é tipado, então uma chave removida que ainda tenha leitor quebra o typecheck na hora.

⚠️ **Não** remova `portfolio` nem `services` do nível superior (as chaves públicas): `services` ainda alimenta `/gastronomia` e `portfolio` ainda alimenta `/galeria`. A renomeação delas é o PR seguinte.

- [ ] **Step 3: Atualizar `AGENTS.md`**

Remover as menções aos cinco models. Em particular, a seção "Where things live" e qualquer frase que descreva o admin como tendo portfólio, serviços, clientes, time ou estatísticas. O admin agora tem seis seções: Visão geral, Cardápio, Galeria, Novidades, Avaliações e Contatos.

- [ ] **Step 4: Atualizar `README.md` e `docs/ARCHITECTURE.md`**

No `README.md`, a árvore de diretórios e a tabela "I want to change…" citam projetos, serviços e clientes. Em `docs/ARCHITECTURE.md`, a lista de models está desatualizada desde dois PRs atrás — deixe-a refletindo os oito models atuais.

- [ ] **Step 5: Atualizar `SNAPSHOT.md`**

Ele documenta os seeds `seed-services.ts`, `seed-projects.ts`, `seed-projects-content.ts` e `seed-clients.ts`, que a Task 3 apagou. Remover essas instruções.

Registrar também, onde ele descreve o restore, que **`prisma/backups/snapshot.sql` está desatualizado**: o dump é anterior às tabelas de cardápio e galeria, e `npm run db:restore` derruba e recria o banco — quem restaurar hoje perde as duas. Um `npm run db:dump` novo resolve, mas isso é decisão do dono do projeto, não desta tarefa.

- [ ] **Step 6: Confirmar que não sobrou referência**

```bash
grep -rin "seed-services\|seed-projects\|seed-clients" . --include=*.md --include=*.ts --include=*.json | grep -v node_modules | grep -v docs/superpowers
```

Esperado: **nenhuma saída**. (Os arquivos sob `docs/superpowers/` são o registro histórico e falam no passado — não os edite.)

- [ ] **Step 7: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
npx playwright test
```

- [ ] **Step 8: Conferir no navegador**

```bash
npm run start
```

Abrir `/pt` e o admin, e confirmar que nada quebrou com a renomeação. Encerrar o servidor.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "RMV: limpa strings, docs e nomes herdados dos models de agencia

Renomeia sections/services.tsx para menu-preview.tsx e
portfolio-preview.tsx para gallery-preview.tsx. Os nomes ficaram herdados
quando essas secoes passaram a ler o cardapio e a galeria; com Service e
Project fora, um arquivo chamado services.tsx vira armadilha.

Remove os namespaces de traducao sem leitor e atualiza AGENTS.md, README,
ARCHITECTURE e SNAPSHOT — o AGENTS.md e carregado em toda sessao, entao uma
descricao errada do admin ali desinforma todo trabalho futuro.

Registra no SNAPSHOT que o snapshot.sql versionado esta desatualizado: e
anterior as tabelas de cardapio e galeria, e o db:restore derruba e recria.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Critérios de aceite do PR

- `npm run typecheck && npm run lint && npm run build` verde.
- `npm test` verde (5 arquivos) e `npx playwright test` verde.
- `grep -rn "getServices\|getProjects\|getClients\|getStats\|getTeam\b" src/` sem saída.
- Schema com **8 models**; banco com **9 tabelas**.
- Admin com exatamente seis seções, e o dashboard contando pratos e fotos.
- Home com hero, cardápio, galeria, avaliações e CTA.
- `src/components/service-regions.tsx` e `src/components/admin/lead-status-buttons.tsx` **intactos**.
- O formulário de contato e a notificação de leads funcionando.
- Nenhum `git push`.
