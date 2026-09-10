/**
 * Carga das páginas de conteúdo local (`/novidades/<slug>`).
 *
 * As páginas nascem como JSON escrito fora do repositório — dez arquivos, um
 * por bloco temático — e entram aqui uma vez cada, casadas por `slug`.
 *
 * **Valida antes de gravar, e recusa a carga inteira.** Uma página com ícone
 * inexistente ou descrição fora do tamanho não é um erro que aparece: ela
 * publica torta e ninguém olha de novo. Melhor não gravar nada e dizer o que
 * está errado do que gravar 98 boas e 2 quebradas.
 *
 * Uso:
 *   node scripts/import-informations.mjs <pasta-com-os-json> [--dry-run]
 *
 * É idempotente: roda quantas vezes precisar. Rodar de novo atualiza o que
 * mudou nos arquivos — e sobrescreve edições feitas no admin nesses slugs.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import * as lucide from "lucide-react";

const DRY = process.argv.includes("--dry-run");
const DIR = process.argv.find((a) => !a.startsWith("--") && a.includes("seo"));

/** O CLI do Prisma carrega o `.env` sozinho; um script solto, não. */
function loadEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

/**
 * Rotas que existem no site. Link interno para rota inventada é 404 servido a
 * quem chegou pelo Google — pior que não ter link.
 */
const ROTAS = ["/", "/cardapio", "/reservas", "/contato", "/galeria", "/experiencia", "/novidades"];

/**
 * A capa de cada card, por bloco temático.
 *
 * O card é um bloco 4:3 com a foto sob o véu da marca — sem foto ele vira um
 * azulejo marrom liso, e cem deles seguidos leem como conteúdo faltando. Como
 * o acervo é menor que o número de páginas, a foto repete: o que não pode
 * repetir é a foto ADJACENTE, então cada bloco recebe um conjunto próprio e as
 * dez páginas dele giram por esse conjunto.
 *
 * Só arquivos de `public/`: são versionados, não dependem do Storage estar de
 * pé, e o `next/image` os serve otimizados do mesmo domínio.
 */
const CAPAS = {
  buffet: [
    "/ambiente/buffet.webp",
    "/ambiente/horario-11h30.webp",
    "/hero/slide-1.webp",
    "/ambiente/horario-11h.webp",
  ],
  carnes: [
    "/ambiente/picanha-na-brasa.webp",
    "/hero/slide-2.webp",
    "/hero/slide-3.webp",
  ],
  massas: [
    "/massas/ravioli-ao-molho-branco.webp",
    "/massas/nhoque-ao-sugo.webp",
    "/massas/penne-ao-sugo.webp",
    "/sobremesas/pudim.webp",
    "/bebidas/carta-de-vinhos.webp",
    "/sobremesas/petit-gateau.webp",
    "/sobremesas/torta-de-limao.webp",
  ],
  dias: [
    "/ambiente/buffet.webp",
    "/hero/slide-1.webp",
    "/ambiente/horario-11h.webp",
    "/hero/slide-4.webp",
    "/ambiente/horario-11h30.webp",
  ],
  horarios: [
    "/ambiente/salao.webp",
    "/ambiente/salao-mesas.webp",
    "/ambiente/horario-11h30.webp",
  ],
  centro: [
    "/ambiente/fachada.webp",
    "/ambiente/salao.webp",
    "/ambiente/salao-mesas.webp",
  ],
  arredores: [
    "/ambiente/fachada.webp",
    "/ambiente/salao-adega.webp",
    "/ambiente/salao-mesas.webp",
  ],
  empresas: [
    "/ambiente/salao-mesas.webp",
    "/ambiente/salao.webp",
    "/ambiente/vinhos.webp",
  ],
  grupos: [
    "/ambiente/salao-mesas.webp",
    "/ambiente/salao.webp",
    "/ambiente/salao-adega.webp",
    "/ambiente/fachada.webp",
  ],
  duvidas: [
    "/ambiente/salao.webp",
    "/ambiente/fachada.webp",
    "/ambiente/salao-mesas.webp",
    "/ambiente/vinhos.webp",
  ],
};

const problemas = [];
const vistos = new Map();

/**
 * O que a casa não tem. Dizer que NÃO tem é correto e desejável — o dossiê
 * manda negar. Errado é AFIRMAR.
 *
 * A checagem lê a FRASE INTEIRA em volta da palavra, não só o que vem antes:
 * em português a negação cai dos dois lados — "não abrimos no sábado" e
 * "sábado a casa não abre" dizem o mesmo. Olhar só para trás reprovava a
 * segunda forma, que é a mais comum.
 *
 * Heurística, não gramática. Erra para o lado de reclamar demais: um falso
 * positivo custa uma leitura, um falso negativo publica promessa mentirosa.
 */
const AUSENTES =
  /estacionament\w*|manobrist\w*|acessibilidad\w*|cadeirante\w*|feijoada|rod[íi]zio|delivery|jantar|domingo|s[áa]bado|prato feito/gi;
