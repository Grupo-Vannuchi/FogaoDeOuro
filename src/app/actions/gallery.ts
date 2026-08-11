"use server";

import { updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { tags } from "@/lib/cache";
import {
  galleryPhotoSchema,
  type GalleryPhotoInput,
} from "@/lib/validations/gallery";

export type GalleryActionResult =
  | { ok: true; id: string }
  | { ok: false; error: "unauthorized" | "invalid" | "unknown" };

/** `updateTag` (e não `revalidateTag`) para o admin ver a própria escrita na
 * visita seguinte, não na outra. */
function revalidateGallery(): void {
  updateTag(tags.gallery);
}

function photoData(input: GalleryPhotoInput) {
  return {
    image: input.image,
    caption: input.caption,
    order: input.order,
    published: input.published,
  };
}

export async function createGalleryPhoto(
  input: GalleryPhotoInput,
): Promise<GalleryActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = galleryPhotoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    const p = await prisma.galleryPhoto.create({ data: photoData(parsed.data) });
    revalidateGallery();
    return { ok: true, id: p.id };
  } catch (error) {
    console.error("Failed to create gallery photo", error);
    return { ok: false, error: "unknown" };
  }
}

export async function updateGalleryPhoto(
  id: string,
  input: GalleryPhotoInput,
): Promise<GalleryActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = galleryPhotoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    const p = await prisma.galleryPhoto.update({
      where: { id },
      data: photoData(parsed.data),
    });
    revalidateGallery();
    return { ok: true, id: p.id };
  } catch (error) {
    console.error("Failed to update gallery photo", error);
    return { ok: false, error: "unknown" };
  }
}

export async function deleteGalleryPhoto(id: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };

  try {
    await prisma.galleryPhoto.delete({ where: { id } });
    revalidateGallery();
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete gallery photo", error);
    return { ok: false };
  }
}
