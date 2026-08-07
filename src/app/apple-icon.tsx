import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Apple touch icon (iOS home screen). 180×180 is Apple's recommended size; iOS
// applies its own rounded mask, so the full-bleed monogram works well.
// ⚠️ PLACEHOLDER — same monogram as `src/app/icon.tsx`; replace both when the
// client delivers the real mark.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        <span>F</span>
        <span style={{ color: brand }}>O</span>
      </div>
    ),
    { ...size },
  );
}
