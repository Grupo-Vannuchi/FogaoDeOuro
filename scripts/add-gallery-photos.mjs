/**
 * Acrescenta fotos à galeria sem mexer nas que já estão lá.
 *
 * Diferente de `import-gallery-photos.mjs`, que carrega um lote inteiro na
 * ordem de uma lista fixa, este recebe arquivos avulsos pela linha de comando —
 * o caso de quando o restaurante manda mais duas ou três fotos.
 *
 * Uso:
 *   node scripts/add-gallery-photos.mjs "caminho/foto.png=Legenda da foto" ...
 *   node scripts/add-gallery-photos.mjs --dry-run "caminho/foto.png=Legenda"
 *
 * A legenda é opcional (`caminho/foto.png` sozinho entra sem legenda). As fotos
 * vão para o fim da galeria, na ordem em que forem passadas.
 */
import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

const DRY = process.argv.includes("--dry-run");
const entradas = process.argv.slice(2).filter((a) => a !== "--dry-run");

if (entradas.length === 0) {
  console.error('Informe ao menos um arquivo: "caminho/foto.png=Legenda"');
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
  if (!res.ok) {
    throw new Error(`upload ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return `${storageBase()}/storage/v1/object/public/${bucket}/${path}`;
}

loadEnv();
const bucket = process.env.SUPABASE_BUCKET ?? "media";
const db = new PrismaClient();

// As novas entram depois das existentes; a prévia da Experiência escolhe
// posições alternadas, então a ordem importa e não pode colidir.
const ultima = await db.galleryPhoto.aggregate({ _max: { order: true } });
let ordem = (ultima._max.order ?? -1) + 1;

for (const entrada of entradas) {
  const sep = entrada.lastIndexOf("=");
  const arquivo = sep > 1 ? entrada.slice(0, sep) : entrada;
  const legenda = sep > 1 ? entrada.slice(sep + 1) : "";

  if (!existsSync(arquivo)) {
    console.error(`FALTA: ${arquivo}`);
    process.exitCode = 1;
    continue;
  }

  const antes = await sharp(arquivo).metadata();
  // Mesmo tratamento do lote original: corta moldura de cor uniforme, se
  // houver, e reencoda no preset da galeria.
  const webp = await sharp(arquivo)
    .rotate()
    .trim({ threshold: 12 })
    .resize({ width: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const depois = await sharp(webp).metadata();

  console.log(
    `${antes.width}x${antes.height} → ${depois.width}x${depois.height} · ` +
      `${Math.round(webp.length / 1024)} KB · ordem ${ordem}` +
      (legenda ? ` · "${legenda}"` : " · sem legenda"),
  );

  if (!DRY) {
    const url = await upload(webp, bucket);
    await db.galleryPhoto.create({
      data: {
        image: url,
        caption: legenda ? { pt: legenda } : {},
        order: ordem,
        published: true,
      },
    });
  }
  ordem += 1;
}

if (DRY) console.log("\n--dry-run: nada foi enviado nem gravado.");
else console.log(`\ngaleria agora tem ${await db.galleryPhoto.count()} fotos.`);

await db.$disconnect();
