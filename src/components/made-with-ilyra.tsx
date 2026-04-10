import { Sparkles } from 'lucide-react';

export const MadeWithIlyra = () => {
  return (
    <div className="py-3 text-center">
      <a
        href="https://ilyra.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        Feito com
        <Sparkles className="h-3 w-3 text-golden" />
        por iLyra AI
      </a>
    </div>
  );
};
