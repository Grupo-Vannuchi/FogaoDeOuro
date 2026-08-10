import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Brand mark, linking home. Two cuts of the client's logo, both derived from
 * `docs/Logos-fogao_de_Ouro` — see `public/brand/README.md` for how.
 *
 *  - `wordmark` (default) — just "Fogão de Ouro", 4.4:1 wide. The full lockup is
 *    stacked and nearly square, so at the header's ~28px the curved
 *    "Restaurante Grill e Café" collapses into a smudge.
 *  - `lockup` — the complete mark, for places with room to breathe.
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
          width={123}
          height={28}
          className="h-7 w-auto"
        />
      ) : (
        <>
          {/*
            The lockup's tagline is graphite `#474544`, which lands at 1.97:1 on
            the dark ground — so dark gets a variant with a cream tagline. The
            swap is CSS, not `dark:`, because Tailwind's variant follows
            `prefers-color-scheme` and would ignore the site's explicit
            `data-theme` toggle. Rules live in `globals.css`.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
          <img
            src="/brand/logo.svg"
            alt=""
            width={252}
            height={144}
            className="brand-lockup-light h-36 w-auto"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
          <img
            src="/brand/logo-dark.svg"
            alt=""
            width={252}
            height={144}
            className="brand-lockup-dark h-36 w-auto"
          />
        </>
      )}
    </Link>
  );
}
