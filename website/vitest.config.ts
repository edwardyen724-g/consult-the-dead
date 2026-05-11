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
    // Allow individual test files to opt into jsdom via
    // `// @vitest-environment jsdom` at the top of the file.
    environmentMatchGlobs: [
      ["src/app/sign-up/**/*.test.tsx", "jsdom"],
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      // No global include list — v8 only instruments files imported during
      // the run. Per-file thresholds below enforce the ≥95% gate on each
      // capsule file when its own test suite is exercised in isolation.
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/app/**/route.ts", // API routes stay integration-tested
        "src/middleware.ts",
      ],
      thresholds: {
        // Per-file mode enforces ≥95% on every file that is actually
        // instrumented during the test run (i.e. files imported by the
        // tests that are currently executing, not a static include list).
        perFile: true,
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
    },
  },
});
