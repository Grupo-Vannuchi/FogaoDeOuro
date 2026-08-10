# Contexto: white-label da n8x → Fogão de Ouro

Este repositório é um **fork do site da N8X Marketing** (uma agência) que vamos
transformar no site do nosso novo cliente: o **Fogão de Ouro**, um restaurante.

Os arquivos `.md` do repo (`AGENTS.md`, `CLAUDE.md`, `docs/ARCHITECTURE.md`,
`docs/RUNBOOK.md`) explicam como o projeto da **n8x** funciona — leia-os, mas
entenda que eles descrevem a **origem**, não o destino. Este documento descreve o
que muda para o novo cliente.

**Antes de começar, leia:** `AGENTS.md`, `docs/ARCHITECTURE.md` e
`node_modules/next/dist/docs/` (é Next 16 + Turbopack, não o Next do seu treinamento).

---

## O conceito

O projeto foi construído como **white-label**: quase todo o conteúdo (serviços,
projetos, depoimentos, equipe, textos institucionais, imagens) é cadastrado pelo
**painel admin** e vive no banco. O que precisa ser alterado **no código** é
basicamente identidade de marca e configuração.

**Regra geral:** se é conteúdo, entra pelo admin. Se é marca/identidade/config,
muda no código conforme a checklist abaixo. **Não reescreva a arquitetura.**

---

## Decisões já tomadas (não precisa perguntar)

1. **Site só em português.** Nada de bilíngue.
2. **Os funis foram removidos** (agosto de 2026) — feito depois do rebrand, como
   planejado.
3. **Cardápio terá models próprios** (`MenuCategory` + `MenuItem`).

---

## Ordem de execução

**Fase 1 — Rebrand** (itens 1 a 5): coloca o site do cliente de pé.
**Fase 2 — PT-only** (item 6).
**Fase 3 — Remoção dos funis** (item 7), num PR dedicado. ✅ **Concluída em
agosto de 2026.**
**Fase 4 — Adaptações de restaurante** (cardápio, horário, SEO local).

Proponha um plano antes de cada fase e valide com o dono do projeto.

---

## FASE 1 — Rebrand

### 1. Identidade e marca — `src/config/site.ts`

Fonte única de verdade da marca. Trocar **todos** os campos:

- `name`, `legalName`, `foundedYear`, `registration` (CNPJ do restaurante)
- `parentOrganization` → **remover** (era o Grupo Vannuchi, empresa-mãe da n8x;
  não se aplica ao cliente) — a menos que o restaurante pertença a um grupo
- `contact.email`, `contact.phone`, `contact.whatsapp.{number,display,defaultMessage}`
  — a mensagem padrão do WhatsApp deve virar algo de restaurante
  (ex.: reserva/pedido), não "saber mais sobre os serviços"
- `contact.address` → endereço real (o mapa do rodapé é gerado a partir dele,
  keyless — não precisa de API key)
- `social` → Instagram/Facebook do restaurante (remover LinkedIn/TikTok se não tiver)
- `author` → autor padrão dos artigos (E-E-A-T). Trocar ou remover
- `theme.light` / `theme.dark` → paleta do restaurante (hoje é navy `#0B0050` +
  âmbar da n8x)
- `nav` → **atenção:** as chaves são um tipo TS (`NavKey`). Mudar a navegação
  (ex.: "Cardápio" no lugar de "Portfólio") exige editar o **type `NavKey`**, as
  chaves em `src/messages/pt.json` → `nav`, e as **pastas de rota** em
  `src/app/[locale]/(marketing)/`

### 2. Textos — `src/messages/pt.json`

Catálogo de UI (~838 linhas). Todo texto de interface está aqui: home, sobre,
serviços, contato, rodapé, admin, mensagens de validação.

### 3. Imagens e ícones

- `public/hero/slide-1.webp`, `slide-2.webp`, `slide-3.webp` → carrossel do hero
  (referenciados em `src/components/sections/hero.tsx`). **Mantenha WebP e
  tamanho parecido** — o slide 1 é o LCP da home; imagem pesada derruba a performance
