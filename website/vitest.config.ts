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
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: [
        "src/app/sign-up/**/page.tsx",
        "src/app/sign-up/**/utm-stamper.ts",
        "src/lib/mind-content.ts",
        "src/app/pricing/layout.tsx",
        "src/lib/pricing-copy.ts",
        "src/components/upsell-modal.tsx",
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
