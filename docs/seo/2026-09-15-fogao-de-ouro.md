# SEO do Fogão de Ouro — medição de 15/09/2026

**Site:** https://www.fogaodeouro.com.br
**Ferramenta:** Lighthouse 12.8.2, executado localmente contra a **produção**
**Resultado:** **100/100** em todas as 8 páginas medidas

Este é o primeiro documento desta pasta que descreve **este** cliente. Os outros
dois (`AUDIT-REPORT.md` e `ACTION-PLAN.md`) auditam `n8xmarketing.com.br`, o site
da agência de onde o projeto nasceu como fork — cada um carrega um aviso no topo.

---

## Por que existia um "95/100" na cabeça de todo mundo

O cliente lembrava de "95/100". Não havia registro de onde vinha. A hipótese mais
provável é que fosse o **94/100 do `AUDIT-REPORT.md`** — que é de outro site, de
junho. Um documento que não se identifica vira memória institucional falsa.

A segunda hipótese, que também explica: o Lighthouse **até a versão 11** pontuava
`tap-targets` (alvos de toque) e `font-size` dentro da categoria SEO, e a **versão
12 tirou os dois**. Uma medição antiga podia legitimamente dar 95 e a mesma página
dar 100 hoje, sem nada ter mudado no site.

Das duas, a lição é a mesma: **número de SEO sem data e sem ferramenta anotada não
serve para nada.** Por isso este arquivo tem as duas coisas no cabeçalho.

---

## As 8 páginas, todas 100/100

| Rota | SEO |
| --- | --- |
| `/` | 100 |
| `/cardapio` | 100 |
| `/reservas` | 100 |
| `/novidades` | 100 |
| `/novidades/restaurante-perto-gonzaga` | 100 |
| `/galeria` | 100 |
| `/experiencia` | 100 |
| `/contato` | 100 |

Nenhuma auditoria pontuada falhou em nenhuma delas.

## O que o Lighthouse 12 realmente mede em SEO

Dez auditorias pontuadas, peso total ≈ 13,04 — e **uma só vale quase um terço**:

| Auditoria | Peso |
| --- | --- |
| `is-crawlable` (a página não está bloqueada para indexação) | **4,04** |
| `document-title` · `meta-description` · `http-status-code` | 1 cada |
| `link-text` · `crawlable-anchors` · `robots-txt` | 1 cada |
| `image-alt` · `hreflang` · `canonical` | 1 cada |

Mais `structured-data`, que é **manual e não pontua**.

**Isto é importante para não perseguir o número errado:** são dez verificações
técnicas binárias. Um site pode marcar 100/100 aqui e não ranquear para nada —
o Lighthouse não mede conteúdo, autoridade, backlinks nem intenção de busca.
Perder um item de peso 1 já derruba para 92; **95 não é sequer alcançável** com
esses pesos, o que reforça que o número lembrado vinha de outra fonte.

---

## O que foi conferido além do score

**As ~103 páginas locais não são conteúdo raso.** Esta era a maior suspeita, e
foi medida, não estimada: cinco páginas de bairro comparadas entre si dão
**870 a 910 palavras cada** e apenas **7–8% de sobreposição de frases** (uma
frase em comum de 12 a 14). É conteúdo distinto. O padrão de mercado alerta a
partir de 30 páginas de localidade, mas o alerta é sobre duplicação, e ela não
existe aqui.

**As 102 imagens com `alt=""` em `/novidades` estão corretas.** Cada card tem o
título do post como `<h3>` em texto ao lado (106 títulos para 102 imagens).
Preencher o `alt` faria o leitor de tela anunciar o título duas vezes. Alt vazio
é o padrão certo para imagem decorativa que acompanha texto equivalente.

**O `robots.txt` trata os rastreadores de IA um a um** — libera GPTBot,
OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot e
Google-Extended; bloqueia Bytespider, CCBot, Amazonbot, anthropic-ai,
Applebot-Extended e FacebookBot.

**Dados estruturados em todas as páginas:** `Restaurant` + `PostalAddress` +
`OpeningHoursSpecification` + `WebSite`; as páginas locais somam `BreadcrumbList`
e `Article`.

**`hreflang` declara só `pt`, e isso está certo:** `/en` devolve 404 e o site é
PT-only por decisão (`src/i18n/routing.ts`). Não há tag apontando para página
inexistente.

---

## O que mudou depois desta medição

Em 15/09, ainda no mesmo dia, o `Restaurant` ganhou dois campos que faltavam:

- **`priceRange`** — a escala de cifrões do Google Maps. Escolhido pelo cliente.
  Não é preço: é faixa relativa, e por isso convive com a regra da casa de não
  publicar valores. O formato textual (`"R$ 40 - R$ 70"`), que **publicaria**
  preço, foi recusado de propósito.
- **`geo`** — latitude e longitude da porta. O endereço postal resolve para a
  quadra; a coordenada resolve para a entrada, e é ela que alimenta "perto de
  mim" e o pino do mapa.

**Nenhum dos dois mexe no score** — o Lighthouse não os audita. Eles servem aos
resultados ricos e à busca local, que o score não mede. Isto é o exemplo mais
limpo da diferença entre "subir a nota" e "melhorar o SEO".

## Por que `aggregateRating` não entra

Seria o passo seguinte óbvio assim que houvesse depoimentos cadastrados. **Não
faça.** O Google chama de *self-serving review* uma avaliação sobre a entidade A
publicada no site da própria entidade A, e a página que faz isso fica
**inelegível** para o recurso de estrelas — política de 2019, válida para
`LocalBusiness` e `Organization`. Emitir `aggregateRating` aqui não traria
estrela nenhuma e ainda contrariaria a política.

As estrelas que aparecem ao pesquisar o restaurante vêm do **Google Business
Profile**, que é outro canal e não depende deste repositório.

<https://developers.google.com/search/docs/appearance/structured-data/review-snippet>

---

## Como repetir esta medição

O servidor de desenvolvimento **não** precisa estar no ar — mede-se a produção:

```bash
CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" \
npx lighthouse@12 https://www.fogaodeouro.com.br \
  --only-categories=seo --output=json --output-path=./lh.json \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" --quiet
```

Duas armadilhas que custaram tempo em 15/09:

1. **A API do PageSpeed Insights tem cota diária por IP e ela estoura fácil** —
   foi o que aconteceu, e é o que a variável `PAGESPEED_API_KEY` (hoje
   inexistente no projeto) resolveria. O Lighthouse local não tem cota.
2. **Em Git Bash, `/cardapio` vira `C:/Program Files/Git/cardapio`.** Qualquer
   argumento de rota precisa de `MSYS_NO_PATHCONV=1`.

E uma terceira, que vale para qualquer verificação de deploy neste projeto:
**o marcador precisa ser impossível no estado antigo, não apenas presente no
novo.** Quatro verificações falsas em 14–15/09 "confirmaram" o deploy velho.
Use contagem (4 botões contra 1) ou ausência do marcador antigo.
