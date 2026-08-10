# Spec — Schema e admin do restaurante (Fases 3 e 4)

**Data:** 2026-08-10
**Fonte normativa:** [`docs/WHITELABEL-FOGAO-DE-OURO.md`](../../WHITELABEL-FOGAO-DE-OURO.md),
seção "FASE 4 — Adaptações de restaurante".
**Antecessor:** [`2026-08-07-whitelabel-fogao-de-ouro-design.md`](./2026-08-07-whitelabel-fogao-de-ouro-design.md)
(rebrand, Fases 1 e 2 — concluídas).
**Branch:** `Development`.

---

## 1. Objetivo

O rebrand tratou a camada de apresentação. As camadas de **dados** e de
**administração** continuam sendo as da n8x. Este spec as leva para o restaurante.

O sintoma que motivou o trabalho: as rotas públicas viraram `/gastronomia` e
`/galeria`, mas o admin ainda diz "Serviços" e "Portfólio", e os namespaces do
`pt.json` ainda são `about`, `portfolio` e `services`. A renomeação parou na
metade.

---

## 2. Estado na abertura do spec

| Camada | Estado |
|---|---|
| Apresentação (rotas, copy, marca, tema, SEO) | ✅ refeita |
| Dados (`schema.prisma`) | ❌ intacta da agência |
| Admin (rotas, labels, formulários) | ❌ intacta da agência |

Dois itens que o WHITELABEL previa para a Fase 4 **já saíram junto com o rebrand**
e não fazem parte deste trabalho:

- **Horário de funcionamento** — tipo `OpeningHours` em
  [`site.ts`](../../../src/config/site.ts), com nomes de dia no formato schema.org.
- **SEO local** — [`json-ld.tsx`](../../../src/components/json-ld.tsx) emite
  `Restaurant` com `servesCuisine`, `openingHoursSpecification`,
  `acceptsReservations` e `menu`, deliberadamente sem `priceRange`.

Banco local hoje: 16 models (17 tabelas, com a `_prisma_migrations` do Prisma),
carregados com conteúdo de demonstração da agência — 150 `informations`,
10 `projects`, 8 `services`, 13 `clients` e 2 `leads`.

---

## 3. Decisões

### 3.1 Cardápio com models próprios, sem preço

Os dois documentos carregados pelo `CLAUDE.md` se contradiziam:

- O **WHITELABEL** decidiu `MenuCategory` + `MenuItem` **com preço**.
- O **spec de 07/08** §3.6 descartou os dois models, argumentando que a diretriz
  "sem preços no site" removia a razão de existirem.

**Decisão: criar os models, sem campo de preço.** O argumento do spec de 07/08
confundiu duas coisas separadas — cardápio e preço. Um restaurante precisa de
pratos cadastráveis (nome, foto, descrição, categoria, disponibilidade); a
diretriz do cliente proíbe apenas publicar valores. Sem os models, `Service`
viraria "cardápio" na marra e o restaurante nunca teria pratos de verdade, só
seis blocos de marketing herdados da agência.

Consequência: **`Service` é aposentado**, não renomeado.

### 3.2 Só sobrevive o que o WHITELABEL mapeia

A tabela da Fase 4 do WHITELABEL define destino para quatro models —
`Information`, `Testimonial`, `TeamMember` e `Project` — e marca `Service` como
impróprio. **`Client` e `Stat` não aparecem em nenhum ponto do documento.**

**Decisão: `Client` e `Stat` são removidos.** Existem apenas por herança da
agência (a faixa de logos de clientes e os contadores animados). O cliente é
novo e o conteúdo será novo; carregar estruturas sem destino definido só
perpetua o fork.

### 3.3 Funis primeiro

A remoção dos funis (Fase 3) tira 5 models, 4 enums, uma seção inteira do admin e
todo o OAuth do Google. Refatorar o schema e o admin **antes** disso significaria
trabalhar num schema um terço maior e renomear telas que serão deletadas em
seguida.

**Decisão: Fase 3 abre o trabalho.**

### 3.4 O reset do banco é o último passo

O banco local precisa ser zerado — o site é novo. Mas resetar antes da
refatoração recria o schema da agência para apagá-lo em seguida.

**Decisão: reset depois do schema final e da reescrita dos seeds.**

### 3.5 `TeamMember` e `Project` também saem

O WHITELABEL mandava reaproveitar os dois — `TeamMember` para "Chef / equipe" e
`Project` para a galeria. **Decisão do dono do projeto: nenhum dos dois é
reaproveitado.**

`TeamMember` é remoção limpa: só a seção "Quem faz acontecer" da home o consome.
A decisão também dissolve a tensão que o spec de 07/08 havia registrado — o §7 do
PDF de copy proíbe rostos no site, então a seção nasceria sem poder ser
preenchida de qualquer forma.

