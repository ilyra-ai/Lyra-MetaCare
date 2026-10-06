import { defineConfig } from 'vitest/config';

// Dois projetos:
// - unit: testes sem infraestrutura externa (`pnpm test`).
// - integration: testes contra um MySQL real (`pnpm test:integration`). O
//   setup global cria um banco isolado `<MYSQL_DATABASE>_test`, aplica as
//   migrations reais e o remove ao final; o banco de desenvolvimento não é
//   tocado. Requer o MySQL do projeto em execução (`./run.sh db`,
//   `python3 run.py db` ou `pnpm db:start`).
const INTEGRATION_GLOB = '**/*.integration.test.{ts,mjs}';

export default defineConfig({
  resolve: {
    // Vite 8 resolve os aliases do tsconfig.json (ex.: "@/*") nativamente,
    // sem depender do plugin vite-tsconfig-paths.
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}', 'scripts/**/*.mjs'],
      exclude: ['**/*.test.{ts,tsx,mjs}', 'src/**/*.d.ts'],
      reporter: ['text-summary', 'json-summary', 'html'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.test.{ts,tsx,mjs}'],
          exclude: ['**/node_modules/**', '.next/**', INTEGRATION_GLOB],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: [INTEGRATION_GLOB],
          exclude: ['**/node_modules/**', '.next/**'],
          globalSetup: ['./tests/integration/global-setup.ts'],
          setupFiles: ['./tests/integration/setup-env.ts'],
          // Um único arquivo por vez: os testes compartilham o banco de teste.
          fileParallelism: false,
          testTimeout: 30_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
