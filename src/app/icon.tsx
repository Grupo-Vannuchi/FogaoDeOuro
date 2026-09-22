import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

/**
 * Ícone raster — o FALLBACK. O favicon de verdade é `icon.svg`, ao lado.
 *
 * A marca é o "O" de Ouro, recortado do `wordmark.svg` em vetor. Substituiu o
 * fogão da logo ANTIGA em 22/09/2026, por decisão do cliente que reviu a de
 * 21/08 — até então o favicon era de uma marca aposentada, e o
 * `public/brand/README.md` chamava isso de "assimetria consciente".
 *
 * **Por que o "O" e não o logotipo inteiro.** Medido, não suposto: o logotipo
 * empilhado a 16×16 vira uma mancha laranja sem forma de letra; a 32×32 os
 * traços finos se desfazem e "RESTAURANTE" some. É geometria — a logo é 1,71:1
 * e o ícone é quadrado, então sobram ~9px de altura para tipo em duas linhas.
 * O "O" é 509×494, praticamente quadrado: preenche a moldura e a forma fechada
 * sobrevive a qualquer tamanho. Era o candidato que o próprio README indicava.
 *
 * Embutido como PNG, não como o SVG de origem, porque o satori não resolve os
 * `url(#gradient)` de que esta logo é feita. `npm run brand:rasters` regenera.
 */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
  const symbol = await readFile(
    join(process.cwd(), "public", "brand", "monogram-o.png"),
    "base64",
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: siteConfig.theme.light.background,
        }}
      >
        {/* O PNG já vem com a folga do monograma embutida; aqui ele sangra
            inteiro para o recorte maskable do Android nunca morder transparência. */}
        <img src={`data:image/png;base64,${symbol}`} height={512} />
      </div>
    ),
    { ...size },
  );
}
