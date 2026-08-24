/**
 * Recadastra o cardápio institucional (`/gastronomia`) a partir das fotos que o
 * cliente entregou: cada prato passa a ser um prato que existe numa foto, com o
 * nome do que está na imagem.
 *
 * O catálogo anterior era genérico — "Picanha", "Maminha", "Fraldinha",
 * "Feijoada" — e nenhum tinha foto: a página virava uma parede de cards de
 * texto. Aqui o vínculo é invertido: parte-se da foto e nomeia-se o prato que
 * ela mostra, então todo card publicado tem imagem.
 *
 * As fotos de comida JÁ estão no Storage — foram enviadas como galeria por
 * `import-gallery-photos.mjs` — e são reaproveitadas pela URL, sem reprocessar
 * nem duplicar objetos no bucket. Só as duas que faltavam (o pudim e o espeto
 * de carnes, ambas do lote do hero) sobem aqui, no preset `cover` do admin.
 *
 * Os 13 itens antigos são despublicados, não apagados: somem do site e
 * continuam no admin, caso o restaurante queira algum de volta.
 *
 * Uso:
 *   node scripts/import-menu-photos.mjs [--dry-run]
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

/** Pasta onde o cliente deixou os originais. */
const SOURCE_DIR =
  "C:/Users/Usuario/OneDrive - Moraes Vannuchi/Documentos/GitHub/foagaodeouroimgs";

/**
 * As duas fotos que ainda não estavam no bucket. Vieram no lote de 20/08, o
 * mesmo do hero — por isso não entraram na importação da galeria.
 */
const NEW_PHOTOS = {
  pudim: "WhatsApp Image 2026-08-20 at 16.01.13 (2).jpeg",
  carnes: "WhatsApp Image 2026-08-20 at 16.01.14.jpeg",
};

/**
 * Cada prato aponta para a foto pela POSIÇÃO dela na galeria (`GalleryPhoto.order`),
 * que é a ordem declarada em `import-gallery-photos.mjs` — o comentário de cada
 * linha lá diz o que a foto mostra, e é daí que sai este pareamento.
 *
 * `photo: "pudim" | "carnes"` usa uma das duas enviadas por este script.
 *
 * As descrições descrevem só o que a foto mostra. Nada de ingrediente
 * inventado: o restaurante não informou receitas.
 */
const CATALOG = [
  {
    category: "da-brasa",
    items: [
      {
        slug: "picanha-na-brasa",
        name: "Picanha na brasa",
        description: "Picanha assada no espeto e fatiada na hora, no ponto que você pedir.",
        photo: 0, // picanha no espeto
      },
      {
        slug: "carnes-na-brasa",
        name: "Carnes na brasa",
        description: "Cortes e linguiça girando no espeto, servidos quentes ao longo do almoço.",
        photo: "carnes",
      },
      {
        slug: "frango-assado",
        name: "Frango assado",
        description: "Frango assado, dourado e finalizado com cebolinha.",
        photo: 6, // frango assado
      },
    ],
  },
  {
    category: "buffet",
    items: [
      {
        slug: "buffet-de-saladas",
        name: "Buffet de saladas",
        description: "Saladas frescas montadas todos os dias, com variedade para montar o prato.",
        photo: 2, // buffet de saladas
      },
      {
        slug: "legumes-e-conservas",
        name: "Legumes e conservas",
        description: "Legumes, conservas e acompanhamentos repostos ao longo do serviço.",
        photo: 14, // buffet de legumes
      },
      {
        slug: "arroz-e-feijao",
        name: "Arroz e feijão",
        description: "Arroz soltinho e feijão, feitos todo dia.",
        photo: 9, // arroz e feijão nas panelas
      },
      {
        slug: "salmao-assado",
        name: "Salmão assado",
        description: "Salmão assado, servido em posta.",
        photo: 4, // salmão assado
      },
      {
        slug: "iscas-de-peixe-empanadas",
        name: "Iscas de peixe empanadas",
        description: "Iscas de peixe empanadas e crocantes, com molho à parte.",
        photo: 8, // iscas empanadas
      },
      {
        slug: "salgados",
        name: "Salgados",
        description: "Pastéis fritos na hora.",
        photo: 13, // pastéis
      },
      {
        slug: "rondelli-gratinado",
        name: "Rondelli gratinado",
        description: "Rondelli gratinado, servido com salada.",
        photo: 10, // gratinado com salada
      },
      {
        slug: "penne-ao-sugo",
        name: "Penne ao sugo",
        description: "Penne ao sugo, finalizado com queijo ralado.",
        photo: 7, // penne ao sugo
      },
      {
        slug: "penne-ao-molho-branco",
        name: "Penne ao molho branco",
        description: "Penne ao molho branco, com azeitonas e um punhado de folhas por cima.",
        photo: 12, // penne ao molho branco
      },
    ],
  },
  {
    category: "sobremesas",
    items: [
      {
        slug: "pudim",
        name: "Pudim",
        description: "Pudim de leite com calda de caramelo.",
        photo: "pudim",
      },
      {
        slug: "torta-de-limao",
        name: "Torta de limão",
        description: "Torta de limão gelada, com raspas por cima.",
        photo: 15, // torta de limão
      },
      {
        slug: "salada-de-frutas-fresca",
        name: "Salada de frutas",
        description: "Frutas da estação picadas na hora.",
        photo: 16, // salada de frutas
      },
    ],
  },
];

