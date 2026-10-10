'use client';

import { Sparkles } from 'lucide-react';

/*
  Tela de carregamento: marca, mensagem curta e um indicador discreto. O
  `role="status"` anuncia o carregamento a leitores de tela.
*/
export function SplashScreen() {
  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center bg-background px-6"
    >
      <div className="flex w-full max-w-sm flex-col items-center text-center animate-fade-in">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground"
        >
          <Sparkles className="h-6 w-6" strokeWidth={2} />
        </span>
        <p className="mt-4 font-display text-2xl font-semibold lowercase tracking-tight text-foreground">
          lyra
        </p>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Preparando sua leitura do dia: biometria, contexto do céu e protocolos
          personalizados.
        </p>
        <span
          aria-hidden="true"
          className="mt-6 h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary"
        />
      </div>
    </div>
  );
}
