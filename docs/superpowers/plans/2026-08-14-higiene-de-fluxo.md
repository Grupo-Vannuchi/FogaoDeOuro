# Trava de indexação e higiene de fluxo — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Impedir que o site seja indexado antes de estar pronto, e fechar as falhas de processo que já quebraram o build uma vez e podem quebrar de novo.

**Architecture:** Os sete PRs anteriores mudaram o produto. Este muda o **entorno**: o que o Google enxerga, o que o git permite, e o que falha antes de chegar ao CI em vez de depois. Nenhuma tarefa aqui altera comportamento de página para o visitante — exceto a primeira, que é justamente o ponto.

**Tech Stack:** Next 16 (App Router + Turbopack), Prisma 6 + PostgreSQL, git, GitHub Actions, Vercel.

## Global Constraints

- **Branch:** `Development`. **Nunca `git push`** — o dono do projeto envia manualmente.
- **Validação obrigatória** ao fim de cada tarefa: `npm run typecheck && npm run lint && npm run build && npm test`.
- ⚠️ **O `.env` local aponta para o SUPABASE (produção).** Qualquer comando de banco escreve no banco do cliente. Este PR **não toca em banco nenhum** — se você achar que precisa, entendeu o escopo errado. **Proibido:** `prisma migrate dev`, `migrate reset`, `db push`, `db:seed`, `db:restore`.
- ⚠️ **Não rode `npm run test:e2e`.** O `e2e/contact.spec.ts` envia o formulário de contato de verdade e **gravaria um lead no banco do cliente**. Se precisar rodá-lo, injete as URLs do Docker na linha de comando (`DATABASE_URL=… DIRECT_URL=… npm run test:e2e`) — nunca com o `.env` como está.
- **Nunca editar migração já aplicada** (quebra de checksum). Este PR não cria nem edita migração.
- Commits convencionais terminando com `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

## Contexto que motiva cada tarefa

| Falha | O que aconteceu de verdade |
|---|---|
| Indexação | O site vai ao ar em `fogao-de-ouro.vercel.app` sem conteúdo, com o hero vazio e com `«PENDENTE: domínio final do site»` renderizando na política de privacidade — que é exatamente o que o aviso no topo do `legal.ts` manda não publicar |
| `pt.json` | Regrediu **duas vezes**. Na segunda (`84b8456`) derrubou o build da Vercel, a CI e o E2E de uma vez |
| `upstream` | O remote aponta para `Grupo-Vannuchi/n8x` **com push habilitado**. Um `git push upstream` manda o site do cliente para o repositório da agência |
| `.sql` sem `.gitattributes` | `core.autocrlf=true` e 16 dos 23 arquivos de migração já estão CRLF na árvore. A revisão do PR 7 provou que um dump CRLF injeta `\r` dentro de literal *dollar-quoted* em silêncio |
| Advertências do deploy | `package.json#prisma` é deprecado e o **Prisma 7 remove**; `engines: node 22.x` conflita com o 24.x das Project Settings da Vercel |

---

## Mapa de arquivos

| Arquivo | O quê |
|---|---|
| `src/lib/env.ts` | +`SITE_INDEXABLE` |
| `src/app/robots.ts` | bloqueia tudo quando não indexável |
| `src/app/[locale]/layout.tsx` (ou onde vive o metadata raiz) | `robots: { index: false, follow: false }` |
| `.env.example` | documenta a variável nova |
| `.gitattributes` | **novo** |
| `.githooks/pre-push` | **novo** |
| `package.json` | `engines`, e o hook no `postinstall` |
| `prisma.config.ts` | **novo** (se a Task 5 confirmar que funciona) |
| `docs/RUNBOOK.md`, `AGENTS.md` | Task 6 |

---

### Task 1: Trava de indexação

A tarefa mais urgente do plano: é a única cuja janela fecha. Depois que o Google indexa um `.vercel.app`, tirar leva semanas — e o canonical, o sitemap e as imagens de compartilhamento hoje apontam todos para lá.

**Files:**
- Modify: `src/lib/env.ts`, `src/app/robots.ts`, o layout que define o metadata raiz, `.env.example`

**Interfaces:**
- Produz: `env.SITE_INDEXABLE` (boolean, **padrão `false`**).

- [ ] **Step 1: A variável**

Em `src/lib/env.ts`, no `serverSchema`, adicione `SITE_INDEXABLE`. Duas armadilhas:

