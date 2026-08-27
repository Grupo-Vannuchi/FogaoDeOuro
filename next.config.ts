import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Baseline security headers applied to every response. These are the "safe"
 * set that never breaks rendering. A Content-Security-Policy is deliberately
 * NOT set here: the site emits inline JSON-LD (<script type="application/ld+json">)
 * and loads external fonts/images, so a CSP needs a nonce middleware + testing
 * and should land as its own change.
 */
const securityHeaders = [
  // Force HTTPS for two years (ignored on http/localhost by browsers).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Disallow being embedded in an <iframe> (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Don't let browsers MIME-sniff responses away from their declared type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send origin only on cross-origin navigations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful features the site doesn't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Admin image uploads go through a Server Action; the default 1MB body cap is
  // too small for a phone photo. Match the action's 15MB limit (+ FormData
  // overhead). Only admins (session-gated) can hit the upload action.
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Remote sources used for seeded/demo imagery. Add a client's CDN here.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      // Per-information cover images: on-topic keyword + a unique lock per entry.
      { protocol: "https", hostname: "loremflickr.com" },
      // Google Drive images: use the lh3.googleusercontent.com/d/<FILE_ID> form,
      // NOT the drive.google.com/file/d/<ID>/view share link.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Supabase Storage (admin image uploads) — the project's public bucket.
      { protocol: "https", hostname: "*.supabase.co" },
      // Instagram media CDN. Só os dois hosts que a Graph API devolve em
      // `media_url`/`thumbnail_url` — liberar `*.fbcdn.net` inteiro abriria
      // a otimização de imagem para qualquer conteúdo hospedado pela Meta.
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "scontent.cdninstagram.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
