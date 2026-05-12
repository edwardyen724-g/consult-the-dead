import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    // Enable Jest-compatible globals (describe/it/expect). The existing
    // share-id.test.ts uses a globals-or-shim pattern so it can also run
    // standalone via `npx tsx`; turning globals on lets vitest collect it.
    globals: true,
    // Exclude Playwright e2e specs — they use playwright/test which is
    // incompatible with the Vitest runner and must be run via `playwright test`.
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: [
        "src/app/page.tsx",
        "src/app/sign-up/**/page.tsx",
        "src/app/sign-up/**/utm-stamper.ts",
        "src/lib/mind-content.ts",
        "src/app/pricing/layout.tsx",
        "src/lib/pricing-copy.ts",
        "src/components/upsell-modal.tsx",
        "src/lib/proof-strip.ts",
        "src/components/ProofStrip.tsx",
        "src/lib/emails/utm.ts",
        "src/lib/emails/suppression.ts",
        "src/lib/emails/send.ts",
        "src/lib/emails/cron.ts",
        "src/lib/emails/templates/welcome.ts",
        "src/lib/emails/templates/recap.ts",
        "src/lib/emails/templates/nudge.ts",
        "src/lib/emails/templates/digest.ts",
        "src/app/sign-up/[[...sign-up]]/SignUpClient.tsx",
        "src/app/sign-up/[[...sign-up]]/UtmStamper.tsx",
        "src/lib/use-clerk-utm-stamper.ts",
        "src/lib/utm.ts",
      ],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/app/**/route.ts", // API routes stay integration-tested
        "src/middleware.ts",
      ],
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
    },
  },
});
