import type { MetadataRoute } from "next";
import { defaultLocale } from "@/i18n/routing";
import { localizedUrl, languageAlternates } from "@/lib/seo";
import {
  getInformationSitemapEntries,
  getProjectSitemapEntries,
} from "@/lib/queries";

type Entry = { path: string; lastModified: Date };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static marketing routes share the deploy time as their last-modified date.
  const now = new Date();
  const staticEntries: Entry[] = [
    "",
    "/experiencia",
    "/gastronomia",
    "/informations",
    "/galeria",
    "/reservas",
    "/contato",
    "/terms",
    "/privacy",
  ].map((path) => ({ path, lastModified: now }));

  let projectEntries: Entry[] = [];
  let informationEntries: Entry[] = [];
  try {
    const [projects, informations] = await Promise.all([
      getProjectSitemapEntries(),
      getInformationSitemapEntries(),
    ]);
    // Detail pages carry the real edit date of their content record.
    projectEntries = projects.map((p) => ({
      path: `/galeria/${p.slug}`,
      lastModified: p.updatedAt,
    }));
    informationEntries = informations.map((i) => ({
      path: `/informations/${i.slug}`,
      lastModified: i.updatedAt,
    }));
  } catch {
    // Database unavailable at build time — ship the static routes only.
  }

  return [
    ...staticEntries,
    ...projectEntries,
    ...informationEntries,
  ].map(
    ({ path, lastModified }) => ({
      url: localizedUrl(defaultLocale, path),
      lastModified,
      alternates: { languages: languageAlternates(path) },
    }),
  );
}
