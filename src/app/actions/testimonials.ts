"use server";

import { updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { tags } from "@/lib/cache";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/validations/testimonial";

export type TestimonialActionResult =
  | { ok: true; id: string }
  | { ok: false; error: "unauthorized" | "invalid" | "unknown" };

/** Testimonials render on the home page. One content tag invalidates every
 * cached page that reads them, in any locale. (Admin pages are auth-gated,
 * hence dynamic.) */
function revalidateTestimonials(): void {
  // Read-your-own-writes: `updateTag` expires the tag immediately so the next
  // request to any page that reads it fetches fresh data, rather than the
  // stale-while-revalidate serve of `revalidateTag(tag, "max")`. Admin edits
  // must show up on the public site on the very next visit, not the one after.
  updateTag(tags.testimonials);
}

/** Persist a testimonial's fields. Shared by create and update. */
function toData(input: TestimonialInput) {
  return {
    authorName: input.authorName,
    avatarUrl: input.avatarUrl || null,
    rating: input.rating,
    quote: input.quote,
    source: input.source,
    sourceUrl: input.sourceUrl || null,
    order: input.order,
    published: input.published,
  };
}

/** Create a testimonial. Admin-only; re-validates server-side. */
export async function createTestimonial(
  input: TestimonialInput,
): Promise<TestimonialActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    const t = await prisma.testimonial.create({ data: toData(parsed.data) });
    revalidateTestimonials();
    return { ok: true, id: t.id };
  } catch (error) {
    console.error("Failed to create testimonial", error);
    return { ok: false, error: "unknown" };
  }
}

/** Update an existing testimonial. Admin-only; re-validates server-side. */
export async function updateTestimonial(
  id: string,
  input: TestimonialInput,
): Promise<TestimonialActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    const t = await prisma.testimonial.update({
      where: { id },
      data: toData(parsed.data),
    });
    revalidateTestimonials();
    return { ok: true, id: t.id };
  } catch (error) {
    console.error("Failed to update testimonial", error);
    return { ok: false, error: "unknown" };
  }
}

/** Delete a testimonial. Admin-only. */
export async function deleteTestimonial(id: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };

  try {
    await prisma.testimonial.delete({ where: { id } });
    revalidateTestimonials();
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete testimonial", error);
    return { ok: false };
  }
}
