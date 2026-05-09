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
      // Keep the PR gate on the actual changed production files for the home hero.
      include: ["src/app/page.tsx", "src/lib/hero-stats.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
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
