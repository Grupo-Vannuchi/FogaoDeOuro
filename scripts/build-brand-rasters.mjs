/**
 * Rasterises the brand SVGs into the PNGs that `next/og` embeds.
 *
 * `ImageResponse` (satori) cannot resolve `url(#gradient)` references from an
 * external SVG, and every piece of this logo is a gradient — so the icon and
 * Open Graph routes embed a PNG instead, per the Next.js docs for local images
 * (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`).
 *
 * Run with `npm run brand:rasters` after changing anything in `public/brand/`.
 * The outputs are committed, so a normal build never needs this.
 */
import sharp from "sharp";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const BRAND = join(process.cwd(), "public", "brand");

/** Rendered well above their display size so downscaling stays crisp. */
const jobs = [
  { from: "symbol.svg", to: "symbol.png", width: 512 },
  { from: "logo-dark.svg", to: "lockup.png", width: 1000 },
];

for (const { from, to, width } of jobs) {
  const svg = await readFile(join(BRAND, from));
  const out = join(BRAND, to);

  // `density` drives the rasteriser's internal resolution; without it sharp
  // renders at the SVG's nominal size first and the upscale shows.
  await sharp(svg, { density: 600 })
    .resize({ width })
    .png({ compressionLevel: 9 })
    .toFile(out);

  const { width: w, height: h } = await sharp(out).metadata();
  const { size } = await stat(out);
  console.log(`${to.padEnd(14)} ${w}x${h}  ${(size / 1024).toFixed(1)} KB`);
}
