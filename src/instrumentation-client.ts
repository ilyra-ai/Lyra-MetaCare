// Inicialização do Sentry no navegador (convenção `instrumentation-client` do
// Next.js 15.3+). Substitui o antigo `sentry.client.config.ts`, que não era
// carregado por nenhum arquivo e deixava o monitoramento inativo.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

import * as Sentry from '@sentry/nextjs';

import { sentryDataCollection } from '@/lib/observability/sentry-data-collection';

Sentry.init({
  // Sem DSN o SDK não envia nenhum evento.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Amostragem integral apenas em desenvolvimento.
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Dados de saúde: nenhuma coleta de usuário, cookies, cabeçalhos, corpos,
  // parâmetros de URL ou variáveis locais.
  dataCollection: sentryDataCollection,

  debug: false,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      // Mascara todo texto e bloqueia mídias para não capturar dados pessoais
      // ou de saúde exibidos na interface.
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
