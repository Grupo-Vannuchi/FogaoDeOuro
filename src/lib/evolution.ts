import "server-only";
import { unstable_cache, updateTag } from "next/cache";
import { env } from "@/lib/env";
import { tags } from "@/lib/cache";
import { toWhatsappNumber } from "@/lib/phone";

/**
 * Evolution API (WhatsApp) client. Server-only — the global API key never
 * reaches the browser. Two surfaces:
 *  - `sendText`: best-effort message send (never throws) to a single number.
 *    Picks the instance per call (explicit override → default). Nothing calls
 *    it today — `sendToGroup` below is what the lead notification flow
 *    (`lead-notify.ts`) uses. **Kept on purpose:** the ability to message a
 *    single customer is part of what this white-label offers, and the client
 *    was told the system has it. Do not delete it as dead code.
 *  - instance management (`fetchInstances`, `createInstance`, `connectInstance`,
 *    `getConnectionState`, `logoutInstance`, `deleteInstance`): admin-only, used
 *    by the WhatsApp panel. These surface errors to the admin UI.
 */

export type SendResult = { ok: true } | { ok: false; error: string };
export type EvoResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Whether the Evolution server is configured (base URL + global key). */
export function isEvolutionConfigured(): boolean {
  return Boolean(env.EVOLUTION_BASE_URL && env.EVOLUTION_API_KEY);
}

/** Default instance to send from when a call doesn't pick its own. */
export function defaultInstance(): string | null {
  return env.EVOLUTION_INSTANCE ?? null;
}

function serverBase(): string {
  return env.EVOLUTION_BASE_URL!.replace(/\/+$/, "");
}

