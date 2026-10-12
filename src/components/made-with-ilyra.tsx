import { Sparkles } from 'lucide-react';

// Rodapé das páginas do app (landmark `contentinfo`). O link tem altura
// mínima de 44px (alvo de toque confortável no celular; antes eram 16px).
export const MadeWithIlyra = () => {
  return (
    <footer className="py-1 text-center">
      <a
        href="https://ilyra.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        Feito com
        <Sparkles className="h-3 w-3 text-golden" aria-hidden="true" />
        por iLyra AI
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    </footer>
  );
};
