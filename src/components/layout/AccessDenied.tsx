'use client';

import { ShieldAlert } from 'lucide-react';

/*
  Tela de acesso negado das áreas administrativas: mesma estrutura em todas
  as páginas, com `<main>` como destino do "pular para o conteúdo".
*/
export function AccessDenied({
  description = 'Você não tem permissão para acessar esta página.',
}: {
  description?: string;
}) {
  return (
    <main
      id="conteudo-principal"
      className="flex min-h-screen items-center justify-center bg-background p-4"
    >
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-destructive-light text-destructive"
        >
          <ShieldAlert className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold text-foreground">
          Acesso negado
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </section>
    </main>
  );
}
