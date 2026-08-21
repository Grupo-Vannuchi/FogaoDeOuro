/**
 * Vetoriza a logo do rebrand (raster -> SVG) e emite os três cortes que o site
 * consome. Rodado uma vez, em 21/08/2026; os SVG resultantes são commitados.
 *
 *   npm i -D potrace svgo && node scripts/vectorize-logo.mjs
 *
 * ⚠️ `potrace` e `svgo` NÃO estão no package.json: servem só a este script
 * pontual, e carregá-los no projeto inteiro para um uso de uma vez não paga.
 *
 * ── Por que vetorizar, em vez de usar o raster ───────────────────────────────
 * O cliente entregou o rebrand só como JPEG (2682x1568) — não houve entrega de
 * vetor. Sem SVG: o header, que mostra a marca a 44px, ficaria borrado; o fundo
 * creme viria queimado no arquivo; e o corte de tagline clara para fundo escuro
 * seria impossível, porque não se repinta um pixel achatado.
 *
 * ── Por que este traçado funciona ────────────────────────────────────────────
 * A arte é tipografia chapada sobre creme e a separação figura/fundo é perfeita:
 * 92,7% dos pixels são fundo, a tinta fica toda a uma distância de cor acima de
 * 200, e entre 20 e 199 sobra 0,87% (antialiasing e a sombra suave). Qualquer
 * corte entre 60 e 190 separa os dois; usamos 120.
 *
 * A geometria vai para o potrace. A COR é medida à parte e reproduzida como
 * <linearGradient> nativo — traçar cores direto produz bandas.
 *
 * ── Gradiente por letra, não global ──────────────────────────────────────────
 * A arte reinicia a queda de vermelho para laranja a cada caractere. Um único
 * gradiente global deixava 25,7/441 de erro no MIOLO das letras — não na borda,
 * onde erro é antialiasing e não se enxerga. Rotular componentes conexos e
 * ajustar um gradiente por letra levou o erro total de 1,27% para 0,18% dos
 * pixels, contra o JPEG original.
 *
 * ── O corte por posição, não por brilho ──────────────────────────────────────
 * O marrom do "RESTAURANTE" (luminância ≈78) e o vermelho profundo do "F" (≈85)
 * se sobrepõem: dividir por brilho misturaria os dois. Mas há 68px de creme puro
 * entre o wordmark (y 252–1210) e a tagline (y 1278–1334) — daí `splitY`.
 */
import sharp from "sharp";
import { trace } from "potrace";
import { optimize } from "svgo";
import { promisify } from "node:util";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const traceAsync = promisify(trace);

const SRC = join(
  process.cwd(),
  "docs/Logos-fogao_de_Ouro/rebrand-2026-08/logo-principal.jpg",
);
const BRAND = join(process.cwd(), "public", "brand");
/** Creme do tema claro (`site.ts`) — a tagline do corte escuro vira esta cor. */
const CREAM = "#EFE9C2";

const hex2 = (v) =>
  Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
const toHex = (r, g, b) => `#${hex2(r)}${hex2(g)}${hex2(b)}`;

/** Componentes conexos (8-vizinhos): cada letra vira um, e ganha seu gradiente. */
function labelComponents(mask, w, h, minArea) {
  const seen = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  const out = [];

  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || seen[start]) continue;
    let sp = 0;
    stack[sp++] = start;
    seen[start] = 1;
    const px = [];
    let x0 = w,
      y0 = h,
      x1 = 0,
      y1 = 0;

    while (sp) {
      const p = stack[--sp];
      const x = p % w,
        y = (p / w) | 0;
      px.push(p);
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx,
            ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const q = ny * w + nx;
          if (mask[q] && !seen[q]) {
            seen[q] = 1;
            stack[sp++] = q;
          }
        }
    }
    if (px.length >= minArea) out.push({ px, x0, y0, x1, y1 });
  }
  // Ordem de leitura: mantém o SVG estável entre execuções.
  out.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
  return out;
}