`Project` não é limpo: sustenta 11 arquivos, incluindo a rota `/galeria` inteira.
Mas a `/galeria` **não está no menu** (a nav é Início · Experiência · Gastronomia
· Reservas · Contato) — é uma rota alcançável só por link direto.

### 3.6 A galeria ganha um model próprio

O §3.3 da copy do cliente prevê uma "Galeria do salão", ou seja, existe conteúdo
planejado para a página. Removê-la junto com `Project` deixaria esse conteúdo sem
onde morar.

**Decisão: `/galeria` sobrevive, alimentada por um model feito para foto** —
`GalleryPhoto`, com imagem, legenda, ordem e publicado. Sem `slug`, sem conteúdo
longo, sem página de detalhe.

`Project` carregava `clientName`, `year`, `summary`, `content`, `tags` e um
`[slug]` com página própria: estrutura de estudo de caso de agência. Uma foto do
salão não tem cliente, ano, nem texto de mil palavras. Reaproveitar significaria
manter seis campos mortos para usar dois.

### 3.7 As avaliações ficam, como prova social verificável

O restaurante tem **4,5★ e mais de 1.200 avaliações no Google**. Essa prova
social só alcança quem já está no Google — quem chega por link, Instagram ou
busca direta não vê nada. E o número solto ("4,5★") convence menos que alguém
dizendo que a picanha sai no ponto.

**Decisão: manter o model, reformado para o restaurante.**

| | Campo |
|---|---|
| **Sai** | `company`, `role` — cargo e empresa são de depoimento de agência; um cliente de almoço não tem "Diretor de Marketing, Empresa X" |
| **Fica** | `authorName`, `quote`, `rating`, `avatarUrl` |
| **Entra** | `source` ("Google"), `sourceUrl` (link para a avaliação real) |

`sourceUrl` é o que resolve o problema original. Um depoimento digitado no admin,
sem origem, ao lado de uma nota real, parece fabricado. Com o link, a citação
vira **verificável** — o visitante confere no Google. O trabalho vira curadoria
das melhores avaliações que já existem, não redação.

⚠️ **Fora do structured data.** As diretrizes do Google proíbem *self-serving
reviews*: marcar `aggregateRating` ou `Review` sobre o próprio negócio, no site
do próprio negócio. Exibir as citações na página é permitido; emiti-las no
JSON-LD do `Restaurant` arrisca penalidade de rich result. Aparecem na página,
ficam fora do schema.

### 3.8 `Information` fica, e a rota vira português

`Information` permanece como "Novidades", conforme o mapeamento do WHITELABEL.

`/informations` é hoje a **única rota pública com nome em inglês** — todas as
outras já foram traduzidas no rebrand, e o menu já exibe o label "Novidades".
**Decisão: a rota passa a `/novidades`.** Não há custo de SEO: o site ainda não
está no ar.

O conteúdo atual (150 artigos de SEO da agência) não é migrado.

---

## 4. Schema final

De **16 models para 8** — 11 removidos, 3 criados. Em tabelas, 17 → 9, contando a
`_prisma_migrations` interna do Prisma.

### 4.1 Novos

```prisma
/// Uma categoria do cardápio (entradas, pratos, sobremesas, bebidas).
model MenuCategory {
  id        String     @id @default(cuid())
  slug      String     @unique
  name      Json       // LocalizedText
  description Json     @default("{}")  // LocalizedText, opcional
  order     Int        @default(0)
  published Boolean    @default(true)
  items     MenuItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([published, order])
  @@map("menu_categories")
}

/// Um prato. SEM preço: a diretriz do cliente proíbe publicar valores, e o
/// buffet é por quilo — preço por prato não existe como conceito aqui.
model MenuItem {
  id          String       @id @default(cuid())
  slug        String       @unique
  categoryId  String
  category    MenuCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name        Json         // LocalizedText
  description Json         @default("{}")  // LocalizedText
  image       String       @default("")
  available   Boolean      @default(true)
  order       Int          @default(0)
  tags        String[]     @default([])    // "vegetariano", "picante", …
  /// "A Semana no Fogão": prato fixo de um dia útil. Null = item permanente.
  /// Evita um model dedicado só para os 5 pratos da semana.
  weekday     Int?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([categoryId, order])
  @@index([available, order])
  @@map("menu_items")
}
```

`weekday` usa `1`–`5` (segunda a sexta), coerente com o horário do restaurante.

```prisma
/// Uma foto da galeria (salão, fachada, ambiente, pratos). Substitui `Project`,
/// que era um estudo de caso de agência: uma foto não tem cliente, ano, resumo
/// nem página de detalhe.
model GalleryPhoto {
  id        String   @id @default(cuid())
  image     String
  caption   Json     @default("{}")  // LocalizedText, opcional
  order     Int      @default(0)
  published Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([published, order])
  @@map("gallery_photos")
}
```

