import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Brand wordmark, linking home.
 *
 * ⚠️ PLACEHOLDER: the client has not delivered a logo yet. This renders the
 * name typographically (display serif + the brand amber) so the header reads as
 * intentional instead of showing a broken image. It is theme-aware for free,
 * because it uses the palette tokens rather than a baked-in bitmap.
 *
 * To swap in the real mark: drop the two files in `public/`, import them here,
 * and render `<Image>` with a `dark:hidden` / `hidden dark:block` pair — the
 * previous brand did exactly that. Also update `src/app/icon.tsx`,
 * `src/app/apple-icon.tsx` and `src/app/[locale]/opengraph-image.tsx`.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-baseline gap-1.5 font-serif text-xl leading-none tracking-tight",
        className,
      )}
      aria-label={siteConfig.name}
    >
      <span className="font-bold">Fogão</span>
      <span className="text-brand font-bold">de Ouro</span>
    </Link>
  );
}
