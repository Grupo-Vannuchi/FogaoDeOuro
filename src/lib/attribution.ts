/**
 * Lead attribution — how a visitor first reached the site. Captured client-side
 * on the first page of a visit into `sessionStorage` (first-touch, session-scoped
 * — not a persistent tracking cookie), then sent with the contact form and
 * stored on the lead. `sourceLabel` is pure and safe to use on the server.
 */

export type Attribution = {
  referrer?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

const KEY = "n8x_attr";
const clip = (s?: string | null) => (s ? s.slice(0, 200) : undefined);

/**
 * Store the first-touch attribution once per visit (browser tab). Safe to call
 * on every page mount — it no-ops if already captured.
 */
export function captureAttribution(): void {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const url = new URL(window.location.href);
    const p = url.searchParams;
    const ref = document.referrer || "";
    // Internal navigation shouldn't count as a source.
    const referrer = ref && !ref.startsWith(window.location.origin) ? ref : "";
    const attr: Attribution = {
      landingPage: url.pathname,
      referrer,
      utmSource: p.get("utm_source") ?? undefined,
      utmMedium: p.get("utm_medium") ?? undefined,
      utmCampaign: p.get("utm_campaign") ?? undefined,
    };
    sessionStorage.setItem(KEY, JSON.stringify(attr));
  } catch {
    // storage blocked (private mode) — attribution is best-effort
  }
}

/** Read the captured attribution to send with a form submit. */
export function readAttribution(): Attribution {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return {};
    const a = JSON.parse(raw) as Attribution;
    return {
      landingPage: clip(a.landingPage),
      referrer: clip(a.referrer),
      utmSource: clip(a.utmSource),
      utmMedium: clip(a.utmMedium),
      utmCampaign: clip(a.utmCampaign),
    };
  } catch {
    return {};
  }
}

const HOSTS: Record<string, string> = {
  "google.com": "Google",
  "google.com.br": "Google",
  "bing.com": "Bing",
  "duckduckgo.com": "DuckDuckGo",
  "instagram.com": "Instagram",
  "l.instagram.com": "Instagram",
  "facebook.com": "Facebook",
  "l.facebook.com": "Facebook",
  "m.facebook.com": "Facebook",
  "linkedin.com": "LinkedIn",
  "lnkd.in": "LinkedIn",
  "t.co": "Twitter/X",
  "youtube.com": "YouTube",
  "wa.me": "WhatsApp",
};

/** A human-friendly source label from attribution (UTM source wins, then a known
 * referrer host, then the raw host, else "Direto"). Pure — server-safe. */
export function sourceLabel(a: Attribution): string {
  if (a.utmSource) return a.utmSource;
  if (!a.referrer) return "Direto";
  try {
    const host = new URL(a.referrer).hostname.replace(/^www\./, "");
    return HOSTS[host] ?? host;
  } catch {
    return a.referrer;
  }
}
