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
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/app/**",      // Next.js route handlers — integration-tested by Playwright
        "src/middleware.ts",
      ],
      thresholds: {
        lines: 0,   // gate starts at 0; raise once coverage backfill proceeds
        branches: 0,
        functions: 0,
        statements: 0,
      },
    },
  },
});