/** Low-level request to the Evolution server with the global key. Never throws. */
async function evoRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  timeoutMs = 8_000,
): Promise<EvoResult<T>> {
  if (!isEvolutionConfigured()) return { ok: false, error: "not_configured" };
  try {
    const res = await fetch(`${serverBase()}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: env.EVOLUTION_API_KEY!,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      // Keep the wait short so a slow/unreachable server degrades quickly instead
      // of hanging the request. `fetchInstances` overrides this (it's much slower).
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      const error = `http_${res.status}: ${text.slice(0, 300)}`;
      console.error(`Evolution ${method} ${path} failed`, error);
      return { ok: false, error };
    }
    const data = text ? (JSON.parse(text) as T) : ({} as T);
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "fetch_failed";
    console.error(`Evolution ${method} ${path} error`, message);
    return { ok: false, error: message };
  }
}

/** Send a plain-text WhatsApp message to an E.164 number, from a given instance
 * (falls back to the default instance). Best-effort: never throws. */
export async function sendText(
  phoneE164: string,
  message: string,
  instance?: string | null,
): Promise<SendResult> {
  if (!isEvolutionConfigured()) return { ok: false, error: "not_configured" };
  if (!message.trim()) return { ok: false, error: "empty_message" };
  const inst = instance || defaultInstance();
  if (!inst) return { ok: false, error: "no_instance" };

  // Instance names can contain spaces (e.g. "BOAS VINDAS") — encode the segment.
  const url = `${serverBase()}/message/sendText/${encodeURIComponent(inst)}`;
  const number = toWhatsappNumber(phoneE164);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.EVOLUTION_API_KEY!,
      },
      body: JSON.stringify({ number, text: message }),
      // Don't let a slow/unreachable instance hang the caller's request.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const error = `http_${res.status}: ${body.slice(0, 200)}`;
      console.error("Evolution sendText failed", error);
      return { ok: false, error };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "fetch_failed";
    console.error("Evolution sendText error", message);
    return { ok: false, error: message };
  }
}

// --- Instance management (admin panel) ---

export type EvoInstance = {
  name: string;
  /** "open" (connected) | "connecting" | "close" (disconnected). */
  state: string;
  /** Connected WhatsApp number / profile, when available. */
  number: string | null;
  profileName: string | null;
};

export type EvoQrCode = {
  /** "data:image/png;base64,…" — usable directly as an <img> src. */
  base64: string | null;
  pairingCode: string | null;
};

/** Read a field from an object trying several possible keys (shape varies by
 * Evolution version: flat in v2, wrapped in `{ instance: {…} }` in v1). */
function pick(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v) return v;
  }
  return null;
}

function normalizeInstance(raw: unknown): EvoInstance | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const inner =
    o.instance && typeof o.instance === "object"
      ? (o.instance as Record<string, unknown>)
      : o;
  const name = pick(inner, ["name", "instanceName"]);
  if (!name) return null;
  const ownerJid = pick(inner, ["ownerJid", "owner"]);
  return {
    name,
    state: pick(inner, ["connectionStatus", "state", "status"]) ?? "close",
    number: ownerJid ? ownerJid.split("@")[0] : pick(inner, ["number"]),
    profileName: pick(inner, ["profileName"]),
  };
}

/**
 * Raw instance list from the Evolution server. This endpoint is SLOW — it
 * gathers connection state for every instance (~5–8s with a dozen instances),
 * so it gets a generous timeout and throws on failure (so failures are never
 * cached by `unstable_cache` below).
 */
async function loadInstances(): Promise<EvoInstance[]> {
  const res = await evoRequest<unknown>(
    "GET",
    "/instance/fetchInstances",
    undefined,
    15_000,
  );
  if (!res.ok) throw new Error(res.error);
  const list = Array.isArray(res.data) ? res.data : [];
  return list.map(normalizeInstance).filter(Boolean) as EvoInstance[];
}

/**
 * Cached instance list. The slow Evolution call is paid once per 60s and shared
 * across every caller of `fetchInstances()` (e.g. the WhatsApp admin panel), so
 * normal page loads are instant. `defaultInstance()` reads `env.EVOLUTION_INSTANCE`
 * directly and never touches this cache. Admin mutations (create/delete/logout)
 * tag-out the cache via `invalidateInstances()`, and Next serves the last good
 * list if a background refresh fails.
 */
const cachedInstances = unstable_cache(loadInstances, ["whatsapp-instances"], {
  tags: [tags.whatsappInstances],
  revalidate: 60,
});

/**
 * List every instance on the server. Cached by default (fast); pass `force` to
 * bypass the cache for a fresh read (e.g. the admin panel's Refresh button).
 */
export async function fetchInstances(
  force = false,
): Promise<EvoResult<EvoInstance[]>> {
  if (!isEvolutionConfigured()) return { ok: false, error: "not_configured" };
  try {
    const data = force ? await loadInstances() : await cachedInstances();
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "fetch_failed",
    };
  }
}

/** Invalidate the cached instance list after a mutation. */
export function invalidateInstances(): void {
  updateTag(tags.whatsappInstances);
}

// --- Groups (lead-notification target picker) ---

export type EvoGroup = { id: string; name: string };

/** Raw group list of an instance. Slow-ish (~3s), so it throws on failure (never
 * cached) and gets a generous timeout. */
async function loadGroups(instance: string): Promise<EvoGroup[]> {
  const res = await evoRequest<unknown>(
    "GET",
    `/group/fetchAllGroups/${encodeURIComponent(instance)}?getParticipants=false`,
    undefined,
    15_000,
  );
  if (!res.ok) throw new Error(res.error);
  const raw = Array.isArray(res.data)
    ? res.data
    : ((res.data as Record<string, unknown>)?.groups ?? []);
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((g) => {
      const o = (g ?? {}) as Record<string, unknown>;
      const id = pick(o, ["id", "jid"]);
      const name = pick(o, ["subject", "name"]) ?? id;
      return id ? { id, name: name ?? id } : null;
    })
    .filter(Boolean) as EvoGroup[];
}

// `unstable_cache` keys on the function arguments too, so each instance gets its
// own 5-min entry.
const cachedGroups = unstable_cache(loadGroups, ["whatsapp-groups"], {
  tags: [tags.whatsappGroups],
  revalidate: 300,
});

/** List an instance's WhatsApp groups (the ones it belongs to). Cached; pass
 * `force` for a fresh read. */
export async function fetchGroups(
  instance: string,
  force = false,
): Promise<EvoResult<EvoGroup[]>> {
  if (!isEvolutionConfigured()) return { ok: false, error: "not_configured" };
  if (!instance) return { ok: false, error: "no_instance" };
  try {
    const data = force ? await loadGroups(instance) : await cachedGroups(instance);
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "fetch_failed",
    };
  }
}

/** Send a plain-text message to a WhatsApp group (by its JID) from an instance.
 * Best-effort — never throws. */
export async function sendToGroup(
  instance: string,
  groupJid: string,
  message: string,
): Promise<SendResult> {
  if (!isEvolutionConfigured()) return { ok: false, error: "not_configured" };
  if (!instance || !groupJid) return { ok: false, error: "no_target" };
  if (!message.trim()) return { ok: false, error: "empty_message" };
  const url = `${serverBase()}/message/sendText/${encodeURIComponent(instance)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.EVOLUTION_API_KEY!,
      },
      body: JSON.stringify({ number: groupJid, text: message }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const error = `http_${res.status}: ${body.slice(0, 200)}`;
      console.error("Evolution sendToGroup failed", error);
      return { ok: false, error };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "fetch_failed";
    console.error("Evolution sendToGroup error", message);
    return { ok: false, error: message };
  }
}

/** Create an instance (Baileys/WhatsApp) and return its first QR code. */
export async function createInstance(name: string): Promise<EvoResult<EvoQrCode>> {
  const res = await evoRequest<Record<string, unknown>>("POST", "/instance/create", {
    instanceName: name,
    qrcode: true,
    integration: "WHATSAPP-BAILEYS",
  });
  if (!res.ok) return res;
  const qr = res.data.qrcode as Record<string, unknown> | undefined;
  return {
    ok: true,
    data: {
      base64: (qr?.base64 as string) ?? null,
      pairingCode: (qr?.pairingCode as string) ?? null,
    },
  };
}

/** Get a fresh QR code to (re)connect an instance. */
export async function connectInstance(name: string): Promise<EvoResult<EvoQrCode>> {
  const res = await evoRequest<Record<string, unknown>>(
    "GET",
    `/instance/connect/${encodeURIComponent(name)}`,
  );
  if (!res.ok) return res;
  return {
    ok: true,
    data: {
      base64: (res.data.base64 as string) ?? null,
      pairingCode: (res.data.pairingCode as string) ?? null,
    },
  };
}

/** Current connection state of an instance ("open" | "connecting" | "close"). */
export async function getConnectionState(name: string): Promise<EvoResult<string>> {
  const res = await evoRequest<Record<string, unknown>>(
    "GET",
    `/instance/connectionState/${encodeURIComponent(name)}`,
  );
  if (!res.ok) return res;
  const inst = res.data.instance as Record<string, unknown> | undefined;
  const state = (inst?.state as string) ?? (res.data.state as string) ?? "close";
  return { ok: true, data: state };
}

/** Disconnect (logout) an instance without deleting it. */
export async function logoutInstance(name: string): Promise<EvoResult<unknown>> {
  return evoRequest("DELETE", `/instance/logout/${encodeURIComponent(name)}`);
}

/** Permanently delete an instance. */
export async function deleteInstance(name: string): Promise<EvoResult<unknown>> {
  return evoRequest("DELETE", `/instance/delete/${encodeURIComponent(name)}`);
}