### 4.2 Mantidos, com limpeza

| Model | Vira | Mudança |
|---|---|---|
| `Information` | Novidades | nenhuma no model; a rota vira `/novidades` (§3.8) |
| `Testimonial` | Avaliações | remove `company` e `role`; adiciona `source` e `sourceUrl` (§3.7) |
| `AdminUser` | — | nenhuma |
| `Lead` | Contatos | remove `role`, `portfolio`; enum `LeadType` perde `CAREER` |
| `LeadNotificationConfig` | — | nenhuma |

`Lead.company` **fica**: um lead corporativo de almoço pode informar a empresa.

### 4.3 Removidos

| Model | Motivo |
|---|---|
| `Service` | substituído pelo cardápio (§3.1) |
| `Client` | sem destino no WHITELABEL (§3.2) |
| `Stat` | sem destino no WHITELABEL (§3.2) |
| `TeamMember` | não reaproveitado (§3.5) |
| `Project` | substituído por `GalleryPhoto` (§3.6) |
| `Funnel`, `FunnelEnding`, `FunnelQuestion`, `FunnelSubmission`, `FunnelDefaultTemplate` | Fase 3 |
| `GoogleAccount` | usado exclusivamente pelos funis |

Enums removidos junto: `FunnelType`, `FunnelStatus`, `FunnelOutcome`,
`WhatsappStatus`, `FunnelQuestionKind`.

⚠️ **Não remover:** `Lead`, `LeadNotificationConfig`,
[`lib/evolution.ts`](../../../src/lib/evolution.ts) e
[`lib/lead-notify.ts`](../../../src/lib/lead-notify.ts) — o formulário de contato
depende deles.

---

## 5. Admin final

De 10 seções para 6, com rotas em português acompanhando o site público.

| Rota | Label | Model | Origem |
|---|---|---|---|
| `/admin` | Visão geral | — | mantida |
| `/admin/cardapio` | Cardápio | `MenuCategory` + `MenuItem` | **nova** |
| `/admin/galeria` | Galeria | `GalleryPhoto` | **nova** (substitui `/admin/projects`) |
| `/admin/novidades` | Novidades | `Information` | renomeia `/admin/informations` |
| `/admin/avaliacoes` | Avaliações | `Testimonial` | renomeia `/admin/testimonials` |
| `/admin/contatos` | Contatos | `Lead` | renomeia `/admin/leads` |

Saem: `/admin/services`, `/admin/clients`, `/admin/stats`, `/admin/team`,
`/admin/projects` e `/admin/funnels`.

O CRUD do cardápio segue **exatamente** o padrão dos recursos existentes: DAL em
[`lib/queries.ts`](../../../src/lib/queries.ts) com `unstable_cache` + tags,
`updateTag` nas escritas, validação `zod` no boundary, view-models — nunca
devolver linha crua do Prisma para o cliente.

O cardápio é o primeiro recurso com **relação pai/filho** no admin (categoria →
itens). O formulário de item precisa de um seletor de categoria; a listagem
agrupa por categoria e ordena por `order`.

---

## 6. Impacto no site público

| Onde | Mudança |
|---|---|
| Home | perde "Quem almoça com a gente" (`Client`), "O Fogão de Ouro em números" (`Stat`) e "Quem faz acontecer" (`TeamMember`) |
| Home | a seção de gastronomia passa a ler o cardápio; a prévia da galeria passa a ler `GalleryPhoto` |
| `/gastronomia` | passa a renderizar categorias + itens |
| `/gastronomia/[slug]` | **removida** — prato não tem página própria |
| `/galeria` | passa a ser uma grade de fotos |
| `/galeria/[slug]` | **removida** — foto não tem página própria |
| `/informations` | renomeada para **`/novidades`** (§3.8) |
| Avaliações | ganham origem e link para a avaliação real no Google (§3.7) |
| Header | o dropdown de "Nossa Gastronomia" passa a listar categorias do cardápio (hoje lista `Service`) |
| `sitemap.ts` | perde as entradas de `Service` e de `Project`; as de `Information` mudam de prefixo |
| `llms.txt` / `llms-full.txt` | perdem as entradas de `Project` |
| `pt.json` | namespaces `about` → `experiencia`, `portfolio` → `galeria`, `services` → `cardapio`, `informations` → `novidades` |

A home fica com: Hero · Cardápio · Galeria · Avaliações · CTA.

Seis lugares consomem `Service` hoje: `experiencia/page.tsx`,
`gastronomia/page.tsx`, `gastronomia/[slug]/page.tsx`, `(marketing)/layout.tsx`,
`sections/services.tsx` e `sitemap.ts`.

