import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Démarre une base MongoDB en mémoire ; le premier lancement télécharge son binaire.
    globalSetup: ['test/global-setup.ts'],
    hookTimeout: 60_000,
  },
});
