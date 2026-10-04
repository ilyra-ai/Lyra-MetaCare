// Registro do Sentry nos runtimes de servidor do Next.js (Node.js e Edge).
// Sem este arquivo os `sentry.server.config.ts` e `sentry.edge.config.ts` nunca
// eram executados.
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
