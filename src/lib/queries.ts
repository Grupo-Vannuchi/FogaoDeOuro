import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { localize, localizeRich } from "@/lib/content";
import { tags, CONTENT_REVALIDATE_SECONDS } from "@/lib/cache";
import type { Locale } from "@/i18n/routing";

/**
 * Content data-access layer.
 *
 * Each function reads published content from Postgres and resolves bilingual
 * JSON fields to plain strings for the requested locale, returning view-ready
 * objects. Wrapped in `unstable_cache` so the rendered pages can be statically
 * cached (ISR): results are tagged per content type and invalidated on demand
 * by the admin actions via `revalidateTag`, with a 1-day time-based fallback.
 */

const revalidate = CONTENT_REVALIDATE_SECONDS;

/** A content row reduced to what the sitemap needs: its slug and last edit. */
export type SitemapEntry = { slug: string; updatedAt: Date };

export type ServiceView = {
  id: string;
  slug: string;
  icon: string;
  title: string;
  description: string;
  featured: boolean;
};

export type ServiceDetailView = ServiceView & {
  content: string[];
};

export type InformationView = {
  id: string;
  slug: string;
  icon: string;
  image: string;
  title: string;
  description: string;
  featured: boolean;
};

export type InformationDetailView = InformationView & {
  content: string[];
  // ISO strings, not Date: this view round-trips through `unstable_cache`, which
  // JSON-serializes its payload — a Date comes back as a string on cache hits
  // and crashes any `.toISOString()` caller. Serialize here, where the value is
  // still a real Prisma Date.
  createdAt: string;
  updatedAt: string;
};

export type ProjectCardView = {
  id: string;
  slug: string;
  clientName: string;
  category: string;
  year: number;
  coverImage: string;
  tags: string[];
  title: string;
  summary: string;
  featured: boolean;
};

export type ProjectDetailView = ProjectCardView & {
  gallery: string[];
  content: string[];
};

export type TestimonialView = {
  id: string;
  authorName: string;
  company: string;
  avatarUrl: string | null;
  rating: number;
  role: string;
  quote: string;
};

export type TeamMemberView = {
  id: string;
  name: string;
  photoUrl: string | null;
  role: string;
  socials: Record<string, string>;
};

export type StatView = {
  id: string;
  key: string;
  value: number;
  suffix: string;
  label: string;
};

export type ClientView = {
  id: string;
  name: string;
  logoUrl: string;
  website: string | null;
};

export type MenuItemView = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  tags: string[];
  /** 1 (segunda) a 5 (sexta); null = prato permanente. */
  weekday: number | null;
};

export type MenuCategoryView = {
  id: string;
  slug: string;
  name: string;
  description: string;
  items: MenuItemView[];
};

export const getServices = unstable_cache(
  async (
    locale: Locale,
    options: { featuredOnly?: boolean; take?: number } = {},
  ): Promise<ServiceView[]> => {
    const rows = await prisma.service.findMany({
      where: {
        published: true,
        ...(options.featuredOnly ? { featured: true } : {}),
      },
      orderBy: { order: "asc" },
      take: options.take,
    });
    return rows.map((s) => ({
      id: s.id,
      slug: s.slug,
      icon: s.icon,
      title: localize(s.title, locale),
      description: localize(s.description, locale),
      featured: s.featured,
    }));
  },
  ["services", "list"],
  { tags: [tags.services], revalidate },
);

export const getServiceBySlug = unstable_cache(
  async (locale: Locale, slug: string): Promise<ServiceDetailView | null> => {
    const s = await prisma.service.findFirst({
      where: { slug, published: true },
    });
    if (!s) return null;
    return {
      id: s.id,
      slug: s.slug,
      icon: s.icon,
      title: localize(s.title, locale),
      description: localize(s.description, locale),
      content: localizeRich(s.content, locale),
      featured: s.featured,
    };
  },
  ["services", "detail"],
  { tags: [tags.services], revalidate },
);

/** Slugs of all published services, for `generateStaticParams`. */
export const getServiceSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await prisma.service.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  },
  ["services", "slugs"],
  { tags: [tags.services], revalidate },
);

/** Slug + last-modified date of every published service, for the sitemap. */
export const getServiceSitemapEntries = unstable_cache(
  async (): Promise<SitemapEntry[]> => {
    const rows = await prisma.service.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    return rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt }));
  },
  ["services", "sitemap"],
  { tags: [tags.services], revalidate },
);

export const getInformations = unstable_cache(
  async (
    locale: Locale,
    options: { featuredOnly?: boolean; take?: number } = {},
  ): Promise<InformationView[]> => {
    const rows = await prisma.information.findMany({
      where: {
        published: true,
        ...(options.featuredOnly ? { featured: true } : {}),
      },
      orderBy: { order: "asc" },
      take: options.take,
    });
    return rows.map((i) => ({
      id: i.id,
      slug: i.slug,
      icon: i.icon,
      image: i.image,
      title: localize(i.title, locale),
      description: localize(i.description, locale),
      featured: i.featured,
    }));
  },
  ["informations", "list"],
  { tags: [tags.informations], revalidate },
);

export const getInformationBySlug = unstable_cache(
  async (
    locale: Locale,
    slug: string,
  ): Promise<InformationDetailView | null> => {
    const i = await prisma.information.findFirst({
      where: { slug, published: true },
    });
    if (!i) return null;
    return {
      id: i.id,
      slug: i.slug,
      icon: i.icon,
      image: i.image,
      title: localize(i.title, locale),
      description: localize(i.description, locale),
      content: localizeRich(i.content, locale),
      featured: i.featured,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    };
  },
  ["informations", "detail"],
  { tags: [tags.informations], revalidate },
);

