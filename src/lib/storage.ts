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

/**
 * Public bucket created in the Supabase project (Storage → New bucket).
 * Configurable via `SUPABASE_BUCKET`, defaulting to `media` (see env.ts) —
 * the bucket name belongs to the deployment, not to the source. Read through a
 * function, not a module-scope constant, so importing this module never depends
 * on the env being complete: unconfigured Storage is a supported state
 * (`isStorageConfigured()`).
 */
function bucket(): string {
  return env.SUPABASE_BUCKET;
}

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
  return `${storageBase()}/storage/v1/object/public/${bucket()}/${path}`;
}

/**
 * Does this failed Storage response mean "that bucket doesn't exist"?
 *
 * Supabase answers a missing bucket with **HTTP 400** — the real cause travels
 * in the body (`{"statusCode":"404","error":"Bucket not found",
 * "code":"NoSuchBucket"}`), verified against the live project — so the status
 * alone is not enough. A bare 404 is accepted too: the object endpoint takes
 * any object name, so only the bucket can be missing from that path.
 */
function isMissingBucket(status: number, body: string): boolean {
  return status === 404 || /NoSuchBucket|Bucket not found/i.test(body);
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
      `${storageBase()}/storage/v1/object/${bucket()}/${path}`,
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
      // A missing bucket is the likeliest misconfiguration — `SUPABASE_BUCKET`
      // naming a bucket the project doesn't have — and it used to reach the
      // operator as the generic "try again" message, hiding the cause. Give it
      // its own error key so the admin UI can name it.
      if (isMissingBucket(res.status, body)) {
        return { ok: false, error: "bucket_not_found" };
      }
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
  const prefix = `${storageBase()}/storage/v1/object/public/${bucket()}/`;
  if (!url.startsWith(prefix)) return; // not one of ours
  const path = url.slice(prefix.length);
  try {
    await fetch(`${storageBase()}/storage/v1/object/${bucket()}/${path}`, {
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
