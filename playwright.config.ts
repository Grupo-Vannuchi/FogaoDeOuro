import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Local-first: runs the app via `npm run dev` (reusing a running
 * server if there is one) against the local DB and runs the specs in `e2e/`.
 * CI wiring (separate job) comes later.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL: "http://localhost:3000",
    // Force the browser locale so next-intl serves Portuguese (default,
    // unprefixed) instead of redirecting to /en.
    locale: "pt-BR",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Locally: the dev server (fast, reused if already running). In CI: a real
    // production build + start, which is what E2E should exercise.
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 180_000 : 120_000,
  },
});
