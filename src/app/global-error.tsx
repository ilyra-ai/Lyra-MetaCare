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
          className="flex min-h-screen items-center justify-center px-4 py-10"
        >
          <div className="flex w-full max-w-xl flex-col items-center gap-5 rounded-xl border border-border bg-card p-6 text-center sm:p-10">
            <p className="text-sm font-medium text-muted-foreground">
              Lyra MetaCare
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Algo saiu do ritmo por aqui.
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Encontramos um erro inesperado ao carregar a aplicação. Você pode
              tentar novamente agora; se o problema continuar, volte em alguns
              minutos.
            </p>
            {error.digest ? (
              <p className="break-all font-mono text-xs text-muted-foreground">
                Código de referência: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
