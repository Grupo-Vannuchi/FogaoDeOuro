/**
 * Troca a foto de um prato da vitrine — no card **e** na galeria.
 *
 * Os dois apontam para o mesmo arquivo no Storage: o card do prato e a foto da
 * galeria compartilham a URL. Trocar em só um lugar deixaria o site mostrando
 * a foto nova no card e a antiga na galeria, que é o tipo de inconsistência que
 * ninguém percebe até o cliente perguntar.
 *
 * O arquivo antigo continua no bucket de propósito: desvincular é reversível,
 * apagar não.
 *
 * Uso:
 *   node scripts/replace-photo.mjs "slug=caminho/foto.png" ... [--dry-run]
 */
import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

const DRY = process.argv.includes("--dry-run");
const entradas = process.argv.slice(2).filter((a) => a !== "--dry-run");

if (entradas.length === 0) {
  console.error('Informe ao menos um par: "slug=caminho/foto.png"');
  process.exit(1);
}

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
  if (!res.ok) throw new Error(`upload ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return `${storageBase()}/storage/v1/object/public/${bucket}/${path}`;
}

loadEnv();
const bucket = process.env.SUPABASE_BUCKET ?? "media";
const db = new PrismaClient();

for (const entrada of entradas) {
  const sep = entrada.indexOf("=");
  const slug = entrada.slice(0, sep);
  const arquivo = entrada.slice(sep + 1);

  if (!existsSync(arquivo)) {
    console.error(`FALTA o arquivo de ${slug}: ${arquivo}`);
    process.exitCode = 1;
    continue;
  }

  const item = await db.menuItem.findUnique({
    where: { slug },
    select: { image: true, name: true },
  });
  if (!item) {
    console.error(`prato não encontrado: ${slug}`);
    process.exitCode = 1;
    continue;
  }

  const webp = await sharp(arquivo)
    .rotate()
    .trim({ threshold: 12 })
    .resize({ width: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const meta = await sharp(webp).metadata();

  // Quantas fotos da galeria usam a imagem antiga — normalmente uma.
  const naGaleria = await db.galleryPhoto.count({ where: { image: item.image } });

  console.log(
    `${item.name.pt}: ${meta.width}x${meta.height} · ` +
      `${Math.round(webp.length / 1024)} KB · galeria: ${naGaleria} foto(s)`,
  );

  if (DRY) continue;

  const url = await upload(webp, bucket);
  await db.$transaction([
    db.menuItem.update({ where: { slug }, data: { image: url } }),
    db.galleryPhoto.updateMany({
      where: { image: item.image },
      data: { image: url },
    }),
  ]);
}

if (DRY) console.log("\n--dry-run: nada foi enviado nem gravado.");
await db.$disconnect();
