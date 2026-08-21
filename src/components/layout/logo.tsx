import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Brand mark, linking home. Two cuts of the client's logo, both derived from
 * the 2026 rebrand — see `public/brand/README.md` for how.
 *
 *  - `wordmark` (default) — just "Fogão de Ouro", 1.56:1. Drops the
 *    "RESTAURANTE" line, which is spaced small caps and only 5% of the lockup's
 *    height: at any size a header can afford it reads as a smudge.
 *  - `lockup` — the complete mark, tagline included, for places with room to
 *    breathe.
 *
 * The rebrand is stacked where the old mark was a single line (4.4:1), so the
 * wordmark rides taller here — 44px in the 64px bar — to keep "de Ouro" legible.
 * Below ~40px the small "de" closes up.
 *
 * Only the light cut is rendered: the site is light-only, and the lockup's
 * brown tagline is designed for exactly this cream ground. The dark cut
 * (`/brand/logo-dark.svg`, cream tagline) still ships because `lockup.png` — the
 * OG card, which keeps the graphite ground — is rasterised from it.
 *
 * Plain `<img>` rather than `next/image`: the optimiser refuses SVG unless
 * `dangerouslyAllowSVG` is set globally, and flipping that on to serve our own
 * static file would loosen the rule for every remote pattern too. An SVG has
 * nothing to optimise anyway.
 */
export function Logo({
  className,
  variant = "wordmark",
}: {
  className?: string;
  variant?: "wordmark" | "lockup";
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center", className)}
      aria-label={siteConfig.name}
    >
      {variant === "wordmark" ? (
        /* eslint-disable-next-line @next/next/no-img-element -- see above */
        <img
          src="/brand/wordmark.svg"
          alt=""
          width={69}
          height={44}
          className="h-11 w-auto"
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- see above */
        <img
          src="/brand/logo.svg"
          alt=""
          width={199}
          height={144}
          className="h-36 w-auto"
        />
      )}
    </Link>
  );
}
