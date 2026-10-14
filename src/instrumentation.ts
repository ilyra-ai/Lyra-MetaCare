// Registro do Sentry nos runtimes de servidor do Next.js (Node.js e Edge) e
// início da rotina diária do coach. Sem este arquivo os
// `sentry.server.config.ts` e `sentry.edge.config.ts` nunca eram executados.
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
    // Rotina diária do coach (prepara o "Seu dia" de cada pessoa a partir
    // das 3 h locais). Só no servidor Node.js: no Edge não há MySQL.
    const { iniciarRotinaDoCoach } = await import('./lib/coach/rotina');
    iniciarRotinaDoCoach();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
