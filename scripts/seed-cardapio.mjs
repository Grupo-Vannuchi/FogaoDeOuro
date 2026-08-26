/**
 * Carga inicial do cardápio da semana.
 *
 * Os pratos vieram do restaurante em 26/08/2026, um por dia útil. Aqui eles
 * entram uma única vez cada: "frango grelhado" sai segunda, quarta e quinta, e
 * um cadastro por dia significaria corrigir a mesma descrição três vezes.
 *
 * As descrições são deliberadamente simples. O restaurante não informou
 * ingredientes nem modo de preparo, e inventar "marinado por 24 horas" num
 * cardápio é o tipo de erro que chega à mesa.
 *
 * Uso:
 *   node scripts/seed-cardapio.mjs [--dry-run]
 *
 * É idempotente: roda quantas vezes precisar. Os pratos são casados por slug,
 * então rodar de novo atualiza o que mudou aqui sem duplicar nada — mas
 * sobrescreve edições feitas no admin para esses mesmos slugs.
 */
import { readFileSync, existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const DRY = process.argv.includes("--dry-run");

/** O CLI do Prisma carrega o `.env` sozinho; um script solto, não. */
function loadEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

/**
 * Categorias internas. Servem para organizar o cadastro e a manutenção; a
 * grade do cardápio digital agrupa por DIA, não por categoria, então o cliente
 * na mesa não vê esses nomes — só a página do prato mostra o dele.
 */
const CATEGORIES = [
  ["acompanhamentos", "Acompanhamentos"],
  ["carnes", "Carnes"],
  ["frangos", "Frangos"],
  ["peixes-e-frutos-do-mar", "Peixes e frutos do mar"],
  ["massas-e-risotos", "Massas e risotos"],
  ["fritos", "Fritos"],
  ["outros", "Outros"],
];

/**
 * O cardápio. `d` são os dias (1 = segunda … 5 = sexta), `c` a categoria.
 *
 * Ordem dos campos: slug, nome, dias, categoria, descrição curta (card) e
 * descrição longa (página do prato).
 */
const DISHES = [
  // ── Acompanhamentos ────────────────────────────────────────────────────
  {
    slug: "arroz-branco",
    name: "Arroz branco",
    d: [1, 2, 3, 4, 5],
    c: "acompanhamentos",
    short: "Arroz branco soltinho, feito todos os dias.",
    long: "O arroz branco da casa, soltinho e feito todos os dias. É a base que acompanha qualquer prato do buffet.",
  },
  {
    slug: "arroz-integral",
    name: "Arroz integral",
    d: [2, 4, 5],
    c: "acompanhamentos",
    short: "A opção integral, para quem prefere.",
    long: "Arroz integral servido no buffet, para quem prefere uma alternativa ao branco no dia a dia.",
  },
  {
    slug: "arroz-integral-com-alho-frito",
    name: "Arroz integral com alho frito",
    d: [1, 3],
    c: "acompanhamentos",
    short: "Arroz integral com alho frito por cima.",
    long: "O arroz integral ganha alho frito, que dá perfume e um toque crocante a cada garfada.",
  },
  {
    slug: "arroz-com-alho-poro",
    name: "Arroz com alho-poró",
    d: [4],
    c: "acompanhamentos",
    short: "Arroz preparado com alho-poró.",
    long: "Arroz preparado com alho-poró, uma variação mais delicada para o prato de quinta.",
  },
  {
    slug: "feijao",
    name: "Feijão",
    d: [1],
    c: "acompanhamentos",
    short: "O feijão da casa, no ponto.",
    long: "O feijão da casa, cozido no ponto e servido quente durante todo o almoço.",
  },
  {
    slug: "feijao-carioca",
    name: "Feijão carioca",
    d: [2, 3, 4, 5],
    c: "acompanhamentos",
    short: "Feijão carioca, o de todo dia.",
    long: "O feijão carioca que acompanha o arroz na maior parte da semana, cozido no ponto e sempre quente.",
  },
  {
    slug: "feijao-preto",
    name: "Feijão preto",
    d: [3],
    c: "acompanhamentos",
    short: "Feijão preto, encorpado.",
    long: "Feijão preto, mais encorpado que o carioca, servido às quartas.",
  },
  {
    slug: "tutu-de-feijao",
    name: "Tutu de feijão",
    d: [1],
    c: "acompanhamentos",
    short: "Tutu cremoso para abrir a semana.",
    long: "O tutu de feijão, cremoso e encorpado, é o acompanhamento que abre a semana no buffet.",
  },

  // ── Carnes ─────────────────────────────────────────────────────────────
  {
    slug: "picanha-suina-assada",
    name: "Picanha suína assada",
    d: [1],
    c: "carnes",
    short: "Macia e saborosa, direto do forno.",
    long: "Picanha suína assada, macia e saborosa, perfeita para acompanhar o buffet do dia.",
  },
  {
    slug: "torresmo",
    name: "Torresmo",
    d: [1],
    c: "carnes",
    short: "Crocante, do jeito que tem que ser.",
    long: "Torresmo crocante, servido às segundas — o acompanhamento que combina com o tutu de feijão.",
  },
  {
    slug: "torresmo-com-calabresa",
    name: "Torresmo com calabresa",
    d: [3],
    c: "carnes",
    short: "Torresmo crocante com calabresa.",
    long: "O torresmo crocante ganha a companhia da calabresa, num prato mais robusto para o meio da semana.",
  },
  {
    slug: "dobradinha",
    name: "Dobradinha",
    d: [2],
    c: "carnes",
    short: "Um clássico de terça-feira.",
    long: "A dobradinha, prato de panela que pede tempo e vira tradição de terça-feira na casa.",
  },
  {
    slug: "escondidinho-de-carne-seca",
    name: "Escondidinho de carne seca",
    d: [2],
    c: "carnes",
    short: "Carne seca sob purê gratinado.",
    long: "Escondidinho de carne seca, servido gratinado e quente direto da travessa.",
  },
  {
    slug: "strogonoff-de-carne",
    name: "Strogonoff de carne",
    d: [2],
    c: "carnes",
    short: "Cremoso, do jeito que todo mundo gosta.",
    long: "O strogonoff de carne, cremoso e reconfortante, um dos pratos mais procurados do buffet.",
  },
  {
    slug: "strogonoff-de-calabresa",
    name: "Strogonoff de calabresa",
    d: [5],
    c: "carnes",
    short: "A versão de calabresa, para fechar a semana.",
    long: "A versão com calabresa do nosso strogonoff, cremosa e marcante, servida às sextas.",
  },
  {
    slug: "hamburguer-de-picanha",
    name: "Hambúrguer de picanha",
    d: [3],
    c: "carnes",
    short: "Hambúrguer feito de picanha.",
    long: "Hambúrguer de picanha, suculento, uma opção diferente no meio da semana.",
  },
  {
    slug: "bife-a-parmegiana",
    name: "Bife à parmegiana",
    d: [4],
    c: "carnes",
    short: "Empanado, com molho e queijo.",
    long: "O bife à parmegiana, empanado e coberto com molho e queijo derretido, no calor da travessa.",
  },
  {
    slug: "panqueca-de-carne",
    name: "Panqueca de carne",
    d: [4],
    c: "carnes",
    short: "Panqueca recheada com carne.",
    long: "Panqueca recheada com carne, servida com molho, uma das opções de quinta-feira.",
  },
  {
    slug: "pernil-assado",
    name: "Pernil assado",
    d: [4],
    c: "carnes",
    short: "Assado lentamente, macio.",
    long: "Pernil assado, macio e suculento, cortado na hora de servir.",
  },
  {
    slug: "carne-assada",
    name: "Carne assada",
    d: [5],
    c: "carnes",
    short: "Carne assada no ponto certo.",
    long: "Carne assada no ponto, servida em fatias generosas para fechar a semana.",
  },

  // ── Frangos ────────────────────────────────────────────────────────────
  {
    slug: "frango-grelhado",
    name: "Frango grelhado",
    d: [1, 3, 4],
    c: "frangos",
    short: "Simples e no ponto, três vezes por semana.",
    long: "Frango grelhado, leve e no ponto. Sai três vezes por semana e é a escolha de quem quer algo mais simples.",
  },
  {
    slug: "frango-a-parmegiana",
    name: "Frango à parmegiana",
    d: [1],
    c: "frangos",
    short: "Empanado, com molho e queijo.",
    long: "Frango à parmegiana, empanado e gratinado com molho e queijo, servido às segundas.",
  },
  {
    slug: "frango-xadrez",
    name: "Frango xadrez",
    d: [2],
    c: "frangos",
    short: "Frango em cubos, colorido.",
    long: "Frango xadrez, em cubos e colorido, uma opção mais leve entre os pratos de terça.",
  },
  {
    slug: "file-de-frango",
    name: "Filé de frango",
    d: [2],
    c: "frangos",
    short: "Filé de frango do dia.",
    long: "Filé de frango preparado no dia, uma opção direta para quem prefere o simples bem-feito.",
  },
  {
    slug: "file-de-frango-grelhado",
    name: "Filé de frango grelhado",
    d: [5],
    c: "frangos",
    short: "Grelhado, leve, para a sexta.",
    long: "Filé de frango grelhado, leve e no ponto, entre as opções de sexta-feira.",
  },
  {
    slug: "sobrecoxa-assada",
    name: "Sobrecoxa assada",
    d: [5],
    c: "frangos",
    short: "Assada, dourada por fora.",
    long: "Sobrecoxa assada até dourar, suculenta por dentro — uma das carnes de sexta.",
  },

  // ── Peixes e frutos do mar ─────────────────────────────────────────────
  {
    slug: "linguado-ao-molho-de-camarao",
    name: "Linguado ao molho de camarão",
    d: [1],
    c: "peixes-e-frutos-do-mar",
    short: "Linguado servido ao molho de camarão.",
    long: "Linguado servido ao molho de camarão, um dos pratos mais elegantes da segunda-feira.",
  },
  {
    slug: "linguado-grelhado",
    name: "Linguado grelhado",
    d: [3],
    c: "peixes-e-frutos-do-mar",
    short: "Peixe grelhado, leve.",
    long: "Linguado grelhado, leve e delicado, para quem quer peixe no meio da semana.",
  },
  {
    slug: "anchova-assada",
    name: "Anchova assada",
    d: [4],
    c: "peixes-e-frutos-do-mar",
    short: "Anchova assada no forno.",
    long: "Anchova assada no forno, servida inteira na travessa — peixe fresco, escolhido para a quinta.",
  },
  {
    slug: "cacao-grelhado-a-meuniere",
    name: "Cação grelhado à meunière",
    d: [5],
    c: "peixes-e-frutos-do-mar",
    short: "Cação grelhado à meunière.",
    long: "Cação grelhado no preparo à meunière, clássico e delicado, servido às sextas.",
  },
  {
    slug: "salmao-assado",
    name: "Salmão assado",
    d: [5],
    c: "peixes-e-frutos-do-mar",
    short: "Salmão assado, servido em postas.",
    long: "Salmão assado, servido em postas generosas direto da travessa — um dos destaques de sexta-feira.",
  },
  {
    slug: "carne-de-siri",
    name: "Carne de siri",
    d: [5],
    c: "peixes-e-frutos-do-mar",
    short: "Carne de siri, sabor de Santos.",
    long: "Carne de siri, com o sabor de mar que combina com a sexta-feira no Centro de Santos.",
  },
  {
    slug: "iscas-crocantes-de-linguado",
    name: "Iscas crocantes de linguado",
    d: [5],
    c: "peixes-e-frutos-do-mar",
    short: "Iscas de linguado bem crocantes.",
    long: "Iscas de linguado empanadas e fritas até ficarem crocantes, servidas com limão.",
  },
  {
    slug: "tempura-com-camarao",
    name: "Tempurá com camarão",
    d: [5],
    c: "peixes-e-frutos-do-mar",
    short: "Tempurá leve, com camarão.",
    long: "Tempurá com camarão, de casquinha leve e crocante, entre as opções de sexta.",
  },

  // ── Massas e risotos ───────────────────────────────────────────────────
  {
    slug: "canelone-de-queijo-e-presunto",
    name: "Canelone de queijo e presunto",
    d: [1],
    c: "massas-e-risotos",
    short: "Canelone recheado, gratinado.",
    long: "Canelone recheado com queijo e presunto, gratinado e servido bem quente.",
  },
  {
    slug: "lasanha-tres-queijos",
    name: "Lasanha três queijos",
    d: [2],
    c: "massas-e-risotos",
    short: "Lasanha de três queijos.",
    long: "Lasanha de três queijos, gratinada até formar casquinha, servida às terças.",
  },
  {
    slug: "espaguete-a-francesa",
    name: "Espaguete à francesa",
    d: [3],
    c: "massas-e-risotos",
    short: "Espaguete no preparo à francesa.",
    long: "Espaguete preparado à francesa, opção de massa do buffet de quarta-feira.",
  },
  {
    slug: "nhoque-suino",
    name: "Nhoque suíno",
    d: [2],
    c: "massas-e-risotos",
    short: "Nhoque servido com suíno.",
    long: "Nhoque servido com carne suína, um prato encorpado para a terça-feira.",
  },
  {
    slug: "nhoque-ao-sugo",
    name: "Nhoque ao sugo",
    d: [4],
    c: "massas-e-risotos",
    short: "Nhoque ao molho sugo.",
    long: "Nhoque ao sugo, o clássico do meio da semana, servido bem quente.",
  },
  {
    slug: "risoto-de-brocolis",
    name: "Risoto de brócolis",
    d: [2],
    c: "massas-e-risotos",
    short: "Risoto cremoso de brócolis.",
    long: "Risoto de brócolis, cremoso, entre as opções sem carne do buffet de terça.",
  },
  {
    slug: "risoto-piamontese",
    name: "Risoto piamontese",
    d: [5],
    c: "massas-e-risotos",
    short: "Risoto piamontese, cremoso.",
    long: "Risoto piamontese, cremoso e delicado, abre as opções de sexta-feira.",
  },

  // ── Fritos ─────────────────────────────────────────────────────────────
  {
    slug: "salgados",
    name: "Salgados",
    d: [1, 2, 3],
    c: "fritos",
    short: "Os salgados fritos do dia.",
    long: "Os salgados fritos na hora, que saem quentes e vão direto para a travessa do buffet.",
  },
  {
    slug: "batata-frita",
    name: "Batata frita",
    d: [5],
    c: "fritos",
    short: "Batata frita, sempre quente.",
    long: "Batata frita servida quente, reposta ao longo do serviço de sexta-feira.",
  },
  {
    slug: "batata-chips",
    name: "Batata chips",
    d: [4],
    c: "fritos",
    short: "Fatias finas e crocantes.",
    long: "Batata chips, em fatias finas e crocantes, para acompanhar os pratos de quinta.",
  },

  // ── Outros ─────────────────────────────────────────────────────────────
  {
    slug: "omelete-com-calabresa",
    name: "Omelete com calabresa",
    d: [3],
    c: "outros",
    short: "Omelete recheada com calabresa.",
    long: "Omelete com calabresa, feita na chapa e servida em fatias no buffet de quarta.",
  },
  {
    slug: "batata-recheada",
    name: "Batata recheada",
    d: [4],
    c: "outros",
    short: "Batata assada e recheada.",
    long: "Batata assada e recheada, servida quente entre as opções de quinta-feira.",
  },
];

/**
 * Fotos do lote entregue pelo cliente reaproveitadas nos pratos que elas de
 * fato mostram. Conservador de propósito: uma foto de penne não ilustra
 * "espaguete à francesa", e foto errada num cardápio gera reclamação na mesa.
 * O mapa liga o slug do prato à posição da foto na galeria (1 a 17).
 */
const PHOTO_BY_SLUG = {
  "salmao-assado": 5,
  "iscas-crocantes-de-linguado": 9,
  "arroz-branco": 10,
  salgados: 14,
};

async function main() {
  loadEnv();
  const db = new PrismaClient();

  // As fotos já estão no Storage; a galeria guarda a ordem em que entraram.
  const photos = await db.galleryPhoto.findMany({
    orderBy: { order: "asc" },
    select: { image: true },
  });
  const imageFor = (slug) => {
    const pos = PHOTO_BY_SLUG[slug];
    return pos && photos[pos - 1] ? photos[pos - 1].image : "";
  };

  if (DRY) {
    const porDia = [1, 2, 3, 4, 5].map(
      (d) => `${d}: ${DISHES.filter((x) => x.d.includes(d)).length} pratos`,
    );
    console.log(`${DISHES.length} pratos, ${CATEGORIES.length} categorias`);
    console.log(porDia.join(" · "));
    console.log(
      `com foto: ${Object.keys(PHOTO_BY_SLUG).filter((s) => imageFor(s)).length}`,
    );
    console.log(
      `em mais de um dia: ${DISHES.filter((x) => x.d.length > 1).map((x) => x.slug).join(", ")}`,
    );
    await db.$disconnect();
    return;
  }

  // 1. Categorias
  const ids = {};
  for (const [i, [slug, name]] of CATEGORIES.entries()) {
    const c = await db.menuCategory.upsert({
      where: { slug },
      create: { slug, name: { pt: name }, order: i, published: true },
      update: { name: { pt: name }, order: i, published: true },
    });
    ids[slug] = c.id;
  }
  console.log(`categorias: ${CATEGORIES.length}`);

  // 2. O cardápio institucional antigo sai de cena sem ser apagado: os slugs
  //    não colidem com os novos, e despublicar é reversível pelo admin.
  const keep = new Set(DISHES.map((d) => d.slug));
  const old = await db.menuItem.findMany({ select: { slug: true } });
  const toHide = old.map((o) => o.slug).filter((s) => !keep.has(s));
  if (toHide.length > 0) {
    const { count } = await db.menuItem.updateMany({
      where: { slug: { in: toHide } },
      data: { available: false },
    });
    console.log(`despublicados: ${count} (${toHide.join(", ")})`);
  }

  // 3. Os pratos
  for (const [i, d] of DISHES.entries()) {
    const data = {
      categoryId: ids[d.c],
      name: { pt: d.name },
      description: { pt: d.short },
      descriptionLong: { pt: d.long },
      image: imageFor(d.slug),
      available: true,
      order: i,
      kind: "BUFFET",
      weekdays: d.d,
    };
    await db.menuItem.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, ...data },
      update: data,
    });
  }
  console.log(`pratos: ${DISHES.length}`);

  const comFoto = await db.menuItem.count({
    where: { available: true, NOT: { image: "" } },
  });
  console.log(`no ar: ${await db.menuItem.count({ where: { available: true } })} pratos, ${comFoto} com foto`);

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
