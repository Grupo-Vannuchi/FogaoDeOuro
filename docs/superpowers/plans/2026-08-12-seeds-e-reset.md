# Seeds do restaurante e reset do banco — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apagar o último conteúdo da agência — 612 linhas de seed de SEO e o banco carregado com ele — e deixar um ponto de restauração honesto para o restaurante.

**Architecture:** Este é o **último PR** da série de refatoração. Os seis anteriores mudaram código; este muda **dado**. É a única tarefa da série que destrói informação, e por isso é a única que depende de uma autorização explícita — que foi dada (ver abaixo).

O reset tem um efeito colateral valioso: recriar o banco do zero faz o Prisma **reaplicar as 22 migrações numa base vazia**. Isso nunca aconteceu neste repo — as migrações sempre foram aplicadas incrementalmente sobre um banco com dados. É exatamente o que o build da Vercel vai fazer no primeiro deploy. Se a cadeia tiver um defeito, é aqui que ele aparece, e não em produção.

**Tech Stack:** Prisma 6 + PostgreSQL (Docker, container `n8x-marketing-db`, porta 5433), Next 16, tsx.

## ⚠️ Autorização do dono do projeto

O dono **autorizou explicitamente o reset do banco local em 12/08/2026**, ciente de que apaga:

| Tabela | Linhas |
|---|---|
| `informations` | 150 (SEO da agência) |
| `menu_categories` | 6 |
| `menu_items` | 22 |
| `gallery_photos` | 3 (placeholders `picsum.photos`) |
| `testimonials` | 1 |
| `leads` | 19 |
| `admin_users` | 1 (recriado pelo seed) |

Ele **recusou** o dump de pré-reset quando oferecido. Não faça um "por precaução" — a decisão é dele e já foi tomada.

Não existe banco de produção. Nenhum deploy foi feito. O escopo é o Docker local.

## Global Constraints

