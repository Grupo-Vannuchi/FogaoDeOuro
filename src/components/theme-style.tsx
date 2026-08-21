import { siteConfig, type ThemePalette } from "@/config/site";

function paletteVars(palette: ThemePalette): string {
  return [
    `--brand:${palette.brand}`,
    `--brand-foreground:${palette.brandForeground}`,
    `--accent:${palette.accent}`,
    `--background:${palette.background}`,
    `--foreground:${palette.foreground}`,
  ].join(";");
}

/**
 * Injects the brand palette from `siteConfig.theme` as CSS custom properties on
 * `:root`. Rendered in the document <head> so the values are present before first
 * paint (no flash).
 *
 * **Light only.** The site ships a single, fixed palette: the cream ground with
 * the darkened amber. There is no dark variant, no `prefers-color-scheme` rule
 * and no `data-theme` attribute — `color-scheme: light` also tells the browser to
 * paint form controls, scrollbars and the address bar to match, so a visitor
 * whose OS is in dark mode still gets the intended look.
 *
 * `siteConfig.theme.dark` still exists, but only as the graphite ground for the
 * brand assets rendered off-page (app icons, the OG card). It is deliberately not
 * emitted here.
 */
export function ThemeStyle() {
  const css = `:root{color-scheme:light;${paletteVars(siteConfig.theme.light)}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
