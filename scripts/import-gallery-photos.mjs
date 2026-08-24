/**
 * Importa fotos do cliente para a galeria (`GalleryPhoto` + Supabase Storage).
 *
 * Faz, por foto: corta a moldura branca (as fotos vieram 16:9 com pillarbox
 * quando o original era 4:3), reencoda em WebP no mesmo preset do admin
 * (`gallery`: largura máx. 1600, proporção preservada) e sobe para o bucket.
 * A ordem dos registros é a ordem de `PHOTOS` abaixo — ela importa, porque a
 * prévia da Experiência (`components/sections/gallery-preview.tsx`) escolhe
 * posições alternadas dessa lista.
 *
 * Uso:
 *   node scripts/import-gallery-photos.mjs <pasta> [--replace] [--dry-run]
 *
 * `--replace` apaga os registros de galeria existentes antes de inserir. Os
 * arquivos antigos permanecem no Storage de propósito: desvincular é
 * reversível, apagar não.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

/**
 * Curadoria: as posições 2, 4 e 6 (índices 1, 3, 5) são as que aparecem na
 * página Experiência, então são de salão e serviço — três pratos ali seria
 * uma prévia redundante da própria galeria.
 */
const PHOTOS = [
  "WhatsApp Image 2026-08-24 at 10.48.16.jpeg",       //  1 picanha no espeto
  "WhatsApp Image 2026-08-24 at 10.48.40 (1).jpeg",   //  2 salão · mosaico      → Experiência
  "WhatsApp Image 2026-08-24 at 10.48.17.jpeg",       //  3 buffet de saladas
  "WhatsApp Image 2026-08-24 at 10.48.17 (2).jpeg",   //  4 salão · luminárias   → Experiência
  "WhatsApp Image 2026-08-24 at 10.48.40 (2).jpeg",   //  5 salmão assado
  "WhatsApp Image 2026-08-24 at 10.48.41 (1).jpeg",   //  6 servindo-se no buffet→ Experiência
  "WhatsApp Image 2026-08-24 at 10.48.16 (1).jpeg",   //  7 frango assado
  "WhatsApp Image 2026-08-24 at 10.48.17 (1).jpeg",   //  8 penne ao sugo
  "WhatsApp Image 2026-08-24 at 10.48.38.jpeg",       //  9 iscas empanadas
  "WhatsApp Image 2026-08-24 at 10.48.42 (1).jpeg",   // 10 arroz e feijão
  "WhatsApp Image 2026-08-24 at 10.48.38 (1).jpeg",   // 11 gratinado com salada
  "WhatsApp Image 2026-08-24 at 10.48.41.jpeg",       // 12 buffet · iscas e salada
  "WhatsApp Image 2026-08-24 at 10.48.39 (1).jpeg",   // 13 penne ao molho branco
  "WhatsApp Image 2026-08-24 at 10.48.40.jpeg",       // 14 pastéis
  "WhatsApp Image 2026-08-24 at 10.48.43.jpeg",       // 15 buffet de legumes
  "WhatsApp Image 2026-08-24 at 10.48.39.jpeg",       // 16 torta de limão
  "WhatsApp Image 2026-08-24 at 10.48.42.jpeg",       // 17 salada de frutas
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

async function upload(webp, bucket) {
  const path = `gallery/${randomUUID()}.webp`;
  const res = await fetch(`${storageBase()}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
      apikey: process.env.SUPABASE_SECRET_KEY,
      "Content-Type": "image/webp",
      "cache-control": "public, max-age=31536000, immutable",
    },
    body: new Uint8Array(webp),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`upload ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return `${storageBase()}/storage/v1/object/public/${bucket}/${path}`;
}

async function main() {
  loadEnv();
  const dir = process.argv[2];
  const replace = process.argv.includes("--replace");
  const dryRun = process.argv.includes("--dry-run");
  if (!dir) throw new Error("informe a pasta de origem");
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY ausentes");
  }
  const bucket = process.env.SUPABASE_BUCKET || "media";

  // Falha antes de escrever qualquer coisa se algum arquivo não estiver lá.
  const missing = PHOTOS.filter((f) => !existsSync(join(dir, f)));
  if (missing.length) throw new Error(`não encontrados:\n  ${missing.join("\n  ")}`);

  const db = new PrismaClient();
  try {
    const urls = [];
    for (const [i, file] of PHOTOS.entries()) {
      const src = join(dir, file);
      const before = await sharp(src).metadata();
      // `trim` corta bordas de cor uniforme. Nas fotos sem moldura ele não
      // encontra o que cortar e devolve a imagem intacta — daí ser seguro
      // aplicar em todas.
      const webp = await sharp(src)
        .rotate()
        .trim({ threshold: 12 })
        .resize({ width: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      const after = await sharp(webp).metadata();
      const cropped = after.width !== before.width || after.height !== before.height;
      console.log(
        `${String(i + 1).padStart(2)} ${before.width}x${before.height} → ${after.width}x${after.height}` +
          `${cropped ? " (moldura cortada)" : ""} · ${Math.round(webp.length / 1024)} KB`,
      );
      if (!dryRun) urls.push(await upload(webp, bucket));
    }

    if (dryRun) return console.log("\n--dry-run: nada foi escrito");

    if (replace) {
      const { count } = await db.galleryPhoto.deleteMany({ where: {} });
      console.log(`\nregistros antigos removidos: ${count}`);
    }
    await db.galleryPhoto.createMany({
      data: urls.map((image, order) => ({ image, order, published: true })),
    });
    console.log(`fotos cadastradas: ${urls.length}`);
  } finally {
    await db.$disconnect();
  }
}

await main();