/**
 * ⚠️ `\b` do JavaScript só conhece `[A-Za-z0-9_]`: **`/\bsó\b/` nunca casa**,
 * porque o `ó` não é caractere de palavra e a fronteira depois dele não existe.
 * Foi assim que "o Fogão de Ouro só atende de segunda a sexta" passou por uma
 * checagem de negação. Daí as bordas manuais com a faixa acentuada.
 */
const B = "(?<![0-9A-Za-zÀ-ÿ])";
const B_ = "(?![0-9A-Za-zÀ-ÿ])";
const NEGACAO = new RegExp(
  B +
    "(?:n[ãa]o|sem|nem|nada de|nenhum\\w*|fecha\\w*|exceto|apenas|s[óo]|fora d\\w+|diferente de|em (?:outro|outra))" +
    B_,
  "i",
);

/**
 * Vizinhos que a casa cita pelo horário DELES. "O museu abre de terça a
 * domingo" é fato sobre o museu, não promessa nossa — e é justamente o tipo de
 * informação que faz a página valer para quem planeja o passeio.
 */
const TERCEIROS =
  /museu|pinacoteca|teatro|mercado|bolsa|catedral|esta[çc][ãa]o|coliseu|f[óo]rum/i;

function afirmaOQueNaoTem(texto) {
  const achados = [];
  for (const m of texto.matchAll(AUSENTES)) {
    const inicio = Math.max(0, texto.lastIndexOf(".", m.index) + 1);
    const fim = texto.indexOf(".", m.index + m[0].length);
    const frase = texto.slice(inicio, fim === -1 ? texto.length : fim + 1);
    if (NEGACAO.test(frase) || TERCEIROS.test(frase)) continue;
    achados.push({ termo: m[0], frase: frase.trim() });
  }
  return achados;
}

function valida(pagina, arquivo, i, slugsConhecidos) {
  const onde = `${arquivo}[${i}]`;
  const p = (msg) => problemas.push(`${onde}: ${msg}`);

  for (const chave of ["slug", "icon", "title", "description", "content"]) {
    if (!pagina[chave]) return p(`falta a chave "${chave}"`);
  }

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(pagina.slug))
    p(`slug fora do padrão kebab-case sem acento: "${pagina.slug}"`);

  // O ícone é validado contra o pacote de verdade: nome errado quebra o card
  // em runtime, e o build passa. Os ícones do lucide são objetos (forwardRef),
  // não funções — testar por `typeof === "function"` reprova todos.
  if (!lucide[pagina.icon])
    p(`ícone "${pagina.icon}" não existe no lucide-react`);

  const d = pagina.description.length;
  if (d < 110 || d > 165) p(`description com ${d} caracteres (esperado 110–165)`);

  if (!Array.isArray(pagina.content) || pagina.content.length < 3)
    p(`content precisa ser um array com 3 blocos ou mais`);

  // Links internos: rota que não existe vira 404 para quem veio da busca.
  // `/novidades/<slug>` é o link entre páginas irmãs, e vale se o irmão existe
  // — por isso a checagem roda depois de todos os slugs serem conhecidos.
  for (const bloco of pagina.content ?? []) {
    for (const [, href] of String(bloco).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      if (!href.startsWith("/")) continue;
      const rota = href.split("#")[0];
      const irmao = /^\/novidades\/([a-z0-9-]+)$/.exec(rota);
      if (irmao) {
        if (!slugsConhecidos.has(irmao[1]))
          p(`link para página irmã que não existe: ${rota}`);
      } else if (!ROTAS.includes(rota)) {
        p(`link interno para rota inexistente: ${rota}`);
      }
    }
  }

  // As promessas que a casa não sustenta. Vale a checagem mesmo depois do
  // cético: ele é um modelo, isto é uma lista.
  for (const { termo, frase } of afirmaOQueNaoTem(
    pagina.content.join(" ") + " " + pagina.title,
  )) {
    p(`parece AFIRMAR "${termo}", sem negação na frase: "${frase}"`);
  }
}

