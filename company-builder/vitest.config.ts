import { defineConfig } from 'vitest/config';

const config = defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  coverage: {
    include: ['src/store/companyStore.ts'],
    exclude: ['src/lib/events.ts'],
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});

export default config;
