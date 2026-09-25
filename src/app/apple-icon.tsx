import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

// Apple touch icon (iOS home screen). 180×180 is Apple's recommended size; iOS
// applies its own rounded mask, so the cream field runs full bleed behind it.
// Mesmo logotipo inteiro e mesma razão para embutir PNG que `src/app/icon.tsx`
// — lá está a medição de legibilidade por tamanho. Aqui o ícone nunca é
// pequeno (180px, tela inicial do iPhone), então o nome se lê sem ressalva.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const { background } = siteConfig.theme.light;
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
          background,
        }}
      >
        {/* Preso pela LARGURA, porque o logotipo é 1,38:1 e pela altura
            vazaria pelos lados. 156 de 180 deixa 12px de recuo em cada lado: o
            iOS mascara num quadrado arredondado, e a sangue as letras das
            pontas encostariam na curva. */}
        <img src={`data:image/png;base64,${symbol}`} width={156} />
      </div>
    ),
    { ...size },
  );
}