1. **Variável de ambiente é sempre string.** `"false"` é *truthy* em JS. Faça a coerção explícita — algo no espírito de `z.enum(["true","false"]).default("false").transform(v => v === "true")`. Um `z.coerce.boolean()` **não serve**: ele devolve `true` para a string `"false"`.
2. **O padrão precisa ser "não indexar".** Se alguém esquecer de configurar, o resultado seguro é o site fechado, não aberto.

- [ ] **Step 2: `robots.ts`**

Leia o arquivo inteiro antes de mexer — ele tem três regras (o `*`, os crawlers de IA que são deliberadamente permitidos, e os scrapers de treino que são bloqueados) e um comentário explicando o porquê de cada uma.

Quando `SITE_INDEXABLE` for falso, o retorno deve ser um `Disallow: /` para **todos** os agentes, e **sem `sitemap`** — publicar o sitemap enquanto se pede para não indexar é contraditório e alguns crawlers seguem o sitemap mesmo assim.

Quando for verdadeiro, o comportamento atual fica **exatamente** como está. Não reescreva as três regras; só ramifique.

- [ ] **Step 3: A meta tag**

`robots.txt` é um pedido; a meta tag `noindex` é a instrução que o Google respeita para não *exibir* a página. As duas juntas.

Encontre onde o metadata raiz é definido (`export const metadata` ou `generateMetadata` no layout de `[locale]`) e acrescente `robots: { index: false, follow: false }` quando não indexável.

⚠️ **Não sobrescreva o metadata que já existe** — title template, description, openGraph. Some o campo, não substitua o objeto.

- [ ] **Step 4: Documentar em `.env.example`**

Com o padrão explícito e a instrução de como publicar de verdade (setar `SITE_INDEXABLE=true` na Vercel e redeployar).

- [ ] **Step 5: Validar contra um servidor rodando**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

⚠️ **`rm -rf .next` antes de buildar** — este projeto já teve build verde servindo conteúdo obsoleto de cache.

Depois suba o servidor (mate a 3000 antes) e confirme os **dois** estados:

```bash
# padrao: fechado
curl -sL http://localhost:3000/robots.txt
curl -sL http://localhost:3000/pt | grep -o '<meta name="robots"[^>]*>'
```
Esperado: `Disallow: /`, sem `Sitemap:`, e a meta com `noindex`.

```bash
# aberto
SITE_INDEXABLE=true npm run build && SITE_INDEXABLE=true npm run start
```
Esperado: o `robots.txt` volta **idêntico** ao de antes deste PR (compare com `git show HEAD:…` renderizado, ou pelo menos confirme as três regras e a linha `Sitemap:`), e a meta `noindex` some.

Cole as duas saídas no relatório.

- [ ] **Step 6: Commit**

---

### Task 2: O push para o repositório da agência

**Files:** nenhum arquivo do repo — é configuração local de git. A tarefa é executar, verificar e **documentar**.

O remote `upstream` aponta para `Grupo-Vannuchi/n8x` com push habilitado. É o repositório da agência, de onde este projeto foi forkado. Um `git push upstream` por engano publica o site do cliente lá.

- [ ] **Step 1: Desabilitar**

```bash
git remote set-url --push upstream no_push
```

- [ ] **Step 2: Provar que travou**

```bash
git remote -v            # a linha (push) do upstream deve dizer no_push
git push --dry-run upstream 2>&1 | tail -3
```

O `--dry-run` tem que **falhar**. Cole a saída — é a evidência. Confirme também que `git push --dry-run origin Development` continua funcionando: a trava não pode ter afetado o remote certo.

⚠️ Isto é config **local**, não versionada: quem clonar de novo não herda. Por isso o Step 3.

- [ ] **Step 3: Documentar**

No `docs/RUNBOOK.md`, uma nota curta: o repo é um fork, o `upstream` é o repositório da agência, e todo clone novo deve rodar o comando acima. Explique **por quê** — sem o motivo, alguém desfaz.

- [ ] **Step 4: Commit** (só a doc)

---

### Task 3: `.gitattributes` para os `.sql`

**Files:**
- Create: `.gitattributes`

A revisão do PR 7 provou, num banco descartável, que um `.sql` conferido como CRLF injeta um `\r` **em silêncio** dentro de literal *dollar-quoted* (`position(chr(13) in x)` = 6), e que EOL misto dentro de `COPY` dá erro duro. O `snapshot.sql` de hoje escapa por não ter `$$`, função, trigger nem `\connect` — uma migração futura com trigger quebra isso sem avisar.

Há um segundo efeito, medido nesta sessão: **o Prisma não normaliza fim de linha** ao calcular checksum de migração. O checksum guardado bate com os bytes CRLF do disco (`sha256 6967b09f…`; a versão LF dá `606f3e1c…`). Hoje isso é inofensivo — `migrate deploy` e `migrate status` **não** verificam checksum de migração já aplicada, o que eu confirmei rodando os dois com um arquivo convertido — mas o `migrate dev` verifica, e já causou um incidente no PR 4.

