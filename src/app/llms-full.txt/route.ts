import { siteConfig, fullAddress } from "@/config/site";
import { defaultLocale } from "@/i18n/routing";
import { localizedUrl } from "@/lib/seo";
import {
  getServices,
  getServiceBySlug,
  getProjects,
  getProjectBySlug,
  getInformations,
  getInformationBySlug,
} from "@/lib/queries";

/**
 * `/llms-full.txt` — the expanded companion to `/llms.txt`: the FULL text of the
 * agency's services, cases and articles inline, so LLMs can cite the content
 * without fetching each page (llmstxt.org convention). Plain text, revalidated
 * daily; degrades gracefully if the database is unavailable.
 */
export const revalidate = 86400;

/** One content block: heading + URL + optional summary + full body. */
function block(
  title: string,
  path: string,
  summary: string,
  content: string[],
): string {
  const parts = [`## ${title}`, localizedUrl(defaultLocale, path)];
  if (summary) parts.push("", summary);
  if (content.length) parts.push("", content.join("\n"));
  return parts.join("\n");
}

/**
 * Resolve each item's full detail and render it — ONE item at a time per
 * category (the three categories run in parallel, so peak DB concurrency is ~3).
 * This deliberately avoids firing every detail query at once, which would
 * exhaust the connection pool during the build prerender. A single item that
 * fails to load is skipped, not fatal.
 */
async function collect<T extends { slug: string }, D>(
  items: T[],
  fetchDetail: (slug: string) => Promise<D | null>,
  toLine: (detail: D) => string,
): Promise<string[]> {
  const out: string[] = [];
  for (const item of items) {
    try {
      const detail = await fetchDetail(item.slug);
      if (detail) out.push(toLine(detail));
    } catch {
      // Skip an item that fails to load; keep the rest.
    }
  }
  return out;
}

export async function GET(): Promise<Response> {
  const { name } = siteConfig;

  const sections: string[] = [
    `# ${name} — conteúdo completo`,
    "",
    `> Restaurante no Centro Histórico de Santos — ${fullAddress()}.`,
    "",
    "Versão expandida de /llms.txt: o texto completo da gastronomia, da galeria e das novidades, para citação por LLMs.",
  ];

  let svc: string[] = [];
  let prj: string[] = [];
  let inf: string[] = [];
  try {
    const [services, projects, informations] = await Promise.all([
      getServices(defaultLocale),
      getProjects(defaultLocale),
      getInformations(defaultLocale),
    ]);

    [svc, prj, inf] = await Promise.all([
      collect(
        services,
        (slug) => getServiceBySlug(defaultLocale, slug),
        (s) => block(s.title, `/gastronomia/${s.slug}`, s.description, s.content),
      ),
      collect(
        projects,
        (slug) => getProjectBySlug(defaultLocale, slug),
        (p) => block(p.title, `/galeria/${p.slug}`, p.summary, p.content),
      ),
      collect(
        informations,
        (slug) => getInformationBySlug(defaultLocale, slug),
        (i) =>
          block(i.title, `/informations/${i.slug}`, i.description, i.content),
      ),
    ]);
  } catch {
    // Lists unavailable — ship the header only.
  }

  if (svc.length) sections.push("", "# Serviços", "", svc.join("\n\n"));
  if (prj.length) sections.push("", "# Portfólio", "", prj.join("\n\n"));
  if (inf.length) sections.push("", "# Artigos", "", inf.join("\n\n"));

  return new Response(`${sections.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
