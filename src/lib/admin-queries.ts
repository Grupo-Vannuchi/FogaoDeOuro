import "server-only";
import type {
  Client,
  Information,
  Lead,
  LeadStatus,
  LeadType,
  Project,
  Service,
  Stat,
  TeamMember,
  Testimonial,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  newLeads: number;
  totalProjects: number;
  totalServices: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [newLeads, totalProjects, totalServices] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.project.count({ where: { published: true } }),
    prisma.service.count({ where: { published: true } }),
  ]);
  return { newLeads, totalProjects, totalServices };
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

/** All projects (published and drafts) for the admin list, in display order. */
export async function getAdminProjects(): Promise<Project[]> {
  return prisma.project.findMany({
    orderBy: [{ order: "asc" }, { year: "desc" }],
  });
}

export async function getProjectById(id: string): Promise<Project | null> {
  return prisma.project.findUnique({ where: { id } });
}

/** All services (published and drafts) for the admin list, in display order. */
export async function getAdminServices(): Promise<Service[]> {
  return prisma.service.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export async function getServiceById(id: string): Promise<Service | null> {
  return prisma.service.findUnique({ where: { id } });
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

/** All clients (published and drafts) for the admin list, in display order. */
export async function getAdminClients(): Promise<Client[]> {
  return prisma.client.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export async function getClientById(id: string): Promise<Client | null> {
  return prisma.client.findUnique({ where: { id } });
}

/** All team members (published and drafts) for the admin list, in display order. */
export async function getAdminTeam(): Promise<TeamMember[]> {
  return prisma.teamMember.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  return prisma.teamMember.findUnique({ where: { id } });
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

/** All stats (published and drafts) for the admin list, in display order. */
export async function getAdminStats(): Promise<Stat[]> {
  return prisma.stat.findMany({
    orderBy: [{ order: "asc" }, { key: "asc" }],
  });
}

export async function getStatById(id: string): Promise<Stat | null> {
  return prisma.stat.findUnique({ where: { id } });
}