- ~~`public/n8x-logo.png` / `public/n8x-logo-dark.png`~~ → **feito.** Os arquivos
  da n8x saíram e a marca do cliente vive em `public/brand/` (wordmark, lockup
  claro/escuro, símbolo, e os PNG que as rotas de imagem embutem). O README de lá
  explica como cada corte foi obtido do original — leia antes de mexer
- `src/app/favicon.ico` → não existe e não é necessário: `src/app/icon.tsx` cobre
  os navegadores atuais
- `src/app/[locale]/opengraph-image.tsx` → imagem de compartilhamento (WhatsApp,
  redes). Hoje é o lockup sobre o grafite; **quando as fotos chegarem**, virar
  um prato real com a marca por cima — converte muito mais numa prévia de WhatsApp

### 4. Documentos legais — `src/content/legal.ts` ⚠️ crítico e fácil de esquecer

Política de Privacidade e Termos de Uso **com os dados da n8x hardcoded**: CNPJ,
razão social, cidade (Santos/SP) e o e-mail do encarregado de dados. Isso é
**LGPD** — precisa refletir o **Fogão de Ouro**, não a n8x. Não é editável pelo admin.

### 5. Infra e variáveis de ambiente — `src/lib/env.ts` define o contrato

Novo projeto no Supabase + deploy na Vercel:

- `DATABASE_URL` → pooler do Supabase (porta **6543**, `?pgbouncer=true`).
  **Não** force `connection_limit=1` (quebra o prerender das páginas estáticas)
- `DIRECT_URL` → porta **5432**, só para migrações
- `SUPABASE_URL` + `SUPABASE_SECRET_KEY` → uploads de imagem do admin
- **Criar o bucket público `media`** no Storage do novo projeto Supabase
  (Storage → New bucket) — sem ele, o upload de imagens do admin falha
- Manter a **Data API do Supabase desabilitada** (o app fala direto via Prisma,
  não usa RLS)