/** Slugs of all published informations, for `generateStaticParams`. */
export const getInformationSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await prisma.information.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  },
  ["informations", "slugs"],
  { tags: [tags.informations], revalidate },
);

/** Slug + last-modified date of every published information, for the sitemap. */
export const getInformationSitemapEntries = unstable_cache(
  async (): Promise<SitemapEntry[]> => {
    const rows = await prisma.information.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    return rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt }));
  },
  ["informations", "sitemap"],
  { tags: [tags.informations], revalidate },
);

export const getProjects = unstable_cache(
  async (
    locale: Locale,
    options: { featuredOnly?: boolean; take?: number } = {},
  ): Promise<ProjectCardView[]> => {
    const rows = await prisma.project.findMany({
      where: {
        published: true,
        ...(options.featuredOnly ? { featured: true } : {}),
      },
      orderBy: [{ order: "asc" }, { year: "desc" }],
      take: options.take,
    });
    return rows.map(toProjectCard(locale));
  },
  ["projects", "list"],
  { tags: [tags.projects], revalidate },
);

export const getProjectBySlug = unstable_cache(
  async (locale: Locale, slug: string): Promise<ProjectDetailView | null> => {
    const p = await prisma.project.findFirst({
      where: { slug, published: true },
    });
    if (!p) return null;
    return {
      ...toProjectCard(locale)(p),
      gallery: p.gallery,
      content: localizeRich(p.content, locale),
    };
  },
  ["projects", "detail"],
  { tags: [tags.projects], revalidate },
);

/** Slugs of all published projects, for `generateStaticParams`. */
export const getProjectSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await prisma.project.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  },
  ["projects", "slugs"],
  { tags: [tags.projects], revalidate },
);

/** Slug + last-modified date of every published project, for the sitemap. */
export const getProjectSitemapEntries = unstable_cache(
  async (): Promise<SitemapEntry[]> => {
    const rows = await prisma.project.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    return rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt }));
  },
  ["projects", "sitemap"],
  { tags: [tags.projects], revalidate },
);

export const getTestimonials = unstable_cache(
  async (locale: Locale): Promise<TestimonialView[]> => {
    const rows = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    return rows.map((t) => ({
      id: t.id,
      authorName: t.authorName,
      company: t.company,
      avatarUrl: t.avatarUrl,
      rating: t.rating,
      role: localize(t.role, locale),
      quote: localize(t.quote, locale),
    }));
  },
  ["testimonials"],
  { tags: [tags.testimonials], revalidate },
);

export const getTeam = unstable_cache(
  async (locale: Locale): Promise<TeamMemberView[]> => {
    const rows = await prisma.teamMember.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    return rows.map((m) => ({
      id: m.id,
      name: m.name,
      photoUrl: m.photoUrl,
      role: localize(m.role, locale),
      socials: (m.socials as Record<string, string>) ?? {},
    }));
  },
  ["team"],
  { tags: [tags.team], revalidate },
);

export const getStats = unstable_cache(
  async (locale: Locale): Promise<StatView[]> => {
    const rows = await prisma.stat.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    return rows.map((s) => ({
      id: s.id,
      key: s.key,
      value: s.value,
      suffix: s.suffix,
      label: localize(s.label, locale),
    }));
  },
  ["stats"],
  { tags: [tags.stats], revalidate },
);

export const getClients = unstable_cache(
  async (): Promise<ClientView[]> => {
    const rows = await prisma.client.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      logoUrl: c.logoUrl,
      website: c.website,
    }));
  },
  ["clients"],
  { tags: [tags.clients], revalidate },
);

/** O cardápio publicado: categorias na ordem, cada uma com os itens disponíveis.
 * Uma consulta só — os itens vêm no `include`, sem N+1. */
export const getMenu = unstable_cache(
  async (locale: Locale): Promise<MenuCategoryView[]> => {
    const rows = await prisma.menuCategory.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      include: {
        items: {
          where: { available: true },
          orderBy: { order: "asc" },
        },
      },
    });
    return rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: localize(c.name, locale),
      description: localize(c.description, locale),
      items: c.items.map((i) => ({
        id: i.id,
        slug: i.slug,
        name: localize(i.name, locale),
        description: localize(i.description, locale),
        image: i.image,
        tags: i.tags,
        weekday: i.weekday,
      })),
    }));
  },
  ["menu"],
  { tags: [tags.menu], revalidate },
);

/** Só o que o dropdown de "Nossa Gastronomia" precisa. */
export const getMenuCategoryLinks = unstable_cache(
  async (locale: Locale): Promise<{ slug: string; name: string }[]> => {
    const rows = await prisma.menuCategory.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: { slug: true, name: true },
    });
    return rows.map((c) => ({ slug: c.slug, name: localize(c.name, locale) }));
  },
  ["menu", "links"],
  { tags: [tags.menu], revalidate },
);

function toProjectCard(locale: Locale) {
  return (p: {
    id: string;
    slug: string;
    clientName: string;
    category: unknown;
    year: number;
    coverImage: string;
    tags: string[];
    title: unknown;
    summary: unknown;
    featured: boolean;
  }): ProjectCardView => ({
    id: p.id,
    slug: p.slug,
    clientName: p.clientName,
    category: localize(p.category, locale),
    year: p.year,
    coverImage: p.coverImage,
    tags: p.tags,
    title: localize(p.title, locale),
    summary: localize(p.summary, locale),
    featured: p.featured,
  });
}