/** Regride a cor contra a posição; devolve null se a variação for ruído. */
function fitGradient(px, stops, minSpread = 14) {
  const n = px.length;
  const mean = (k) => px.reduce((s, p) => s + p[k], 0) / n;
  const mx = mean("x"),
    my = mean("y");

  let sxx = 0,
    syy = 0,
    sxy = 0;
  for (const p of px) {
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
    sxy += (p.x - mx) * (p.y - my);
  }
  const det = sxx * syy - sxy * sxy;
  if (!det) return null;

  // (dC/dx, dC/dy) somado nos três canais aponta a direção do degradê.
  let gx = 0,
    gy = 0;
  for (const k of ["r", "g", "b"]) {
    const mc = mean(k);
    let sxc = 0,
      syc = 0;
    for (const p of px) {
      sxc += (p.x - mx) * (p[k] - mc);
      syc += (p.y - my) * (p[k] - mc);
    }
    gx += (syy * sxc - sxy * syc) / det;
    gy += (sxx * syc - sxy * sxc) / det;
  }
  const norm = Math.hypot(gx, gy);
  if (!norm) return null;
  const ux = gx / norm,
    uy = gy / norm;

  const proj = px.map((p) => ({ t: (p.x - mx) * ux + (p.y - my) * uy, p }));
  const ts = proj.map((o) => o.t).sort((a, b) => a - b);
  const lo = ts[Math.floor(ts.length * 0.02)],
    hi = ts[Math.floor(ts.length * 0.98)];
  if (hi - lo < 1) return null;

  const bins = Array.from({ length: stops }, () => ({ r: 0, g: 0, b: 0, n: 0 }));
  for (const { t, p } of proj) {
    const k = Math.max(
      0,
      Math.min(stops - 1, Math.round(((t - lo) / (hi - lo)) * (stops - 1))),
    );
    bins[k].r += p.r;
    bins[k].g += p.g;
    bins[k].b += p.b;
    bins[k].n++;
  }
  const cols = bins.map((b) =>
    b.n ? [b.r / b.n, b.g / b.n, b.b / b.n] : null,
  );
  for (let i = 0; i < cols.length; i++) if (!cols[i]) cols[i] = cols.find(Boolean);

  // Pontas quase iguais = gradiente de ruído. Cor chapada fica mais limpa.
  const spread = Math.hypot(
    cols[0][0] - cols.at(-1)[0],
    cols[0][1] - cols.at(-1)[1],
    cols[0][2] - cols.at(-1)[2],
  );
  if (spread < minSpread) return null;

  return {
    x1: mx + ux * lo,
    y1: my + uy * lo,
    x2: mx + ux * hi,
    y2: my + uy * hi,
    colors: cols.map((c) => toHex(...c)),
  };
}

const meanHex = (px) =>
  toHex(
    px.reduce((s, p) => s + p.r, 0) / px.length,
    px.reduce((s, p) => s + p.g, 0) / px.length,
    px.reduce((s, p) => s + p.b, 0) / px.length,
  );

/** Traça uma máscara recortada; o path volta em coordenadas locais do recorte. */
async function tracePath(mask, w, h, turdSize) {
  const png = await sharp(mask, { raw: { width: w, height: h, channels: 1 } })
    .negate() // potrace enxerga preto como tinta
    .png()
    .toBuffer();
  const svg = await traceAsync(png, {
    threshold: 128,
    turdSize, // descarta cocorinhas: ruído de JPEG
    alphaMax: 1, // preserva as quinas vivas das serifas
    optCurve: true,
    optTolerance: 0.2,
  });
  return [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(" ");
}

async function traceLogo(src, opts) {
  const { bgTolerance, splitY, turdSize, minArea, stops, perComponent } = opts;

  const { data, info } = await sharp(src)
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  // Fundo = mediana da moldura de 12px.
  const border = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (x > 11 && x < w - 12 && y > 11 && y < h - 12) continue;
      const i = (y * w + x) * ch;
      border.push([data[i], data[i + 1], data[i + 2]]);
    }
  const med = (k) =>
    border.map((p) => p[k]).sort((a, b) => a - b)[border.length >> 1];
  const bg = [med(0), med(1), med(2)];

  const masks = { warm: new Uint8Array(w * h), dark: new Uint8Array(w * h) };
  const colorAt = new Map();
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      if (Math.hypot(r - bg[0], g - bg[1], b - bg[2]) < bgTolerance) continue;
      masks[splitY != null && y >= splitY ? "dark" : "warm"][y * w + x] = 1;
      colorAt.set(y * w + x, [r, g, b]);
    }

  const shapes = [];
  for (const layer of ["warm", "dark"]) {
    const mask = masks[layer];
    let comps;
    if (perComponent[layer]) {
      comps = labelComponents(mask, w, h, minArea);
    } else {
      // Camada inteira como uma forma só, com a caixa medida na tinta real.
      const px = [];
      let x0 = w,
        y0 = h,
        x1 = 0,
        y1 = 0;
      for (let k = 0; k < w * h; k++) {
        if (!mask[k]) continue;
        px.push(k);
        const x = k % w,
          y = (k / w) | 0;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
      comps = px.length ? [{ px, x0, y0, x1, y1 }] : [];
    }

    for (const c of comps) {
      const pad = 2;
      const cx0 = Math.max(0, c.x0 - pad),
        cy0 = Math.max(0, c.y0 - pad);
      const cw = Math.min(w - 1, c.x1 + pad) - cx0 + 1;
      const chh = Math.min(h - 1, c.y1 + pad) - cy0 + 1;

      const sub = Buffer.alloc(cw * chh, 0);
      const px = [];
      for (const k of c.px) {
        const x = k % w,
          y = (k / w) | 0;
        sub[(y - cy0) * cw + (x - cx0)] = 255;
        const [r, g, b] = colorAt.get(k);
        px.push({ x: x - cx0, y: y - cy0, r, g, b });
      }
      const d = await tracePath(sub, cw, chh, turdSize);
      if (!d) continue;
      const grad = px.length >= 1500 ? fitGradient(px, stops) : null;
      shapes.push({
        layer,
        d,
        tx: cx0,
        ty: cy0,
        grad,
        flat: grad ? null : meanHex(px),
        n: px.length,
      });
    }
  }
  return { w, h, bg, shapes };
}

