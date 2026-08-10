import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

/**
 * Default social share image for every route (Open Graph + Twitter). Routes can
 * override by adding their own opengraph-image file deeper in the tree.
 *
 * The client's full lockup on the brand's graphite ground. It embeds the dark
 * cut (cream tagline) because the card's background is dark — the stock graphite
 * tagline would vanish. PNG rather than SVG because satori cannot resolve the
 * logo's gradient fills; `npm run brand:rasters` regenerates it.
 *
 * ⚠️ Still pending: the client's authorial photography. Once the hero photos
 * arrive this should become a real dish over the mark — a food image converts
 * far better in a WhatsApp preview than a logo card.
 */
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Nothing here varies per request, so bake the card at build time. That also
 * keeps the `readFile` below on the build machine instead of the serverless
 * runtime, where `public/` is served by the CDN and is not guaranteed to sit in
 * the function's own filesystem.
 */
export const dynamic = "force-static";

export default async function OpengraphImage() {
  const { background, brand, foreground } = siteConfig.theme.dark;
  const { city, region } = siteConfig.contact.address;
  const lockup = await readFile(
    join(process.cwd(), "public", "brand", "lockup.png"),
    "base64",
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
          background,
          color: foreground,
        }}
      >
        <img src={`data:image/png;base64,${lockup}`} width={620} />
        <div style={{ display: "flex", fontSize: 34, opacity: 0.85 }}>
          Restaurante no Centro Histórico de {city}/{region}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: brand }}>
          Segunda a sexta · 11h às 15h
        </div>
      </div>
    ),
    { ...size },
  );
}
