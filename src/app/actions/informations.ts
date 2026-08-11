"use server";

import { updateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { tags } from "@/lib/cache";
import {
  informationSchema,
  type InformationInput,
} from "@/lib/validations/information";

export type InformationActionResult =
  | { ok: true; id: string }
  | { ok: false; error: "unauthorized" | "invalid" | "slug_taken" | "unknown" };

/** Informations render on the navbar burger menu, the informations list and each
 * information page. One content tag invalidates every cached page that reads
 * them, in any locale — no need to enumerate paths. (Admin pages are auth-gated,
 * hence dynamic.) Same pattern as the other content revalidators in this
 * directory (e.g. `revalidateTestimonials`). */
function revalidateInformations(): void {
  // Read-your-own-writes: `updateTag` expires the tag immediately so the next
  // request to any page that reads it fetches fresh data. Admin edits must show
  // up on the public site on the very next visit, not the one after.
  updateTag(tags.informations);
}

/** Persist an information's bilingual + scalar fields. Shared by create/update. */
function toData(input: InformationInput) {
  return {
    slug: input.slug,
    icon: input.icon,
    image: input.image,
    order: input.order,
    title: input.title,
    description: input.description,
    content: input.content,
    featured: input.featured,
    published: input.published,
  };
}

/** Create an information entry. Admin-only; re-validates server-side. */
export async function createInformation(
  input: InformationInput,
): Promise<InformationActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = informationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    const information = await prisma.information.create({
      data: toData(parsed.data),
    });
    revalidateInformations();
    return { ok: true, id: information.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "slug_taken" };
    }
    console.error("Failed to create information", error);
    return { ok: false, error: "unknown" };
  }
}

/** Update an existing information entry. Admin-only; re-validates server-side. */
export async function updateInformation(
  id: string,
  input: InformationInput,
): Promise<InformationActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = informationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    const information = await prisma.information.update({
      where: { id },
      data: toData(parsed.data),
    });
    revalidateInformations();
    return { ok: true, id: information.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "slug_taken" };
    }
    console.error("Failed to update information", error);
    return { ok: false, error: "unknown" };
  }
}

/** Delete an information entry. Admin-only. */
export async function deleteInformation(id: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };

  try {
    await prisma.information.delete({ where: { id } });
    revalidateInformations();
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete information", error);
    return { ok: false };
  }
}