- [ ] **Step 1: Criar**

Force LF para os `.sql`. Escreva um comentário no arquivo explicando os dois motivos acima — sem ele, alguém "limpa" a regra achando que é preferência de estilo.

- [ ] **Step 2: Normalizar o que já está na árvore**

```bash
git add --renormalize .
git status --short
```

Reporte **exatamente** quais arquivos mudaram. Se algum `.sql` de migração aparecer como modificado, **pare e reporte antes de commitar**: o conteúdo em si não muda, mas vale o dono saber que os arquivos de migração serão reescritos com LF.

- [ ] **Step 3: Provar**

```bash
git ls-files --eol -- '*.sql' | sort | uniq -c -f2 | head
```

Todos devem ficar `w/lf`. E confirme que o `npx prisma migrate status` continua limpo depois — se o checksum passar a divergir, isso é um achado importante e precisa ir no relatório.

⚠️ Este comando fala com o **Supabase** (o `.env` aponta para lá). É leitura, então é seguro.

- [ ] **Step 4: Commit**

---

### Task 4: Guarda contra a regressão do `pt.json`

O `pt.json` regrediu duas vezes. Na segunda, derrubou Vercel, CI e E2E ao mesmo tempo — e a causa foi um estado antigo do arquivo sendo salvo por cima do atual.

O `typecheck` **detecta** isso: o catálogo é tipado a partir do próprio `pt.json` (`src/global.d.ts`), então um consumidor órfão vira erro de compilação. O que faltou não foi detecção — foi **rodar o typecheck antes do push**. O CI pegou, mas depois.

**Files:**
- Create: `.githooks/pre-push`
- Modify: `package.json`

- [ ] **Step 1: O hook**

Um `pre-push` que roda `npm run typecheck`. Requisitos:

- Rápido: só o `tsc --noEmit`, **não** o build.
- Mensagem de erro útil, em português, explicando o que fazer (`--no-verify` para pular conscientemente).
- Precisa funcionar no **Git Bash do Windows**, que é o shell deste projeto. Cuidado com CRLF no próprio arquivo do hook: um `#!/bin/sh` com `\r` no fim faz o shell reclamar de intérprete inexistente. **Cubra o `.githooks/` no `.gitattributes` da Task 3, ou force LF nele.**

- [ ] **Step 2: Instalar o hook automaticamente**

Hooks não são versionados. A ponte é `core.hooksPath` apontando para `.githooks/`, configurado no `postinstall`.

⚠️ **O `postinstall` também roda na Vercel**, onde hoje ele é `prisma generate`. Se o `git config` falhar lá, o **build inteiro quebra**. Encadeie de forma que a falha seja inofensiva (`|| true` ou equivalente) e **verifique** que o `prisma generate` continua rodando primeiro e com o status certo.

Ative na sua sessão e confirme: `git config --get core.hooksPath`.

- [ ] **Step 3: Provar que o hook pega o caso real**

Não basta o hook existir; ele precisa reprovar o erro que motivou a tarefa. Reproduza:

```bash
# quebre uma chave do catalogo de proposito, num arquivo temporario de trabalho
```
Renomeie **uma** chave do `pt.json` que tenha consumidor (por exemplo `common.viewAllGallery`), rode `git commit` e depois `git push --dry-run origin Development`. **O hook tem que barrar.** Depois **desfaça a alteração** (`git checkout -- src/messages/pt.json` e desfaça o commit de teste com `git reset --soft HEAD~1` se tiver criado um).

Cole a saída do hook barrando. Confirme ao final que `git status` está limpo e que o `pt.json` voltou ao original — compare o sha256 antes e depois.

- [ ] **Step 4: Commit**

---

### Task 5: As advertências do log do deploy

Duas, e **elas não têm o mesmo risco** — trate cada uma no seu peso.

**Files:**
- Create: `prisma.config.ts` (se o Step 1 confirmar)
- Modify: `package.json`

- [ ] **Step 1: `package.json#prisma` → `prisma.config.ts`**

O aviso é real: o Prisma 7 remove essa configuração. Hoje o bloco tem só `{ "seed": "tsx prisma/seed.ts" }`.

**Antes de escrever qualquer coisa, verifique se o Prisma 6.19 desta instalação suporta `prisma.config.ts` de forma estável** — leia a documentação instalada ou o próprio pacote, não a sua memória. Se o suporte for experimental ou mudar o comportamento do `db:seed`, **não force**: reporte e deixe para a atualização do Prisma 7.

