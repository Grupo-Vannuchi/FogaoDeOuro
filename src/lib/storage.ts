import "server-only";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Admin image uploads → Supabase Storage. Images are processed server-side with
 * sharp (resized to a per-use standard size + re-encoded to WebP) so the bucket
 * only ever holds small, uniform, efficient files, then served from Supabase's
 * public CDN. Server-only: the secret key never reaches the browser.
 */

/** Public bucket created in the Supabase project (Storage → New bucket). */
const BUCKET = "media";

/** Per-use processing presets: target size + fit. WebP output for all. */
export type ImagePreset = "cover" | "gallery" | "avatar";

const PRESETS: Record<
  ImagePreset,
  { width: number; height?: number; fit: keyof sharp.FitEnum; folder: string }
> = {
  // 16:9 card/cover art (informations covers).
  cover: { width: 1200, height: 675, fit: "cover", folder: "covers" },
  // Gallery photos (pratos, ambiente) — cap the width, keep the aspect ratio.
  gallery: { width: 1600, fit: "inside", folder: "gallery" },
  // Square testimonial avatar.
  avatar: { width: 256, height: 256, fit: "cover", folder: "avatars" },
};

export function isStorageConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SECRET_KEY);
}

/** Base Supabase URL without a trailing slash or the `/rest/v1` REST suffix. */
function storageBase(): string {
  return env
    .SUPABASE_URL!.replace(/\/+$/, "")
    .replace(/\/rest\/v1$/, "");
}

/** Public CDN URL for an object path in the bucket. */
function publicUrl(path: string): string {
  return `${storageBase()}/storage/v1/object/public/${BUCKET}/${path}`;
}

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Process an image buffer to the preset's standard WebP and upload it to the
 * bucket, returning its public URL. Never throws — returns a typed error.
 */
export async function processAndUploadImage(
  input: ArrayBuffer | Buffer,
  preset: ImagePreset,
): Promise<UploadResult> {
  if (!isStorageConfigured()) return { ok: false, error: "not_configured" };
  const cfg = PRESETS[preset];
  try {
    const src: Buffer | Uint8Array =
      input instanceof Buffer ? input : new Uint8Array(input);
    const webp = await sharp(src)
      .rotate() // honour EXIF orientation before resizing
      .resize({
        width: cfg.width,
        height: cfg.height,
        fit: cfg.fit,
        withoutEnlargement: true,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Local/preview uploads land under `dev/` so test images never mix with
    // production files in the shared bucket (easy to spot and purge).
    const envPrefix = process.env.NODE_ENV === "production" ? "" : "dev/";
    const path = `${envPrefix}${cfg.folder}/${randomUUID()}.webp`;
    const res = await fetch(
      `${storageBase()}/storage/v1/object/${BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.SUPABASE_SECRET_KEY!}`,
          apikey: env.SUPABASE_SECRET_KEY!,
          "Content-Type": "image/webp",
          "cache-control": "public, max-age=31536000, immutable",
        },
        body: new Uint8Array(webp),
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Supabase upload failed", res.status, body.slice(0, 300));
      return { ok: false, error: `upload_failed_${res.status}` };
    }
    return { ok: true, url: publicUrl(path) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "process_failed";
    console.error("processAndUploadImage error", message);
    return { ok: false, error: "process_failed" };
  }
}

/**
 * Best-effort delete of a previously-uploaded image (only objects in our bucket
 * — external/legacy URLs are ignored). Never throws.
 */
export async function deleteStoredImage(url: string | null | undefined): Promise<void> {
  if (!url || !isStorageConfigured()) return;
  const prefix = `${storageBase()}/storage/v1/object/public/${BUCKET}/`;
  if (!url.startsWith(prefix)) return; // not one of ours
  const path = url.slice(prefix.length);
  try {
    await fetch(`${storageBase()}/storage/v1/object/${BUCKET}/${path}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SECRET_KEY!}`,
        apikey: env.SUPABASE_SECRET_KEY!,
      },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // best-effort — a leaked object is harmless
  }
}
