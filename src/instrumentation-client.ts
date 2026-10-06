// Inicialização do Sentry no navegador (convenção `instrumentation-client` do
// Next.js 15.3+).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
//
// O SDK (cerca de 160 KB comprimidos, com o Session Replay) só é baixado
// quando NEXT_PUBLIC_SENTRY_DSN está definido: sem DSN o Sentry não envia
// nada, e antes o pacote inteiro era carregado em todas as páginas mesmo
// assim. Com DSN, o carregamento é assíncrono e não bloqueia a hidratação.

import type * as SentryNamespace from '@sentry/nextjs';

import { sentryDataCollection } from '@/lib/observability/sentry-data-collection';

type Sentry = typeof SentryNamespace;

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
let sentry: Sentry | null = null;

if (dsn) {
  void import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,

      // Amostragem integral apenas em desenvolvimento.
      tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

      // Dados de saúde: nenhuma coleta de usuário, cookies, cabeçalhos,
      // corpos, parâmetros de URL ou variáveis locais.
      dataCollection: sentryDataCollection,

      debug: false,

      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,

      integrations: [
        Sentry.replayIntegration({
          // Mascara todo texto e bloqueia mídias para não capturar dados
          // pessoais ou de saúde exibidos na interface.
          maskAllText: true,
          maskAllInputs: true,
          blockAllMedia: true,
        }),
      ],
    });
    sentry = Sentry;
  });
}

export function onRouterTransitionStart(
  ...args: Parameters<Sentry['captureRouterTransitionStart']>
) {
  sentry?.captureRouterTransitionStart(...args);
}
