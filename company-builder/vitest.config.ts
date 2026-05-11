import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/components/shared/ErrorBoundary.tsx',
        'src/components/shared/useFocusRestore.ts',
        'src/app/loading.tsx',
        'src/app/error.tsx',
        'src/store/companyStore.ts',
      ],
      exclude: ['src/lib/events.ts'],
      thresholds: {
        // Per-file thresholds for the new/modified shell files
        'src/components/shared/ErrorBoundary.tsx': {
          lines: 95,
          functions: 95,
          branches: 95,
          statements: 95,
        },
        'src/components/shared/useFocusRestore.ts': {
          lines: 95,
          functions: 95,
          branches: 95,
          statements: 95,
        },
        'src/app/loading.tsx': {
          lines: 95,
          functions: 95,
          branches: 95,
          statements: 95,
        },
        'src/app/error.tsx': {
          lines: 95,
          functions: 95,
          branches: 95,
          statements: 95,
        },
      },
    },
  },
});