- **Branch:** `Development`. **Nunca `git push`** — o dono do projeto envia manualmente.
- **Validação obrigatória** ao fim de cada tarefa: `npm run typecheck && npm run lint && npm run build && npm test`.
- 🛑 **Nunca rode `prisma migrate reset`**, nunca defina `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`, nunca aceite um prompt de reset. Existe uma trava do Prisma contra agentes e ela **não deve ser contornada**. O caminho autorizado deste plano é `DROP SCHEMA public CASCADE` via `psql` — explícito sobre o que faz, e sem prompt interativo.
- **Nunca edite uma migração já aplicada** (quebra de checksum). Este PR não cria nem edita migração nenhuma — só as **reaplica**.
- **Português apenas.** Nenhum `en` sobrevive neste PR.
- Commits convencionais terminando com `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

## Decisão de escopo: o seed cria só o admin

**Decisão do dono.** Depois do reset, o banco fica com **um usuário administrador e nada mais**. Cardápio, galeria, avaliações e novidades são cadastrados pelo painel.

O `seed.ts` atual já documenta essa intenção — *"No demo cardápio, galeria or testimonials are seeded — those are managed entirely via the admin CMS"* — mas contradiz a si mesmo semeando 150 artigos de marketing.

O site vazio **não fica quebrado**: as mensagens de estado vazio já existem no catálogo, escritas nos PRs 2 e 3 (`gastronomia.empty`, `galeria.empty`, `novidades.empty`). Confirme que aparecem.

---

## Mapa de arquivos

| Arquivo | O quê |
|---|---|
| `prisma/seed-informations.ts` | **apagado** (612 linhas de SEO da agência, ainda bilíngue) |
| `prisma/seed.ts` | reescrito: só o admin |
| `prisma/backups/snapshot.sql` | **regerado** do banco zerado |
| `SNAPSHOT.md` | reescrito — descreve dado da agência que deixa de existir |
| `docs/RUNBOOK.md`, `README.md`, `CONTRIBUTING.md`, `AGENTS.md` | trechos sobre seed/snapshot |
| spec §7 | marcar o PR 7 |

**Intocado:** `prisma/schema.prisma`, `prisma/migrations/**` (reaplicadas, nunca editadas), `prisma/set-admin.ts`, todo o `src/`.

---

### Task 1: Os seeds param de semear a agência

**Files:**
- Delete: `prisma/seed-informations.ts`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Confirmar que nada mais importa o arquivo**

```bash
grep -rn "seed-informations\|buildInformations" --include=*.ts --include=*.json . | grep -v node_modules
```

O esperado é **só** `prisma/seed.ts`. Se aparecer um teste ou script, pare e reporte — o plano estaria errado.

- [ ] **Step 2: Apagar**

```bash
git rm prisma/seed-informations.ts
```

- [ ] **Step 3: Reescrever `prisma/seed.ts`**

Fica só `seedAdmin()`. Remova o import, o laço de `upsert` das informações e o `console.log` da contagem.

O comentário que hoje diz *"No demo cardápio, galeria or testimonials are seeded"* passa a ser verdade — reescreva-o para dizer o que o seed faz agora e **por quê**: o conteúdo é do restaurante e entra pelo painel; um seed de demonstração viraria conteúdo inventado no site do cliente.

⚠️ **Reforce a armadilha da senha.** O seed cai para `changeme123` quando `SEED_ADMIN_PASSWORD` não está definida. Deixe isso explícito no arquivo, apontando para `npm run db:set-admin`. Não mude o comportamento — só torne o risco impossível de não ver.

**Correção ao próprio plano, feita durante a Task 1:** uma versão anterior deste documento afirmava que o seed roda no build da Vercel. **É falso.** O `vercel.json` tem `buildCommand: "npx prisma migrate deploy && next build"` — o seed nunca é invocado, e o `migrate deploy` não semeia sozinho. O risco continua real, mas o gatilho é outro: alguém rodando `npm run db:seed` à mão contra produção. Não repita a afirmação errada.

- [ ] **Step 4: Validar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

Ainda **não** rode o seed — o banco ainda tem os dados velhos e a Task 2 é que o zera.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts
git commit -m "RMV: o seed para de semear o catalogo de SEO da agencia

612 linhas de conteudo de marketing digital, ainda bilingue, para um
restaurante que nao usa nada disso. O seed passa a criar so o admin: o
conteudo do restaurante entra pelo painel.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Zerar o banco e reaplicar as 22 migrações do zero

Esta é a tarefa destrutiva. **Autorizada** — ver o topo deste plano.

**Files:** nenhum. É uma operação de banco.

- [ ] **Step 1: Registrar o estado que será apagado**

Antes de qualquer coisa, rode e **cole a saída no relatório**:

```bash
docker exec n8x-marketing-db psql -U agency -d agency -c "
SELECT 'informations' t, count(*) FROM informations
UNION ALL SELECT 'menu_categories', count(*) FROM menu_categories
UNION ALL SELECT 'menu_items', count(*) FROM menu_items
UNION ALL SELECT 'gallery_photos', count(*) FROM gallery_photos
UNION ALL SELECT 'testimonials', count(*) FROM testimonials
UNION ALL SELECT 'leads', count(*) FROM leads
UNION ALL SELECT 'admin_users', count(*) FROM admin_users;"
```

É o registro do que existia. Depois do próximo passo, essa informação não existe mais em lugar nenhum.

- [ ] **Step 2: Derrubar o schema**

🛑 **Não use `prisma migrate reset`.**

```bash
docker exec n8x-marketing-db psql -U agency -d agency -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

Isso apaga as tabelas **e** a `_prisma_migrations`, que é o ponto: a próxima etapa reaplica a cadeia inteira como se o banco nunca tivesse existido.

- [ ] **Step 3: Reaplicar as migrações**

```bash
npx prisma migrate deploy
```

**Esta é a parte que nunca foi testada neste repo.** As 22 migrações sempre foram aplicadas incrementalmente, sobre um banco com dados. Agora rodam do zero, que é o que o build da Vercel faz no primeiro deploy.

Se **qualquer** migração falhar, **pare e reporte BLOCKED** com a saída completa. Não tente consertar editando uma migração — é quebra de checksum e um problema muito maior que este PR. Uma falha aqui é um achado valioso, não um fracasso da tarefa.

```bash
npx prisma migrate status
```

Deve dizer que está em dia. Cole a saída.

- [ ] **Step 4: Semear**

```bash
npm run db:seed
```

- [ ] **Step 5: Conferir o resultado**

```bash
docker exec n8x-marketing-db psql -U agency -d agency -c "\dt"
```

Esperado: **9 tabelas** — as 8 do schema mais a `_prisma_migrations`.

E as contagens, todas zero exceto `admin_users` = 1:

```bash
docker exec n8x-marketing-db psql -U agency -d agency -c "
SELECT 'informations' t, count(*) FROM informations
UNION ALL SELECT 'menu_categories', count(*) FROM menu_categories
UNION ALL SELECT 'menu_items', count(*) FROM menu_items
UNION ALL SELECT 'gallery_photos', count(*) FROM gallery_photos
UNION ALL SELECT 'testimonials', count(*) FROM testimonials
UNION ALL SELECT 'leads', count(*) FROM leads
UNION ALL SELECT 'admin_users', count(*) FROM admin_users;"
```

- [ ] **Step 6: O site vazio precisa estar íntegro, não quebrado**

```bash
npm run build
```

O `build` prerenderiza lendo o banco — **agora vazio**. Ele precisa passar. Uma página que quebra sem conteúdo é um bug real, e este é o único momento em que ele apareceria.

Suba o servidor (mate a 3000 antes) e confira:

- `/pt` — 200, sem seção quebrada
- `/pt/gastronomia` — 200 e exibe a mensagem de vazio (`gastronomia.empty`)
- `/pt/galeria` — 200 e exibe `galeria.empty`
- `/pt/novidades` — 200 e exibe `novidades.empty`
- `/pt/experiencia`, `/pt/reservas`, `/pt/contato`, `/pt/privacy`, `/pt/terms` — 200
- `MISSING_MESSAGE` = 0 em todas
- `sitemap.xml` — deve responder e **não** listar artigo nenhum
- `/pt/admin/login` — 200, e o login com `admin@example.com` / `changeme123` funciona

⚠️ **Ao automatizar o login, mire o botão pelo nome acessível ("Entrar"), nunca `button[type="submit"]`** — o shell do admin tem um botão "Sair" que também é submit, e clicar nele parece exatamente uma sessão perdida. Já causou um diagnóstico errado neste projeto.

Confira também que cada seção do admin abre com a lista vazia, sem erro.

- [ ] **Step 7: Sem commit**

Esta tarefa não muda arquivo nenhum. Reporte e siga.

---

### Task 3: Regerar o ponto de restauração

O `prisma/backups/snapshot.sql` é de 07/08 e descreve um schema que já não existe: declara `CAREER`, `leads.portfolio` e `testimonials.company/role`. Restaurar dele hoje produz um banco que o `migrate deploy` não reconcilia. Ele não é atualizável — precisa ser **regerado**.

**Files:**
- Modify: `prisma/backups/snapshot.sql` (regerado, não editado à mão)

- [ ] **Step 1: Gerar**

```bash
npm run db:dump
```

- [ ] **Step 2: Conferir o que saiu**

O arquivo deve ter encolhido drasticamente (o antigo tem ~290 KB de conteúdo da agência). Confirme que **não** contém os resíduos do schema velho:

```bash
grep -c "CAREER\|portfolio\|company" prisma/backups/snapshot.sql
grep -c "CREATE TABLE" prisma/backups/snapshot.sql
```

O primeiro deve ser 0. O segundo, 9.

- [ ] **Step 3: Provar que o snapshot restaura de verdade**

Um backup não conferido não é um backup. Derrube e restaure:

```bash
docker exec n8x-marketing-db psql -U agency -d agency -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:restore
npx prisma migrate status
```

O `migrate status` precisa dizer **em dia** — é isso que prova que o dump carrega a `_prisma_migrations` coerente, que é justamente o que o snapshot antigo não fazia.

Confirme de novo as 9 tabelas e o admin. Depois rode `npm run build` mais uma vez.

- [ ] **Step 4: Commit**

```bash
git add prisma/backups/snapshot.sql
git commit -m "UPD: snapshot regerado a partir do banco zerado

O anterior era de 07/08 e declarava CAREER, leads.portfolio e
testimonials.company/role — colunas que tres PRs de schema depois nao
existem mais. Restaurar dele produzia um estado que o migrate deploy nao
reconcilia. Conferido restaurando por cima de um schema derrubado.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Documentação

**Files:**
- Modify: `SNAPSHOT.md`, `docs/RUNBOOK.md`, `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `docs/superpowers/specs/2026-08-10-schema-e-admin-do-restaurante-design.md`

- [ ] **Step 1: `SNAPSHOT.md` — reescrita, não remendo**

O arquivo descreve o snapshot como *"1 admin user, 150 informations, 8 services, 10 portfolio projects and 13 clients — all with real cover/logo images"*, e traz um aviso de que está desatualizado.

Nada disso é verdade agora. Reescreva descrevendo o ponto de restauração real: **um administrador, nenhum conteúdo**, e o schema de 8 models. **Remova o aviso de desatualizado** — ele foi resolvido, e deixá-lo é pior que não ter aviso nenhum.

Verifique a tag git citada (`snapshot-2026-06-09`) antes de repeti-la: se não existir mais ou não corresponder, corrija ou tire.

- [ ] **Step 2: Os outros documentos**

`grep -rln "db:dump\|db:restore\|snapshot.sql\|seed-informations" --include=*.md .` (fora de `node_modules` e `.superpowers/`) aponta `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `docs/RUNBOOK.md`.

Em cada um, corrija o que ficou falso. Atenção especial a qualquer trecho que prometa que o seed popula conteúdo de exemplo — quem seguir isso vai achar que o ambiente quebrou ao ver o site vazio. Diga que o site nasce vazio **de propósito** e que o conteúdo entra pelo painel.

- [ ] **Step 3: A senha do admin, e como o admin nasce em produção**

Confirme que o `docs/RUNBOOK.md` manda trocar a senha padrão antes de qualquer deploy. Se não mandar, adicione.

⚠️ **Não repita que "o seed roda no build da Vercel" — é falso.** O `vercel.json` roda `npx prisma migrate deploy && next build`; o seed nunca é invocado. Isso levanta uma pergunta operacional que o RUNBOOK precisa responder e talvez não responda: **como o primeiro usuário admin passa a existir num ambiente novo?** O caminho real é `npm run db:set-admin` (lê `ADMIN_EMAIL`/`ADMIN_PASSWORD`) ou um `db:seed` manual com `SEED_ADMIN_PASSWORD` definida. Se o RUNBOOK não descreve nenhum dos dois, esse é um buraco de verdade — documente-o.

- [ ] **Step 3b: Os documentos que prometem conteúdo de demonstração**

Quatro arquivos dizem que o seed carrega conteúdo de exemplo, e depois deste PR nenhum deles está certo. Encontrados na Task 1:

- `docker-compose.yml:5` — `npm run db:seed  # load demo content + admin user`
- `README.md:311` — `# demo content + first admin user`
- `README.md:348` — tabela: "Seed demo content + admin"
- `SNAPSHOT.md:43` — `# admin user + 150 informations`

Mais os trechos de `README.md:122,212,216,306` que a Task 1 apontou.

- [ ] **Step 4: spec §7**

Marque o **PR 7** como concluído, no mesmo formato dos outros. É a única edição autorizada sob `docs/superpowers/`. **Não edite nada em `docs/superpowers/plans/`.**

- [ ] **Step 5: Validar e commitar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
npx playwright test
```

⚠️ O `e2e/contact.spec.ts` submete o formulário de contato, o que **grava um lead**. Depois do reset o banco está vazio; se o teste passar, a contagem de `leads` deixa de ser 0. Isso é esperado — registre a contagem final no relatório para o revisor não a confundir com resíduo.

---

## Critérios de aceite do PR

- [ ] `npm run typecheck && npm run lint && npm run build && npm test` verde; `npx playwright test` verde
- [ ] `prisma/seed-informations.ts` não existe; nada importa `buildInformations`
- [ ] `npx prisma migrate status` diz em dia, sobre um banco recriado do zero
- [ ] 9 tabelas; todas as contagens zero exceto `admin_users` = 1 (e `leads`, se o e2e rodou)
- [ ] As 22 migrações aplicaram numa base vazia sem erro
- [ ] `prisma/backups/snapshot.sql` regerado, sem `CAREER`/`portfolio`/`company`, e **conferido restaurando**
- [ ] Todas as rotas públicas 200 com o banco vazio, exibindo as mensagens de estado vazio, `MISSING_MESSAGE` = 0
- [ ] O admin loga e todas as seções abrem vazias sem erro
- [ ] `SNAPSHOT.md` descreve o estado real e não carrega mais o aviso de desatualizado
- [ ] Nenhuma migração foi criada ou editada
- [ ] Nenhum `«PENDENTE»` do `src/content/legal.ts` foi preenchido — **inclusive o CNPJ**, que o dono forneceu mas mandou inserir só depois deste PR

---

## Riscos e armadilhas

**A cadeia de 22 migrações nunca rodou do zero.** É o maior risco do PR e também o seu maior valor. Se falhar, falha aqui e não no primeiro deploy da Vercel. Uma falha é motivo de `BLOCKED` e relatório, nunca de editar migração.

**`prisma migrate reset` está proibido.** A trava do Prisma contra agentes existe por um bom motivo e não se contorna. `DROP SCHEMA public CASCADE` faz o mesmo, dizendo exatamente o que faz.

**O site vazio pode revelar bugs que os dados escondiam.** Uma seção que assume ao menos um item, um `[0]` sem guarda, um carrossel com zero slides. Se aparecer, **é bug de verdade** e precisa ser reportado — não contornado semeando conteúdo.

**O e2e grava um lead.** Depois dele a tabela `leads` não está mais vazia. Esperado; registre.

**A senha `changeme123`.** O seed cai para ela quando `SEED_ADMIN_PASSWORD` não está definida. Não é escopo deste PR consertar, mas é escopo deixar impossível de não ver. **Não** afirme que ela chega a produção pelo build — a Task 1 verificou o `vercel.json` e o seed não roda lá. O gatilho real é um `db:seed` manual.

**O snapshot antigo tem 290 KB e some.** É intencional: ele descreve um schema que não existe. O dono recusou o dump de pré-reset — não faça um por conta própria.
