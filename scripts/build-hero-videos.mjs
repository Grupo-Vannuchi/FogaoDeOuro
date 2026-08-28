/**
 * Prepara os vídeos de fundo do hero a partir dos originais do cliente.
 *
 * Um vídeo no topo da home é caro: ele disputa banda justamente durante a
 * pintura inicial, que é o que o Google mede. Três decisões contêm esse custo:
 *
 *  - **pôster obrigatório.** Cada vídeo gera um WebP do primeiro quadro. É ele
 *    que aparece de imediato e é ele o elemento de maior pintura — o vídeo
 *    entra por cima quando estiver pronto. Sem pôster, o hero fica preto até o
 *    primeiro quadro decodificar.
 *  - **sem áudio.** A trilha é peso morto: o vídeo toca mudo por exigência dos
 *    navegadores para autoplay, e ninguém vai ativar o som de um plano de
 *    fundo.
 *  - **CRF alto e 24 fps.** É fundo atrás de um véu escuro, com texto por cima;
 *    detalhe fino ali não é percebido, e cada 100 KB conta no 4G da rua.
 *
 * Uso:
 *   node scripts/build-hero-videos.mjs "C:/Users/.../Downloads"
 */
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const OUT = join("public", "hero");

/** Cada vídeo casado com o slide que ele ilustra. */
const VIDEOS = [
  {
    file: "WhatsApp Video 2026-08-28 at 10.01.47.mp4",
    out: "slide-1",
    note: "frigideira flambando — slide 1",
  },
  {
    file: "WhatsApp Video 2026-08-28 at 10.01.45.mp4",
    out: "slide-2",
    note: "carnes girando na rotisseria — slide 2",
  },
];

const dir = process.argv[2];
if (!dir || !existsSync(dir)) {
  console.error("Informe a pasta com os vídeos originais.");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

const kb = (p) => Math.round(statSync(p).size / 1024);

for (const { file, out, note } of VIDEOS) {
  const src = join(dir, file);
  if (!existsSync(src)) {
    console.error(`FALTA: ${file}`);
    process.exitCode = 1;
    continue;
  }

  const mp4 = join(OUT, `${out}.mp4`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error",
    "-i", src,
    "-an",                        // sem áudio
    "-vf", "fps=24,scale=1280:-2",
    "-c:v", "libx264",
    "-profile:v", "main",         // compatível com celular antigo
    "-crf", "30",
    "-preset", "slow",
    "-pix_fmt", "yuv420p",        // sem isto, o Safari recusa o arquivo
    "-movflags", "+faststart",    // metadados no início: começa a tocar antes de baixar tudo
    mp4,
  ]);

  // O pôster sai do próprio vídeo: qualquer outra imagem faria o hero "pular"
  // de uma cena para outra quando o vídeo começasse.
  const poster = join(OUT, `${out}-poster.webp`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error",
    "-i", mp4,
    "-frames:v", "1",
    "-vf", "scale=1280:-2",
    "-quality", "78",
    poster,
  ]);

  console.log(
    `${out}: ${kb(mp4)} KB (vídeo) + ${kb(poster)} KB (pôster) — ${note}`,
  );
}