async function main() {
  if (!DIR || !existsSync(DIR)) {
    console.error("Informe a pasta com os JSON das páginas.");
    process.exit(1);
  }

  const arquivos = readdirSync(DIR).filter((f) => f.endsWith(".json"));
  const paginas = [];

  for (const arquivo of arquivos) {
    let lista;
    try {
      lista = JSON.parse(readFileSync(join(DIR, arquivo), "utf8"));
    } catch (e) {
      problemas.push(`${arquivo}: JSON inválido — ${e.message}`);
      continue;
    }
    if (!Array.isArray(lista)) {
      problemas.push(`${arquivo}: esperado um array`);
      continue;
    }
    const bloco = arquivo.replace(/\.json$/, "");
    const capas = CAPAS[bloco];
    if (!capas) problemas.push(`${arquivo}: bloco sem conjunto de capas definido`);

    lista.forEach((pagina, i) => {
      // Gira pelo conjunto do bloco: vizinhas na grade nunca saem iguais.
      pagina.image = capas ? capas[i % capas.length] : "";
      pagina._onde = `${arquivo}[${i}]`;
      paginas.push(pagina);
    });
  }

  // Duas passagens: os links entre páginas irmãs só podem ser conferidos
  // depois que se sabe quais irmãs existem.
  const slugs = new Set(paginas.map((p) => p.slug).filter(Boolean));
  for (const pagina of paginas) {
    const [arquivo, i] = pagina._onde.replace("]", "").split("[");
    if (vistos.has(pagina.slug))
      problemas.push(
        `${pagina._onde}: slug repetido — já usado em ${vistos.get(pagina.slug)}`,
      );
    else vistos.set(pagina.slug, pagina._onde);
    valida(pagina, arquivo, i, slugs);
    delete pagina._onde;
  }

  console.log(`${arquivos.length} arquivos, ${paginas.length} páginas.`);

  if (problemas.length > 0) {
    console.error(`\n${problemas.length} problema(s) — nada foi gravado:\n`);
    problemas.forEach((p) => console.error("  • " + p));
    process.exit(1);
  }
  console.log("Validação: tudo certo.");

  if (DRY) {
    console.log("\n--dry-run: nada gravado. Amostra:");
    console.log(JSON.stringify(paginas[0], null, 2));
    return;
  }

  loadEnv();
  const prisma = new PrismaClient();

  // A ordem começa em 100 para as novidades escritas à mão (order 0, 1, 2)
  // seguirem na frente da grade.
  let ordem = 100;
  let criadas = 0;
  let atualizadas = 0;

  for (const pagina of paginas) {
    const existente = await prisma.information.findUnique({
      where: { slug: pagina.slug },
      select: { id: true },
    });

    const dados = {
      icon: pagina.icon,
      image: pagina.image ?? "",
      title: { pt: pagina.title },
      description: { pt: pagina.description },
      content: { pt: pagina.content },
      order: ordem++,
      published: true,
    };

    await prisma.information.upsert({
      where: { slug: pagina.slug },
      create: { slug: pagina.slug, ...dados },
      update: dados,
    });

    existente ? atualizadas++ : criadas++;
  }

  console.log(`\n${criadas} criadas, ${atualizadas} atualizadas.`);
  const total = await prisma.information.count();
  console.log(`Total de páginas publicadas no banco: ${total}`);
  await prisma.$disconnect();

  await conferirSitemap(paginas.map((p) => p.slug));
}

/**
 * Diz se as páginas chegaram ao sitemap — e é por isto que este bloco existe.
 *
 * **Escrever no banco não invalida o cache.** As páginas e o sitemap são
 * servidos por `unstable_cache` com a tag `informations`, expirada por
 * `updateTag` nas ações do admin. Este script escreve por fora dessas ações,
 * então nada expira: as páginas respondem 200, e o sitemap segue mostrando a
 * lista antiga por até 24 horas.
 *
 * Foi o que aconteceu em 10/09/2026 — 100 páginas no ar e 12 no sitemap.
 *
 * `updateTag` não pode ser chamado daqui: ele só existe dentro do runtime do
 * Next. E abrir uma rota pública de revalidação com segredo, para um script que
 * roda meia dúzia de vezes por ano, é superfície de ataque que não se paga.
 *
 * Então o script faz o que pode fazer: **verifica e diz**. Um lembrete que o
 * próprio sistema dá vale mais do que um que alguém precisa lembrar de ler.
 */
async function conferirSitemap(slugs) {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base || base.includes("localhost")) {
    console.log("\nSem NEXT_PUBLIC_SITE_URL de produção — pulei a conferência do sitemap.");
    return;
  }

  let xml;
  try {
    const res = await fetch(`${base}/sitemap.xml`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (e) {
    console.log(`\nNão consegui ler ${base}/sitemap.xml (${e.message}).`);
    console.log("Confira à mão se as páginas novas entraram.");
    return;
  }

  const faltando = slugs.filter((s) => !xml.includes(`/novidades/${s}`));

  if (faltando.length === 0) {
    console.log(`\n✅ Sitemap em dia: as ${slugs.length} páginas estão listadas.`);
    return;
  }

  console.log(`\n⚠️  ${faltando.length} de ${slugs.length} páginas NÃO estão no sitemap.`);
  console.log("   As páginas respondem 200, mas o buscador não vai descobri-las por ali.");
  console.log("   Causa: gravar no banco não expira o cache por tag.");
  console.log("\n   Resolva de uma destas formas:");
  console.log("     • um deploy de produção reconstrói o sitemap na hora;");
  console.log("     • ou salve qualquer novidade pelo /admin, que chama updateTag;");
  console.log("     • ou espere a validade de 24h do cache virar sozinha.");
  console.log(`\n   Conferir depois:  curl -s ${base}/sitemap.xml | grep -c "<loc>"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
