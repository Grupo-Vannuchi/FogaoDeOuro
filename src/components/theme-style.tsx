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
 * Three-state theming:
 *  - no `data-theme` attribute → follow the OS (`prefers-color-scheme`);
 *  - `data-theme="dark"`       → force dark, whatever the OS says;
 *  - `data-theme="light"`      → force light (the `:not([data-theme="light"])`
 *    guard is what lets an explicit light choice beat the OS dark preference).
 * The attribute is set pre-paint by the inline script in the root layout and
 * toggled by `ThemeToggle`.
 */
export function ThemeStyle() {
  const { light, dark } = siteConfig.theme;
  const css = [
    `:root{${paletteVars(light)}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${paletteVars(dark)}}}`,
    `:root[data-theme="dark"]{${paletteVars(dark)}}`,
  ].join("");
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
