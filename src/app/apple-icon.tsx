import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

// Apple touch icon (iOS home screen). 180×180 is Apple's recommended size; iOS
// applies its own rounded mask, so the full-bleed graphite field works well.
// Same stove mark and same PNG-embedding reason as `src/app/icon.tsx`.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
        <img src={`data:image/png;base64,${symbol}`} height={114} />
      </div>
    ),
    { ...size },
  );
}