/** Caixa justa das formas escolhidas, lida dos próprios paths. */
function bboxOf(shapes) {
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  for (const s of shapes) {
    const nums = s.d.match(/-?\d+(\.\d+)?/g).map(Number);
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = nums[i] + s.tx,
        y = nums[i + 1] + s.ty;
      if (x < b.x0) b.x0 = x;
      if (x > b.x1) b.x1 = x;
      if (y < b.y0) b.y0 = y;
      if (y > b.y1) b.y1 = y;
    }
  }
  return {
    x0: Math.floor(b.x0),
    y0: Math.floor(b.y0),
    x1: Math.ceil(b.x1),
    y1: Math.ceil(b.y1),
  };
}

function toSvg(shapes, box, id) {
  const defs = [],
    body = [];
  const r = (v) => Number(v.toFixed(2));
  shapes.forEach((s, i) => {
    let fill = s.flat;
    if (s.grad) {
      const gid = `${id}${i}`;
      const stops = s.grad.colors
        .map(
          (c, k) =>
            `<stop offset="${Math.round((k / (s.grad.colors.length - 1)) * 100)}%" stop-color="${c}"/>`,
        )
        .join("");
      defs.push(
        `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${r(s.grad.x1)}" y1="${r(s.grad.y1)}" x2="${r(s.grad.x2)}" y2="${r(s.grad.y2)}">${stops}</linearGradient>`,
      );
      fill = `url(#${gid})`;
    }
    // fill-rule="evenodd" é o que o potrace emite: sem ela as contra-formas das
    // letras (o "o", o "ã", o "O" de Ouro) fecham e viram elipses maciças.
    body.push(
      `<g transform="translate(${s.tx} ${s.ty})"><path fill="${fill}" fill-rule="evenodd" d="${s.d}"/></g>`,
    );
  });
  const vb = `${box.x0} ${box.y0} ${box.x1 - box.x0 + 1} ${box.y1 - box.y0 + 1}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><defs>${defs.join("")}</defs>${body.join("")}</svg>`;
}

const model = await traceLogo(SRC, {
  bgTolerance: 120,
  splitY: 1244,
  turdSize: 12,
  minArea: 600,
  stops: 6,
  perComponent: { warm: true, dark: false },
});

const warm = model.shapes.filter((s) => s.layer === "warm");
const variants = [
  // Lockup completo, para o rodapé.
  { file: "logo.svg", shapes: model.shapes, id: "fdo" },
  // Só "Fogão de Ouro": a tagline em versalete espaçado é 5% da altura do
  // lockup e vira mancha em qualquer tamanho que uma barra de navegação aceite.
  { file: "wordmark.svg", shapes: warm, id: "fdw" },
  // Tagline em creme, para fundo escuro. Origem do lockup.png (card de OG).
  { file: "logo-dark.svg", shapes: model.shapes, id: "fdd", recolor: CREAM },
];

for (const v of variants) {
  const shapes = v.recolor
    ? v.shapes.map((s) =>
        s.layer === "dark" ? { ...s, flat: v.recolor, grad: null } : s,
      )
    : v.shapes;
  const box = bboxOf(shapes);
  const { data: svg } = optimize(toSvg(shapes, box, v.id), {
    multipass: true,
    plugins: [
      { name: "preset-default", params: { overrides: { cleanupIds: false } } },
    ],
  });
  await writeFile(join(BRAND, v.file), svg);
  console.log(
    `${v.file.padEnd(14)} ${(svg.length / 1024).toFixed(1).padStart(5)} KB  ` +
      `${box.x1 - box.x0}x${box.y1 - box.y0}  ${((box.x1 - box.x0) / (box.y1 - box.y0)).toFixed(2)}:1`,
  );
}
console.log("\nAgora rode `npm run brand:rasters` para atualizar o lockup.png.");
