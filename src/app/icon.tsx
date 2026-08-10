import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

/**
 * App icon (favicon / browser tab / PWA), generated at build time.
 *
 * The mark is the stove pulled out of the client's lockup — the wordmark is far
 * too wide to survive 32×32. Full-bleed graphite field so Android's maskable
 * crop never bites into transparency.
 *
 * Embedded as a PNG rather than the source SVG because satori cannot resolve
 * the `url(#gradient)` fills the logo is built from. `npm run brand:rasters`
 * regenerates it.
 */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
  const { background } = siteConfig.theme.dark;
  const symbol = await readFile(
    join(process.cwd(), "public", "brand", "symbol.png"),
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
        {/* Inset so the maskable crop keeps the whole stove inside the safe area. */}
        <img src={`data:image/png;base64,${symbol}`} height={324} />
      </div>
    ),
    { ...size },
  );
}
