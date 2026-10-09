import { Sparkles } from 'lucide-react';

// Rodapé das páginas do app (landmark `contentinfo`).
export const MadeWithIlyra = () => {
  return (
    <footer className="py-3 text-center">
      <a
        href="https://ilyra.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        Feito com
        <Sparkles className="h-3 w-3 text-golden" aria-hidden="true" />
        por iLyra AI
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    </footer>
  );
};
