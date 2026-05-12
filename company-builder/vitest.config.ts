import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
    },
  },
  coverage: {
    provider: 'v8',
    include: [
      'src/app/api/research/route.ts',
      'src/components/shared/ErrorBoundary.tsx',
    ],
    thresholds: {
      lines: 95,
      branches: 95,
      functions: 95,
      statements: 95,
    },
  },
});
