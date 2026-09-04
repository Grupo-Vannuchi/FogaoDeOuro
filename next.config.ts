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
  /*
   * O Next envia `X-Powered-By: Next.js` em toda resposta, dizendo a qualquer um
   * com que tecnologia o site foi feito — o que poupa a primeira metade do
   * trabalho de quem procura uma falha conhecida de versão.
   *
   * ⚠️ A Vercel já removia o cabeçalho na borda, então medindo o site publicado
   * ele não aparecia e o problema ficava invisível. A proteção vinha da
   * HOSPEDAGEM, não do código: sair da Vercel a traria de volta sem nada acusar.
   */
  poweredByHeader: false,
  images: {
    /*
     * AVIF antes de WebP. Sem esta linha o `next/image` serve só WebP; o AVIF
     * costuma sair 20% a 30% menor na mesma qualidade, e quem não o entende
     * recebe WebP pela negociação normal de conteúdo — não há a quem
     * prejudicar. Num site cujo conteúdo é foto de comida, é o ajuste de maior
     * retorno por linha escrita. A ordem importa: o Next tenta na ordem
     * declarada.
     */
    formats: ["image/avif", "image/webp"],
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
      // Instagram media CDN. A Meta serve a mesma mídia por dois domínios e
      // alterna entre eles sem aviso: `scontent-<pop>.cdninstagram.com` e
      // `instagram.f<pop>.fna.fbcdn.net`. Faltava o segundo, e sem ele o
      // otimizador responde 400 — o card viria quebrado sem nada explicando.
      //
      // `instagram.*.fbcdn.net` em vez de `*.fbcdn.net` de propósito: o `*` do
      // Next casa ponto (o matcher é picomatch sobre o hostname, onde não há
      // barra), então o padrão largo liberaria QUALQUER conteúdo hospedado
      // pela Meta na nossa rota de otimização. Verificado com o matcher real:
      // `instagram.*.fbcdn.net` casa `instagram.fgru1-1.fna.fbcdn.net` e
      // recusa `scontent.xx.fbcdn.net`.
      //
      // `scontent.cdninstagram.com` não precisa de linha própria: o padrão
      // acima já o cobre.
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "instagram.*.fbcdn.net" },
    ],
  },
};

export default withNextIntl(nextConfig);
