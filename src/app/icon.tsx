import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

/**
 * Ícone raster — o FALLBACK. O favicon de verdade é `icon.svg`, ao lado.
 *
 * É o logotipo INTEIRO — "Fogão de Ouro" empilhado, com a régua "RESTAURANTE"
 * embaixo — sobre o creme da marca. Entrou em 25/09/2026 a pedido do cliente,
 * no lugar do monograma "O" que vigorou desde 22/09.
 *
 * **O que se ganha e o que se perde, medido e não suposto.** Renderizando o
 * `icon.svg` em cada tamanho e ampliando sem suavizar:
 *
 *   16×16 ... mancha; lêem-se duas linhas laranja, não as palavras
 *   32×32 ... "Fogão" e "Ouro" legíveis; "RESTAURANTE" vira borrão
 *   48×48 ... confortável
 *   64×64 ... nítido
 *
 * O caso que importa é o de 32: a aba do navegador pede 16 CSS px, mas numa
 * tela de densidade dupla — que é a regra hoje — o sistema busca 32 de
 * dispositivo. Aí o nome se lê. Em 16 real (favoritos antigos, alguns
 * leitores de feed) sobra a cor e a silhueta, que ainda identificam a casa.
 *
 * O `monogram-o.svg`/`.png` continuam no `public/brand/`: não são código
 * morto, são peças da marca, e a volta atrás é trocar o caminho abaixo.
 *
 * Embutido como PNG, não como o SVG de origem, porque o satori não resolve os
 * `url(#gradient)` de que esta logo é feita. `npm run brand:rasters` regenera.
 */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
  const symbol = await readFile(
    join(process.cwd(), "public", "brand", "logo.png"),
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
        {/* Limitado pela LARGURA, não pela altura: o logotipo é 1,38:1, e
            preso pela altura ele vazaria a moldura quadrada pelos lados. Os
            26px de folga de cada lado impedem que o recorte maskable do
            Android coma a primeira e a última letra. */}
        <img src={`data:image/png;base64,${symbol}`} width={460} />
      </div>
    ),
    { ...size },
  );
}
