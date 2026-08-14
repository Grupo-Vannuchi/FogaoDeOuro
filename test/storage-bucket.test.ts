// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";

/**
 * The Storage bucket name is deployment configuration (`SUPABASE_BUCKET`),
 * defaulting to `media`. It feeds four URLs — the upload POST, the public URL
 * handed back to the admin, and the delete path's prefix check + DELETE — so
 * every one of them is asserted here. A partial replacement would write to one
 * bucket and read from another: it looks fine until the image 404s in the
 * browser, which is exactly how the hardcoded name went unnoticed.
 */

const BASE = "https://project-ref.supabase.co";
const ORIGINAL_ENV = { ...process.env };

/** A real (tiny) image, since the upload path runs it through sharp. */
async function tinyPng(): Promise<Buffer> {
  return sharp({
    create: {
      width: 8,
      height: 8,
      channels: 3,
      background: { r: 200, g: 120, b: 10 },
    },
  })
    .png()
    .toBuffer();
}

/** Re-import the module so it picks up the current process.env. */
async function loadStorage() {
  vi.resetModules();
  return import("@/lib/storage");
}

function mockFetchOk() {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response("{}", { status: 200 }));
}

/** URLs the mocked fetch was called with, in order. */
function calledUrls(spy: ReturnType<typeof mockFetchOk>): string[] {
  return spy.mock.calls.map((call) => String(call[0]));
}

beforeEach(() => {
  process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
  process.env.SESSION_SECRET = "s".repeat(32);
  process.env.SUPABASE_URL = BASE;
  process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
  delete process.env.SUPABASE_BUCKET;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe("storage bucket configuration", () => {
  it("defaults to `media` when SUPABASE_BUCKET is unset", async () => {
    const spy = mockFetchOk();
    const { processAndUploadImage } = await loadStorage();

    const res = await processAndUploadImage(await tinyPng(), "gallery");

    expect(res.ok).toBe(true);
    expect(calledUrls(spy)[0]).toContain(
      `${BASE}/storage/v1/object/media/`,
    );
    if (res.ok) {
      expect(res.url).toContain(`${BASE}/storage/v1/object/public/media/`);
    }
  });

  it("uses SUPABASE_BUCKET for the upload and the public URL", async () => {
    process.env.SUPABASE_BUCKET = "outro-bucket";
    const spy = mockFetchOk();
    const { processAndUploadImage } = await loadStorage();

    const res = await processAndUploadImage(await tinyPng(), "gallery");

    expect(res.ok).toBe(true);
    expect(calledUrls(spy)[0]).toContain(
      `${BASE}/storage/v1/object/outro-bucket/`,
    );
    if (res.ok) {
      // Upload target and public URL must name the same bucket, and `media`
      // must not survive anywhere once the deployment names another one.
      expect(res.url).toContain(
        `${BASE}/storage/v1/object/public/outro-bucket/`,
      );
      expect(res.url).not.toContain("/media/");
    }
  });

  it("deletes from the configured bucket and ignores other buckets", async () => {
    process.env.SUPABASE_BUCKET = "outro-bucket";
    const spy = mockFetchOk();
    const { deleteStoredImage } = await loadStorage();

    await deleteStoredImage(
      `${BASE}/storage/v1/object/public/outro-bucket/gallery/x.webp`,
    );
    expect(calledUrls(spy)).toEqual([
      `${BASE}/storage/v1/object/outro-bucket/gallery/x.webp`,
    ]);
    expect(spy.mock.calls[0]?.[1]?.method).toBe("DELETE");

    // A URL in a different bucket is not ours — no request at all.
    spy.mockClear();
    await deleteStoredImage(
      `${BASE}/storage/v1/object/public/media/gallery/x.webp`,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it("reports a missing bucket as its own error, not a generic failure", async () => {
    process.env.SUPABASE_BUCKET = "nao-existe";
    // The shape the live project actually returns: HTTP 400, with the real
    // cause only in the body. Keying off the status alone would miss it.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        '{"statusCode":"404","error":"Bucket not found","message":"Bucket not found","code":"NoSuchBucket"}',
        { status: 400 },
      ),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { processAndUploadImage } = await loadStorage();

    const res = await processAndUploadImage(await tinyPng(), "cover");

    expect(res).toEqual({ ok: false, error: "bucket_not_found" });
  });

  it("keeps other upload failures generic", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"error":"Payload too large"}', { status: 413 }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { processAndUploadImage } = await loadStorage();

    expect(await processAndUploadImage(await tinyPng(), "cover")).toEqual({
      ok: false,
      error: "upload_failed_413",
    });
  });

  it("stays disabled — and silent — when Storage is unconfigured", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    const spy = mockFetchOk();
    // Importing the module must not throw: unconfigured Storage is supported.
    const { isStorageConfigured, processAndUploadImage } = await loadStorage();

    expect(isStorageConfigured()).toBe(false);
    expect(await processAndUploadImage(await tinyPng(), "avatar")).toEqual({
      ok: false,
      error: "not_configured",
    });
    expect(spy).not.toHaveBeenCalled();
  });
});
