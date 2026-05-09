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
      // Keep the PR gate focused on the newly added hero-quiz surface.
      include: [
        "src/lib/hero-quiz.ts",
        "src/lib/hero-stats.ts",
        "src/components/hero-quiz.tsx",
      ],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/app/**",      // Next.js route handlers — integration-tested by Playwright
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