Onze consomem `Project`: os dois acima (`sitemap.ts`, `(marketing)/layout.tsx`),
mais `llms.txt/route.ts`, `llms-full.txt/route.ts`, `experiencia/page.tsx`,
`galeria/page.tsx`, `galeria/[slug]/page.tsx`, `(marketing)/page.tsx`,
`admin/(dashboard)/projects/[id]/page.tsx`, `components/project-card.tsx` e
`components/sections/portfolio-preview.tsx`.

`TeamMember` tem um consumidor só: `components/sections/team.tsx`.

---

## 7. Ordem de execução

| PR | Área | O quê |
|---|---|---|
| 1 | **RMV** | remover os funis (52 arquivos, 5 models, OAuth do Google, `e2e/funnel.spec.ts` e o seed de e2e) |
| 2 | **CRE** | `MenuCategory` + `MenuItem` + DAL + CRUD no admin + `/gastronomia` |
| 3 | **CRE** | `GalleryPhoto` + DAL + CRUD no admin + `/galeria` |
| 4 | **RMV** | remover `Service`, `Client`, `Stat`, `TeamMember`, `Project` e tudo que os consome |
| 5 | **UPD** | reformar `Testimonial` (§3.7) e limpar `Lead`/`CAREER` |
| 6 | **UPD** | renomear rotas e labels do admin, `/informations` → `/novidades` e os namespaces do `pt.json` |
| 7 | **UPD** | reescrever os seeds e zerar o banco |

Os PRs 2 e 3 **criam antes de destruir**: `/gastronomia` e `/galeria` passam a
ler os models novos enquanto os antigos ainda existem, e só o PR 4 os derruba.
Assim nenhum PR intermediário deixa uma rota pública quebrada.

Cada PR fecha com `npm run typecheck && npm run lint && npm run build` verde.

---

## 8. Riscos e armadilhas

1. **`e2e/funnel.spec.ts` e o seed de e2e** — o CI quebra se saírem do ar sem
   serem removidos junto (registrado no WHITELABEL, Fase 3).
2. **Migrações são destrutivas.** Dropar `services`, `clients`, `stats`,
   `team_members`, `projects` e as tabelas de funil apaga dados. É aceitável
   porque o banco de produção não existe ainda e o local será zerado de propósito
   — mas nenhuma dessas migrações pode rodar contra um banco com dados reais do
   cliente.
3. **`prisma migrate dev` só no Docker local.** Em produção é `migrate deploy`,
   que o build da Vercel já roda.
4. **Nunca editar migração já aplicada** (quebra de checksum).
5. **O reset do banco exige consentimento explícito** — o Prisma tem uma trava
   para agentes e recusa `migrate reset` sem ela.
6. **Renomear rota do admin são três edições acopladas**, como no site público:
   a pasta, o label em `pt.json` e a entrada em
   [`admin-nav.tsx`](../../../src/components/admin/admin-nav.tsx).
7. **Conteúdo novo, não migrado.** O cliente é novo: nada do conteúdo atual
   (artigos, projetos, logos) é aproveitado. Os seeds passam a criar apenas o
   admin e, no máximo, um esqueleto vazio de categorias.
8. **Avaliações fora do structured data.** O Google proíbe *self-serving
   reviews* — `aggregateRating`/`Review` sobre o próprio negócio no site dele.
   As citações aparecem na página, mas nunca no JSON-LD do `Restaurant`, sob
   pena de perder o rich result (§3.7).
9. **Números de prova social envelhecem.** A copy diz "mais de 1.200 avaliações"
   enquanto o Google já mostra 1,3 mil: a formulação aberta é proposital, porque
   subestima e continua verdadeira conforme o número cresce. Mesma lógica do
   `{years}`, que é calculado a partir de `foundedYear` em vez de escrito na
   copy — ver `fillYears()` em [`site.ts`](../../../src/config/site.ts).

---

## 9. Critérios de aceite

- `npm run typecheck && npm run lint && npm run build` verde em cada PR.
- `npm test` e o e2e verdes (sem resíduo de funil).
- Nenhuma string "n8x", "N8X" ou "Vannuchi" no site público **nem no admin**.
- Nenhum model, rota de admin ou namespace i18n com nome de agência.
- Banco final com 8 models e nenhum registro de demonstração.
- Cardápio cadastrável pelo admin e renderizado em `/gastronomia`.
- Galeria cadastrável pelo admin e renderizada em `/galeria`.
- `Lead`, `LeadNotificationConfig`, `evolution.ts` e `lead-notify.ts` intactos e
  o formulário de contato funcionando.
- Nenhum dado do cliente inventado — o que não veio continua pendente e visível.
