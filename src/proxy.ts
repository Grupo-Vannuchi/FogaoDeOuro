import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * Next.js 16 renamed the `middleware` convention to `proxy` (Node.js runtime).
 * Here it drives next-intl locale negotiation and prefixing. Admin authorization
 * is enforced server-side in the admin layout's Data Access Layer
 * (`requireAdmin`), not here.
 */
const handle = createMiddleware(routing);

export default handle;

export const config = {
  // Run on every path except API routes, Next internals, files with an
  // extension (images, fonts, etc.) and the extensionless metadata routes.
  //
  // `icon` and `apple-icon` have to be named one by one: Next serves them from
  // `src/app/icon.tsx` and `apple-icon.tsx`, at the app root and therefore
  // OUTSIDE `[locale]/`, on URLs that carry no dot — so the `.*\..*` clause
  // never covered them. Without the exception next-intl rewrites `/icon` to
  // `/pt/icon`, which matches no route: the `<link rel="icon">` in every page
  // points at a 404 and the browser tab shows no logo. The metadata routes
  // that DO have an extension (`robots.txt`, `sitemap.xml`,
  // `manifest.webmanifest`) were always fine, which is what kept this hidden.
  // Next's own docs spell out the rule: "If using along with `proxy.ts`,
  // configure the matcher to exclude the metadata files."
  //
  // The `$` anchors keep the exception to the icon routes themselves, so a
  // future page whose slug merely starts with "icon" still gets localized.
  // `e2e/metadata-routes.spec.ts` is the regression guard.
  matcher: ["/((?!api|_next|_vercel|icon$|apple-icon$|.*\\..*).*)"],
};
