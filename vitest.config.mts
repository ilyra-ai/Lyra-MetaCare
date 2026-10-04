import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Vite 8 resolve os aliases do tsconfig.json (ex.: "@/*") nativamente,
    // sem depender do plugin vite-tsconfig-paths.
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
  },
});
