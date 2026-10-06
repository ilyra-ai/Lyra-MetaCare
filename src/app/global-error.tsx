'use client';

import { useEffect } from 'react';
import './globals.css';

// Fronteira de erro do layout raiz (App Router). Substitui o layout inteiro
// quando um erro não tratado ocorre fora das páginas, por isso declara
// <html> e <body> e importa os estilos globais.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // O SDK só existe no cliente quando há DSN (ver instrumentation-client.ts);
    // o import dinâmico reaproveita a instância já inicializada.
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      void import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error);
      });
    }
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <main
          id="conteudo-principal"
          className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-6 text-center"
        >
          <p className="rounded-full border border-border bg-card px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Lyra MetaCare
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Algo saiu do ritmo por aqui.
          </h1>
          <p className="text-base text-muted-foreground">
            Encontramos um erro inesperado ao carregar a aplicação. Você pode
            tentar novamente agora; se o problema continuar, volte em alguns
            minutos.
          </p>
          {error.digest ? (
            <p className="font-mono text-xs text-muted-foreground">
              Código de referência: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-105 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
