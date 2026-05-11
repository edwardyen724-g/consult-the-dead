import { defineConfig, devices } from "playwright/test";

/**
 * Playwright configuration for browser smoke tests.
 *
 * Targets the live production site by default.  Set BASE_URL to override
 * (e.g. `BASE_URL=http://localhost:3000 pnpm playwright test` for local runs).
 */
const BASE_URL = process.env.BASE_URL ?? "https://consultthedead.com";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