- `SESSION_SECRET` → **gerar um novo** (não reaproveitar o da n8x)
- `NEXT_PUBLIC_SITE_URL` → domínio do restaurante (alimenta canonical, sitemap,
  robots, OG)
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` → Upstash (rate limit dos formulários
  públicos; tem fallback em memória, mas em produção configure)
- `EVOLUTION_*` → WhatsApp, **manter** (ver abaixo)
- `GOOGLE_*` → some junto com os funis na Fase 3
- Configurar tudo na Vercel **antes** do primeiro deploy (o build já roda
  `prisma migrate deploy` sozinho)

**WhatsApp (Evolution) — manter.** Além dos funis, ele é usado pela
**notificação de leads** (`src/lib/lead-notify.ts`): quem preenche o formulário
de contato cai num grupo de WhatsApp. Útil para o restaurante. Precisa de uma
**instância nova** e configurar o grupo em `/admin/leads`.

**Segurança — usuário admin** ⚠️ `prisma/seed.ts` cria o admin com a senha padrão
**`changeme123`** quando `SEED_ADMIN_PASSWORD` não está definida. **Nunca** suba
para produção com essa senha. Use `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD`, ou
o script `npm run db:set-admin` (lê `ADMIN_EMAIL`/`ADMIN_PASSWORD` do ambiente).

---

## FASE 2 — Só português

O site é bilíngue hoje; o cliente não precisa de inglês.

- `src/i18n/routing.ts` → `locales = ["pt"] as const` (some a rota `/en` e o hreflang)
- Apagar `src/messages/en.json` (o catálogo é carregado dinamicamente por locale
  em `src/i18n/request.ts`, então nada mais o referencia)
- Remover o seletor de idioma: `src/components/layout/locale-switcher.tsx` e seu
  uso em `src/components/layout/header.tsx`, mais a chave `localeSwitcher` do
  catálogo
- Em `src/content/legal.ts`, manter só o bloco `pt`
- **`LocalizedText` é `Record<Locale, string>`** — ao reduzir os locales, o
  `npm run typecheck` aponta sozinho todo lugar que ainda espera texto em inglês
  (formulários do admin, seeds, testes). Siga os erros do typecheck até zerar.

---

## FASE 3 — Remover os funis ✅ concluída (agosto de 2026)

O subsistema de funis (quiz conversacional com agendamento) e a integração
OAuth do Google Calendar, que só ele usava, foram removidos por inteiro —
rotas, admin, models Prisma, server actions, componentes, testes e2e e o
namespace i18n. O que é compartilhado com o formulário de contato (`Lead`,
`LeadNotificationConfig`, `src/lib/evolution.ts`, `src/lib/lead-notify.ts`) foi
mantido, como planejado.

Veja o que foi de fato executado em
[`docs/superpowers/plans/2026-08-10-remover-funis.md`](superpowers/plans/2026-08-10-remover-funis.md).

---

## FASE 4 — Adaptações de restaurante

O schema atual é de agência. Mapeamento:

| Hoje (agência) | Vira (restaurante) | Como |
|---|---|---|
| `Information` (artigos) | Novidades / blog | reaproveita direto |
| `Testimonial` | Avaliações de clientes | reaproveita direto |
| `TeamMember` | Chef / equipe | reaproveita direto |
| `Project` / portfólio | Galeria (pratos, ambiente) | reaproveita, muda a copy |
| `Service` | ❌ não serve para cardápio | não tem preço |

### Cardápio — models próprios

Criar `MenuCategory` (entradas, pratos, sobremesas, bebidas — com ordem) e
`MenuItem` (nome, descrição, **preço**, foto, disponibilidade, ordem, tags do
tipo vegetariano/picante), com CRUD no admin seguindo **exatamente** o padrão dos
recursos existentes (DAL em `src/lib/queries.ts` com `unstable_cache` + tags,
`updateTag` nas escritas, validação `zod`, view-models — nunca devolver linha
crua do Prisma para o cliente).

### Horário de funcionamento

Não existe no projeto e é essencial para restaurante (site + structured data).
Provavelmente precisa ser criado (config ou model, avalie).

### SEO local

Hoje o structured data emite `Organization` (agência). Para restaurante, o
schema.org correto é **`Restaurant`**, com `servesCuisine`, `menu`, `priceRange`,
`openingHoursSpecification`, `acceptsReservations` e `address`. É o que faz o
Google exibir horário, faixa de preço e avaliações na busca. Ganho real.

---

## Regras de trabalho

- **Valide sempre** antes de dizer que terminou:
  `npm run typecheck && npm run lint && npm run build`. Reporte falhas honestamente.
- **Nunca** commite sem pedir autorização. O `git push` é feito manualmente.
- Este repo é um **fork** — confirme que os remotes apontam para o repositório do
  cliente e **não** abra PR no repositório original da n8x por engano.
- Nenhum segredo no cliente. Sem `NEXT_PUBLIC_*` para chaves.
- Ao mexer em banco, React, segurança ou Next.js, use as skills correspondentes
  (`prisma-patterns`, `react-patterns`, `security-review`, `nextjs-turbopack`).
- Atualize `AGENTS.md`, `CLAUDE.md`, `README` e `docs/` para descreverem o **Fogão
  de Ouro**. Hoje descrevem a n8x — o que confunde qualquer agente nas próximas
  sessões (inclusive você).

---

## Dados do cliente — PREENCHER (não invente nenhum)

- [ ] Nome fantasia e razão social
- [ ] CNPJ
- [ ] Endereço completo
- [ ] Telefone e WhatsApp (com DDI/DDD)
- [ ] E-mail de contato **e** e-mail do encarregado de dados (LGPD)
- [ ] Instagram / Facebook
- [ ] Ano de fundação
- [ ] Horário de funcionamento
- [ ] Domínio final do site
- [x] Logo — entregue em 10/08/2026 (`docs/Logos-fogao_de_Ouro/`; os cortes em uso
      estão em `public/brand/`, com o porquê de cada um no README de lá)
- [ ] As 3 fotos do hero
- [ ] Paleta de cores da marca
- [ ] Cardápio (categorias, itens, preços, fotos)

Comece confirmando quais desses dados já tem em mãos, depois proponha o plano da
Fase 1.
