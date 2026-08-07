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
 * **Dark-first.** The client's visual direction puts the food on a graphite
 * ground, so the dark palette is the default that sits on bare `:root`; light is
 * the variant. Three-state theming, mirroring that inversion:
 *  - no `data-theme` attribute → follow the OS (`prefers-color-scheme: light`
 *    opts into the light palette; anything else stays dark);
 *  - `data-theme="light"` → force light, whatever the OS says;
 *  - `data-theme="dark"`  → force dark (the `:not([data-theme="dark"])` guard is
 *    what lets an explicit dark choice beat an OS light preference).
 * The attribute is set pre-paint by the inline script in the root layout and
 * toggled by `ThemeToggle`.
 */
export function ThemeStyle() {
  const { light, dark } = siteConfig.theme;
  const css = [
    `:root{color-scheme:dark;${paletteVars(dark)}}`,
    `@media (prefers-color-scheme:light){:root:not([data-theme="dark"]){color-scheme:light;${paletteVars(light)}}}`,
    `:root[data-theme="light"]{color-scheme:light;${paletteVars(light)}}`,
    `:root[data-theme="dark"]{color-scheme:dark;${paletteVars(dark)}}`,
  ].join("");
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
