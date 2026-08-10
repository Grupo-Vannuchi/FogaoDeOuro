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

### 3.5 Tensão registrada — `TeamMember`

O WHITELABEL manda reaproveitar `TeamMember` para "Chef / equipe". O spec de
07/08 anotou que o §7 do PDF de copy do cliente **proíbe rostos no site**.

**Decisão: seguir o WHITELABEL — o model fica.** Registrado aqui porque, se a
diretriz de rostos valer, a seção nasce sem poder ser preenchida. Confirmar com o
cliente antes de investir em copy para ela.

---

## 4. Schema final

De **16 models para 9** — 9 removidos, 2 criados. Em tabelas, 17 → 10, contando a
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

### 4.2 Mantidos, com limpeza

| Model | Vira | Mudança |
|---|---|---|
| `Information` | Novidades / blog | nenhuma |
| `Testimonial` | Avaliações | remove `company` |
| `TeamMember` | Chef / equipe | nenhuma |
| `Project` | Galeria | remove `clientName`, `year` |
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
| `/admin/galeria` | Galeria | `Project` | renomeia `/admin/projects` |
| `/admin/novidades` | Novidades | `Information` | renomeia `/admin/informations` |
| `/admin/avaliacoes` | Avaliações | `Testimonial` | renomeia `/admin/testimonials` |
| `/admin/equipe` | Equipe | `TeamMember` | renomeia `/admin/team` |
| `/admin/contatos` | Contatos | `Lead` | renomeia `/admin/leads` |

Saem: `/admin/services`, `/admin/clients`, `/admin/stats`, `/admin/funnels`.

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
| Home | perde "Quem almoça com a gente" (`Client`) e "O Fogão de Ouro em números" (`Stat`) |
| Home | a seção de gastronomia passa a ler o cardápio |
| `/gastronomia` | passa a renderizar categorias + itens |
| `/gastronomia/[slug]` | **removida** — prato não tem página própria |
| Header | o dropdown de "Nossa Gastronomia" passa a listar categorias do cardápio (hoje lista `Service`) |
| `sitemap.ts` | perde as entradas de `Service` |
| `pt.json` | namespaces `about` → `experiencia`, `portfolio` → `galeria`, `services` → `cardapio` |

Seis lugares consomem `Service` hoje: `experiencia/page.tsx`,
`gastronomia/page.tsx`, `gastronomia/[slug]/page.tsx`, `(marketing)/layout.tsx`,
`sections/services.tsx` e `sitemap.ts`.

---

## 7. Ordem de execução

| PR | Área | O quê |
|---|---|---|
| 1 | **RMV** | remover os funis (52 arquivos, 5 models, OAuth do Google, `e2e/funnel.spec.ts` e o seed de e2e) |
| 2 | **CRE** | `MenuCategory` + `MenuItem` + DAL + CRUD no admin + `/gastronomia` |
| 3 | **RMV** | remover `Service`, `Client`, `Stat` e as seções que os consomem |
| 4 | **UPD** | limpar campos de agência (`Project`, `Testimonial`, `Lead`/`CAREER`) |
| 5 | **UPD** | renomear rotas e labels do admin + namespaces do `pt.json` |
| 6 | **UPD** | reescrever os seeds e zerar o banco |

Cada PR fecha com `npm run typecheck && npm run lint && npm run build` verde.

---

## 8. Riscos e armadilhas

1. **`e2e/funnel.spec.ts` e o seed de e2e** — o CI quebra se saírem do ar sem
   serem removidos junto (registrado no WHITELABEL, Fase 3).
2. **Migrações são destrutivas.** Dropar `services`, `clients`, `stats` e as
   tabelas de funil apaga dados. É aceitável porque o banco de produção não
   existe ainda e o local será zerado de propósito — mas nenhuma dessas migrações
   pode rodar contra um banco com dados reais do cliente.
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

---

## 9. Critérios de aceite

- `npm run typecheck && npm run lint && npm run build` verde em cada PR.
- `npm test` e o e2e verdes (sem resíduo de funil).
- Nenhuma string "n8x", "N8X" ou "Vannuchi" no site público **nem no admin**.
- Nenhum model, rota de admin ou namespace i18n com nome de agência.
- Banco final com 9 models e nenhum registro de demonstração.
- Cardápio cadastrável pelo admin e renderizado em `/gastronomia`.
- `Lead`, `LeadNotificationConfig`, `evolution.ts` e `lead-notify.ts` intactos e
  o formulário de contato funcionando.
- Nenhum dado do cliente inventado — o que não veio continua pendente e visível.
