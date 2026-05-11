import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
  coverage: {
    provider: 'v8',
    include: ['src/app/api/research/route.ts'],
    thresholds: {
      lines: 95,
      branches: 95,
      functions: 95,
      statements: 95,
    },
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
