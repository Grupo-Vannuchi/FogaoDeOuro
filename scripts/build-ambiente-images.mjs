/**
 * Gera as fotos de ambiente que a página Horários & Reservas serve de
 * `public/ambiente`.
 *
 * Por que em `public` e não na galeria do banco: estas quatro imagens são parte
 * do layout, não conteúdo editável. O admin troca fotos da galeria; a foto que
 * ilustra o card das 11h só muda junto com o texto daquele card. Servir do
 * mesmo domínio ainda deixa o `next/image` entregar AVIF/WebP sem passar pelo
 * Storage — o mesmo raciocínio que já vale para `public/hero`.
 *
 * Uso:
 *   node scripts/build-ambiente-images.mjs <pasta-com-os-originais>
 *
 * A pasta é a mesma entregue pelo cliente em 24/08/2026 e usada por
 * `import-gallery-photos.mjs` — os nomes abaixo são os arquivos daquele lote.
 */
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = join("public", "ambiente");

/**
 * Cada foto casada com o momento que ela ilustra. A escolha não é decorativa:
 * o card das 11h mostra o buffet cheio porque é disso que o texto fala, e o das
 * 13h30 mostra o salão vazio porque promete tranquilidade.
 *
 * `width` acompanha o uso: a do topo atravessa a página, as dos cards ocupam
 * um terço da grade no desktop — 800px cobre telas 2x sem peso desnecessário.
 */
const IMAGES = [
  {
    file: "WhatsApp Image 2026-08-24 at 10.48.40 (1).jpeg",
    out: "salao.webp",
    width: 1600,
    note: "salão · mosaico — abertura da página",
  },
  {
    file: "WhatsApp Image 2026-08-24 at 10.48.17.jpeg",
    out: "horario-11h.webp",
    width: 800,
    note: "buffet de saladas — 11h, recém-montado",
  },
  {
    file: "WhatsApp Image 2026-08-24 at 10.48.41 (1).jpeg",
    out: "horario-11h30.webp",
    width: 800,
    note: "servindo-se no buffet — 11h30 às 13h30",
  },
  // O card das 13h e o fundo da seção de eventos saíram deste lote. A foto do
  // salão dos fundos pegava a porta do banheiro e foi vetada pelo cliente, e
  // ela servia aos dois lugares. As substitutas vieram do Storage, não da pasta
  // de originais, e este script NÃO as regenera:
  //   • `picanha-na-brasa.webp` 800×450 — card das 13h
  //   • `salao-mesas.webp`   1800×561 — fundo da seção de eventos
  // Ambas cortadas de arquivos 1600×900 do bucket.
];

const dir = process.argv[2];
if (!dir || !existsSync(dir)) {
  console.error("Informe a pasta com os originais do cliente.");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

for (const { file, out, width, note } of IMAGES) {
  const src = join(dir, file);
  if (!existsSync(src)) {
    console.error(`FALTA: ${file}`);
    process.exitCode = 1;
    continue;
  }
  // 16:9 em todas: os quatro cortes precisam conversar entre si, e o formato
  // baixo mantém a seção leve — o pedido era ilustrar, não dominar a página.
  // `trim` remove a moldura branca que veio em parte do lote e não faz nada nas
  // fotos que já estão cheias.
  const buf = await sharp(src)
    .rotate()
    .trim({ threshold: 12 })
    .resize({ width, height: Math.round((width * 9) / 16), fit: "cover", position: "attention" })
    .webp({ quality: 80 })
    .toBuffer();

  await sharp(buf).toFile(join(OUT, out));
  const meta = await sharp(buf).metadata();
  console.log(
    `${out.padEnd(20)} ${meta.width}x${meta.height} · ${Math.round(buf.length / 1024)} KB — ${note}`,
  );
}
