import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Vite 8 resolve os aliases do tsconfig.json (ex.: "@/*") nativamente,
    // sem depender do plugin vite-tsconfig-paths.
    tsconfigPaths: true,
  },
  oxc: {
    // O tsconfig.json usa "jsx": "preserve" porque quem compila JSX no app é
    // o Next.js. Nos testes o Oxc precisa transformar o JSX com o runtime
    // automático do React.
    jsx: {
      runtime: 'automatic',
    },
  },
  test: {
    environment: 'node',
  },
});
