import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

/**
 * App icon (favicon / browser tab / PWA), generated at build time.
 *
 * ⚠️ PLACEHOLDER: drawn from the brand palette because the client has not
 * delivered a logo yet. Full-bleed graphite field so maskable cropping on
 * Android never clips into transparency. Replace the monogram with the real
 * mark once it arrives.
 */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  const { background, brand, foreground } = siteConfig.theme.dark;

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
          color: foreground,
          fontSize: 260,
          fontWeight: 700,
          letterSpacing: -12,
        }}
      >
        <span>F</span>
        <span style={{ color: brand }}>O</span>
      </div>
    ),
    { ...size },
  );
}
