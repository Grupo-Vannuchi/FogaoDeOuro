import { z } from "zod";

/**
 * Centralised, validated access to environment variables.
 *
 * Importing `env` anywhere guarantees the required variables exist and have the
 * right shape — the process fails fast at boot instead of throwing deep inside a
 * request. Only `NEXT_PUBLIC_*` values are safe to read in the browser; the rest
 * are server-only and must never be imported into a Client Component.
 */
const serverSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
  // Direct (non-pooled) connection for Prisma Migrate. Only used by the Prisma
  // CLI, not at runtime — optional so the app still boots without it.
  DIRECT_URL: z
    .string()
    .url("DIRECT_URL must be a valid connection string")
    .optional(),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters for HS256 signing"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // --- Integrations (optional — funnels degrade gracefully when unset) -------
  // Evolution API (WhatsApp) for funnel completion/message sends.
  EVOLUTION_BASE_URL: z.string().url().optional(),
  EVOLUTION_API_KEY: z.string().min(1).optional(),
  EVOLUTION_INSTANCE: z.string().min(1).optional(),
  // External conversation inbox (the dedicated chat UI — metodon8n now,
  // Chatwoot/Evo CRM once self-hosted). Linked from the admin WhatsApp panel.
  WHATSAPP_INBOX_URL: z.string().url().optional(),
  // Upstash Redis (Vercel Marketplace, "KV" prefix) for durable rate limiting.
  // When absent (e.g. local dev), the limiter falls back to in-memory.
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),
  // Supabase Storage for admin image uploads (server-only). Base project URL +
  // a secret key (`sb_secret_…` or the legacy service_role). When unset, uploads
  // are disabled and the URL fields still work. Never NEXT_PUBLIC — server only.
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be an absolute URL")
    .default("http://localhost:3000"),
});

function formatErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

const isServer = typeof window === "undefined";

function parseServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${formatErrors(parsed.error)}`,
    );
  }
  return parsed.data;
}

function parseClientEnv() {
  // NEXT_PUBLIC_* values are statically inlined by Next, so reference them directly.
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid public environment variables:\n${formatErrors(parsed.error)}`,
    );
  }
  return parsed.data;
}

const clientEnv = parseClientEnv();

/**
 * Server env is only validated on the server. On the client the server fields
 * are left undefined (and must never be accessed there).
 */
export const env = {
  ...clientEnv,
  ...(isServer ? parseServerEnv() : ({} as ReturnType<typeof parseServerEnv>)),
};
