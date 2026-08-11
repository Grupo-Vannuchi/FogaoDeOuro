import "server-only";
import type {
  GalleryPhoto,
  Information,
  Lead,
  LeadStatus,
  LeadType,
  MenuCategory,
  MenuItem,
  Testimonial,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  newLeads: number;
  totalMenuItems: number;
  totalGalleryPhotos: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [newLeads, totalMenuItems, totalGalleryPhotos] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.menuItem.count({ where: { available: true } }),
    prisma.galleryPhoto.count({ where: { published: true } }),
  ]);
  return { newLeads, totalMenuItems, totalGalleryPhotos };
}

export async function getRecentLeads(take = 5): Promise<Lead[]> {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });
}

export type LeadFilters = {
  type?: LeadType;
  status?: LeadStatus;
  tag?: string;
};

export async function getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  return prisma.lead.findMany({
    where: {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.tag ? { tags: { has: filters.tag } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Distinct tags used across all leads, alphabetically sorted (for filters). */
export async function getLeadTags(): Promise<string[]> {
  const rows = await prisma.lead.findMany({ select: { tags: true } });
  const tags = new Set<string>();
  for (const row of rows) for (const tag of row.tags) tags.add(tag);
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/** All informations (published and drafts) for the admin list, in display order. */
export async function getAdminInformations(): Promise<Information[]> {
  return prisma.information.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export async function getInformationById(
  id: string,
): Promise<Information | null> {
  return prisma.information.findUnique({ where: { id } });
}

/** All testimonials (published and drafts) for the admin list, in display order. */
export async function getAdminTestimonials(): Promise<Testimonial[]> {
  return prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export async function getTestimonialById(
  id: string,
): Promise<Testimonial | null> {
  return prisma.testimonial.findUnique({ where: { id } });
}

/** Cardápio completo para o admin: todas as categorias, publicadas ou não,
 * com todos os seus itens. */
export async function getAdminMenu(): Promise<
  (MenuCategory & { items: MenuItem[] })[]
> {
  return prisma.menuCategory.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });
}

export async function getMenuCategoryById(
  id: string,
): Promise<MenuCategory | null> {
  return prisma.menuCategory.findUnique({ where: { id } });
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  return prisma.menuItem.findUnique({ where: { id } });
}

/** Categorias reduzidas ao que o seletor do formulário de item precisa. */
export async function getMenuCategoryOptions(): Promise<
  { id: string; name: unknown }[]
> {
  return prisma.menuCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });
}

/** Todas as fotos da galeria (publicadas e rascunhos) para a lista do admin. */
export async function getAdminGalleryPhotos(): Promise<GalleryPhoto[]> {
  return prisma.galleryPhoto.findMany({ orderBy: { order: "asc" } });
}

export async function getGalleryPhotoById(
  id: string,
): Promise<GalleryPhoto | null> {
  return prisma.galleryPhoto.findUnique({ where: { id } });
}
