import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

// Loader opcional do Dyad: adiciona data-dyad-id/data-dyad-name aos
// componentes JSX em desenvolvimento. Ele depende da API de loaders do
// webpack (o Turbopack, bundler padrão do Next.js 16, falha ao executá-lo com
// "Reading source code for parsing failed"), por isso só é registrado quando
// ENABLE_DYAD_COMPONENT_TAGGER=true e o servidor é iniciado com
// `pnpm dev:webpack`. Sem a variável, o `webpack` não é definido e o build
// padrão segue 100% em Turbopack.
const habilitarTaggerDyad =
  process.env.NODE_ENV === 'development' &&
  process.env.ENABLE_DYAD_COMPONENT_TAGGER === 'true';

const nextConfig: NextConfig = {
  ...(habilitarTaggerDyad
    ? {
        webpack: (config) => {
          config.module.rules.push({
            test: /\.(jsx|tsx)$/,
            exclude: /node_modules/,
            enforce: 'pre',
            use: '@dyad-sh/nextjs-webpack-component-tagger',
          });
          return config;
        },
      }
    : {}),
};

// O Sentry só envia eventos quando NEXT_PUBLIC_SENTRY_DSN está definido e só
// faz upload de source maps quando SENTRY_AUTH_TOKEN, SENTRY_ORG e
// SENTRY_PROJECT estão presentes. Sem essas variáveis o build segue normal.
const sentryUploadConfigurado = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT
);

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: sentryUploadConfigurado,
  sourcemaps: {
    disable: !sentryUploadConfigurado,
  },
  telemetry: false,
});