Se suportar, migre e **prove que o seed ainda é encontrado**:

```bash
npx prisma db seed --help
```
⚠️ **Não execute o seed** — o `.env` aponta para produção e ele criaria um `admin@example.com` com senha `changeme123` no banco do cliente. Só confirme que o comando resolve o script.

E confirme que a advertência sumiu de um comando que a emitia:
```bash
npx prisma migrate status 2>&1 | grep -i "deprecated" || echo "advertencia sumiu"
```

- [ ] **Step 2: A versão do Node**

O `package.json` declara `engines: { "node": "22.x" }`, a Vercel está configurada para 24.x, e **a máquina local roda Node 24**. Ou seja: a declaração não corresponde a nenhum dos dois ambientes onde o projeto realmente roda.

Isto **muda o runtime de produção** — não é cosmético. Avalie e reporte a recomendação, mas **só aplique a mudança se conseguir validar** que `npm run build && npm test` passam na versão que você declarar. Se não conseguir validar, reporte a recomendação e não mude nada.

- [ ] **Step 3: Validar e commitar**

---

### Task 6: Documentação

**Files:**
- Modify: `AGENTS.md`, `docs/RUNBOOK.md`, `.env.example`, spec §7

- [ ] **Step 1: `SITE_INDEXABLE`**

No `RUNBOOK.md`, na tabela de variáveis e numa nota no fluxo de deploy: **o site nasce fechado**; publicar de verdade é setar `SITE_INDEXABLE=true` e redeployar. Ligue isso ao aviso do `legal.ts` — enquanto houver `«PENDENTE»`, o site não deve ser indexado.

- [ ] **Step 2: O `pre-push` e o `hooksPath`**

Em `AGENTS.md` (carregado como instrução em toda sessão) e no `RUNBOOK.md`: clone novo precisa de `npm install` para o hook ser ativado, e existe `--no-verify` para pular conscientemente.

- [ ] **Step 3: O `upstream`**

Se a Task 2 já documentou, confira que está claro e não duplique.

- [ ] **Step 4: spec §7**

Este PR não estava previsto no spec original (que ia até o PR 7). Acrescente uma linha registrando-o, no mesmo formato. **É a única edição autorizada sob `docs/superpowers/`** — não edite nada em `docs/superpowers/plans/`.

- [ ] **Step 5: Validar e commitar**

```bash
npm run typecheck && npm run lint && npm run build && npm test
```

---

## Critérios de aceite do PR

- [ ] `npm run typecheck && npm run lint && npm run build && npm test` verde
- [ ] Com o padrão: `/robots.txt` traz `Disallow: /`, sem `Sitemap:`, e o HTML traz `noindex`
- [ ] Com `SITE_INDEXABLE=true`: o `robots.txt` volta ao comportamento anterior a este PR, com as três regras e o `Sitemap:`; a meta `noindex` some
- [ ] `git push --dry-run upstream` **falha**; `git push --dry-run origin Development` continua funcionando
- [ ] `git ls-files --eol -- '*.sql'` mostra `w/lf` em todos
- [ ] `npx prisma migrate status` continua limpo depois da renormalização
- [ ] O `pre-push` **barrou** uma quebra real de chave do catálogo, com a saída no relatório, e a árvore voltou limpa
- [ ] O `postinstall` continua rodando `prisma generate` e **não quebra** se o `git config` falhar
- [ ] **Nada em `prisma/migrations/` foi editado**; nenhum comando de escrita tocou o banco
- [ ] Nenhum `«PENDENTE»` do `src/content/legal.ts` foi preenchido

---

## Riscos e armadilhas

**`SITE_INDEXABLE=false` como padrão é intencional.** Um esquecimento tem que resultar em site fechado. Se você inverter "por conveniência", o esquecimento passa a publicar.

**`"false"` é truthy.** A coerção da string é o erro clássico desta tarefa, e ele falha exatamente no sentido perigoso: o site fica aberto achando que está fechado. `z.coerce.boolean()` **não resolve**.

**O `postinstall` roda na Vercel.** Quebrá-lo derruba o deploy inteiro — e o sintoma aparece longe da causa.

**O `.env` aponta para produção.** Nenhuma tarefa deste PR precisa escrever no banco. `migrate status` (leitura) é o limite.

**O `e2e` grava lead.** Se for rodar, injete as URLs do Docker na linha de comando.

**Cache do `.next`.** Limpe antes de qualquer build de verificação; já houve build verde servindo conteúdo apagado.
