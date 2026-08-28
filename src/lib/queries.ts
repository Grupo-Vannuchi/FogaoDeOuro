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

export type TestimonialView = {
  id: string;
  authorName: string;
  avatarUrl: string | null;
  rating: number;
  quote: string;
  source: string;
  sourceUrl: string | null;
};

export type MenuItemView = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  tags: string[];
  /** 1 (segunda) a 5 (sexta). Vazio = servido todos os dias. */
  weekdays: number[];
  kind: "BUFFET" | "PASTA" | "SHOWCASE";
};

/**
 * Um prato com o que só a página dele e o cardápio digital precisam: a
 * descrição longa e a categoria a que pertence. O card da grade usa
 * `MenuItemView` e não carrega nada disso.
 */
export type DishView = MenuItemView & {
  descriptionLong: string;
  category: { slug: string; name: string };
};

export type MenuCategoryView = {
  id: string;
  slug: string;
  name: string;
  description: string;
  items: MenuItemView[];
};

export type GalleryPhotoView = {
  id: string;
  image: string;
  caption: string;
};

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

export const getTestimonials = unstable_cache(
  async (locale: Locale): Promise<TestimonialView[]> => {
    const rows = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    return rows.map((t) => ({
      id: t.id,
      authorName: t.authorName,
      avatarUrl: t.avatarUrl,
      rating: t.rating,
      quote: localize(t.quote, locale),
      source: t.source,
      sourceUrl: t.sourceUrl,
    }));
  },
  ["testimonials"],
  { tags: [tags.testimonials], revalidate },
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
          // Só a vitrine: os pratos do cardápio da semana vivem em /cardapio, e
          // repeti-los aqui faria as duas páginas dizerem a mesma coisa.
          //
          // E só com foto. A vitrine existe para mostrar a casa: um card sem
          // imagem no meio de uma grade de fotos lê como conteúdo faltando, não
          // como prato. Quem não tem foto continua cadastrado no admin e volta
          // sozinho assim que ganhar uma — o filtro é de exibição, não de dado.
          where: { available: true, kind: "SHOWCASE", NOT: { image: "" } },
          orderBy: { order: "asc" },
        },
      },
    });
    return rows
      .filter((c) => c.items.length > 0)
      .map((c) => ({
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
          weekdays: i.weekdays,
          kind: i.kind,
        })),
      }));
  },
  ["menu"],
  { tags: [tags.menu], revalidate },
);

/**
 * Mapeia uma linha de `menu_items` (com a categoria incluída) para `DishView`.
 * Existe para as três consultas do cardápio não repetirem o mesmo `localize`.
 */
function toDish(
  row: {
    id: string;
    slug: string;
    name: unknown;
    description: unknown;
    descriptionLong: unknown;
    image: string;
    tags: string[];
    weekdays: number[];
    kind: "BUFFET" | "PASTA" | "SHOWCASE";
    category: { slug: string; name: unknown };
  },
  locale: Locale,
): DishView {
  return {
    id: row.id,
    slug: row.slug,
    name: localize(row.name, locale),
    description: localize(row.description, locale),
    descriptionLong: localize(row.descriptionLong, locale),
    image: row.image,
    tags: row.tags,
    weekdays: row.weekdays,
    kind: row.kind,
    category: {
      slug: row.category.slug,
      name: localize(row.category.name, locale),
    },
  };
}

/**
 * Todos os pratos do buffet disponíveis, de uma vez.
 *
 * A página do cardápio filtra por dia no cliente, sem ir ao servidor a cada
 * troca de aba: são poucas dezenas de itens, e quem escaneia o QR Code na mesa
 * costuma estar num 4G ruim — uma requisição por dia seria pior que mandar a
 * semana inteira no primeiro carregamento.
 */
export const getBuffetDishes = unstable_cache(
  async (locale: Locale): Promise<DishView[]> => {
    const rows = await prisma.menuItem.findMany({
      where: { available: true, kind: "BUFFET" },
      orderBy: [{ order: "asc" }, { slug: "asc" }],
      include: { category: { select: { slug: true, name: true } } },
    });
    return rows.map((r) => toDish(r, locale));
  },
  ["menu", "buffet"],
  { tags: [tags.menu], revalidate },
);

/** As massas, que têm preço próprio e não pertencem ao buffet. */
export const getPastaDishes = unstable_cache(
  async (locale: Locale): Promise<DishView[]> => {
    const rows = await prisma.menuItem.findMany({
      where: { available: true, kind: "PASTA" },
      orderBy: [{ order: "asc" }, { slug: "asc" }],
      include: { category: { select: { slug: true, name: true } } },
    });
    return rows.map((r) => toDish(r, locale));
  },
  ["menu", "pasta"],
  { tags: [tags.menu], revalidate },
);

/** Só o que o dropdown de "Nossa Gastronomia" precisa. */
export const getMenuCategoryLinks = unstable_cache(
  async (locale: Locale): Promise<{ slug: string; name: string }[]> => {
    const rows = await prisma.menuCategory.findMany({
      where: {
        published: true,
        // Mesma regra da vitrine: categoria cujos pratos não têm foto some da
        // página, então o link para a âncora dela também sai do menu.
        items: { some: { available: true, kind: "SHOWCASE", NOT: { image: "" } } },
      },
      orderBy: { order: "asc" },
      select: { slug: true, name: true },
    });
    return rows.map((c) => ({ slug: c.slug, name: localize(c.name, locale) }));
  },
  ["menu", "links"],
  { tags: [tags.menu], revalidate },
);

/** As fotos publicadas da galeria, na ordem definida no admin. */
export const getGalleryPhotos = unstable_cache(
  async (locale: Locale): Promise<GalleryPhotoView[]> => {
    const rows = await prisma.galleryPhoto.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    return rows.map((p) => ({
      id: p.id,
      image: p.image,
      caption: localize(p.caption, locale),
    }));
  },
  ["gallery"],
  { tags: [tags.gallery], revalidate },
);
