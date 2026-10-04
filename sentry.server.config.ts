// Inicialização do Sentry no runtime Node.js, carregada por src/instrumentation.ts.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

import * as Sentry from '@sentry/nextjs';

import { sentryDataCollection } from './src/lib/observability/sentry-data-collection';

Sentry.init({
  // Sem DSN o SDK não envia nenhum evento.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Amostragem integral apenas em desenvolvimento.
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Dados de saúde: nenhuma coleta de usuário, cookies, cabeçalhos, corpos,
  // dados de banco, entradas/saídas de IA ou variáveis locais.
  dataCollection: sentryDataCollection,

  debug: false,
});
