"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  processAndUploadImage,
  isStorageConfigured,
  type ImagePreset,
  type UploadResult,
} from "@/lib/storage";

type Result = UploadResult | { ok: false; error: string };

const PRESETS: ImagePreset[] = ["cover", "gallery", "avatar"];
const MAX_BYTES = 15 * 1024 * 1024; // raw upload cap (sharp shrinks it after)

/**
 * Admin-only image upload: takes a raw image + a preset, processes it to a
 * standard WebP and stores it in Supabase Storage, returning the public URL.
 * Called from the admin forms' ImageUploadField.
 */
export async function uploadImageAction(formData: FormData): Promise<Result> {
  if (!(await getCurrentUser())) return { ok: false, error: "unauthorized" };
  if (!isStorageConfigured()) return { ok: false, error: "not_configured" };

  const file = formData.get("file");
  const presetRaw = String(formData.get("preset") ?? "");
  if (!(file instanceof File)) return { ok: false, error: "no_file" };
  if (!PRESETS.includes(presetRaw as ImagePreset)) {
    return { ok: false, error: "bad_preset" };
  }
  if (!file.type.startsWith("image/")) return { ok: false, error: "not_image" };
  if (file.size > MAX_BYTES) return { ok: false, error: "too_large" };

  const bytes = await file.arrayBuffer();
  return processAndUploadImage(bytes, presetRaw as ImagePreset);
}