/** O CLI do Prisma carrega o `.env` sozinho; um script solto, não. */
function loadEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

function storageBase() {
  return process.env.SUPABASE_URL.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
}

/**
 * Mesmo preset `cover` do admin (`lib/storage.ts`): 1200x675 WebP q80. Manter
 * os dois em sincronia importa — uma foto enviada por aqui e outra pelo painel
 * têm de sair do mesmo tamanho, senão o grid fica irregular.
 */
async function uploadCover(file, dryRun) {
  const buf = await sharp(file)
    .rotate()
    .resize({ width: 1200, height: 675, fit: "cover", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const path = `covers/${randomUUID()}.webp`;
  const url = `${storageBase()}/storage/v1/object/public/${process.env.SUPABASE_BUCKET || "media"}/${path}`;
  if (dryRun) return `${url} (dry-run, não enviado)`;

  const res = await fetch(
    `${storageBase()}/storage/v1/object/${process.env.SUPABASE_BUCKET || "media"}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
        apikey: process.env.SUPABASE_SECRET_KEY,
        "Content-Type": "image/webp",
        "cache-control": "public, max-age=31536000, immutable",
      },
      body: new Uint8Array(buf),
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!res.ok) {
    throw new Error(`upload falhou (${res.status}): ${(await res.text()).slice(0, 200)}`);
  }
  return url;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  loadEnv();
  const db = new PrismaClient();

  // As fotos de comida, na ordem em que foram importadas para a galeria.
  const gallery = await db.galleryPhoto.findMany({
    orderBy: { order: "asc" },
    select: { order: true, image: true },
  });
  const byOrder = new Map(gallery.map((p) => [p.order, p.image]));
  console.log(`galeria: ${gallery.length} fotos disponíveis para reaproveitar`);

  // Sobe só o que falta no bucket.
  const uploaded = {};
  for (const [key, filename] of Object.entries(NEW_PHOTOS)) {
    const file = join(SOURCE_DIR, filename);
    if (!existsSync(file)) throw new Error(`não encontrei: ${file}`);
    uploaded[key] = await uploadCover(file, dryRun);
    console.log(`enviada  ${key}: ${uploaded[key]}`);
  }

  const categories = await db.menuCategory.findMany({ select: { id: true, slug: true } });
  const categoryId = new Map(categories.map((c) => [c.slug, c.id]));

  const keep = new Set(CATALOG.flatMap((c) => c.items.map((i) => i.slug)));

  if (!dryRun) {
    // Despublicar, não apagar: some do site, continua no admin.
    const hidden = await db.menuItem.updateMany({
      where: { slug: { notIn: [...keep] } },
      data: { available: false },
    });
    console.log(`\ndespublicados ${hidden.count} itens antigos`);
  }

  for (const group of CATALOG) {
    const catId = categoryId.get(group.category);
    if (!catId) throw new Error(`categoria inexistente: ${group.category}`);
    console.log(`\n[${group.category}]`);

    for (const [i, item] of group.items.entries()) {
      const image =
        typeof item.photo === "number" ? byOrder.get(item.photo) : uploaded[item.photo];
      if (!image) throw new Error(`sem foto para ${item.slug} (photo: ${item.photo})`);

      const data = {
        categoryId: catId,
        name: { pt: item.name },
        description: { pt: item.description },
        image,
        available: true,
        order: i,
        tags: [],
        weekday: null,
      };

      if (dryRun) {
        console.log(`   ${item.slug} → ${item.name}`);
        continue;
      }
      await db.menuItem.upsert({
        where: { slug: item.slug },
        create: { slug: item.slug, ...data },
        update: data,
      });
      console.log(`   ${item.slug} → ${item.name}`);
    }
  }

  const published = await db.menuItem.count({ where: { available: true } });
  const withPhoto = await db.menuItem.count({
    where: { available: true, NOT: { image: "" } },
  });
  console.log(`\npublicados: ${published} · com foto: ${withPhoto}`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
