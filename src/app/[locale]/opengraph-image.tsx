import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

/**
 * Default social share image for every route (Open Graph + Twitter). Routes can
 * override by adding their own opengraph-image file deeper in the tree.
 *
 * ⚠️ PLACEHOLDER: a typographic card on the brand's graphite ground, since the
 * client has not delivered a logo or the authorial photography yet. Once the
 * hero photos arrive, this should become a real photo with the wordmark over
 * it — a food image converts far better in a WhatsApp preview than a text card.
 */
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const { background, brand, foreground } = siteConfig.theme.dark;
  const { city, region } = siteConfig.contact.address;

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
          gap: 28,
          background,
          color: foreground,
        }}
      >
        <div style={{ display: "flex", gap: 18, fontSize: 96, fontWeight: 700 }}>
          <span>Fogão</span>
          <span style={{ color: brand }}>de Ouro</span>
        </div>
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
