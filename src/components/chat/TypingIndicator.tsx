'use client';

import { MarcaLyra } from '@/components/marca/MarcaLyra';

/** "A Lyra está escrevendo": a marca e três pontos, no lugar da resposta. */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3" role="status">
      <MarcaLyra tamanho="1.75rem" />
      <span className="sr-only">A Lyra está escrevendo</span>
      <span className="inline-flex items-center gap-1.5" aria-hidden="true">
        <span className="h-2 w-2 animate-pulse rounded-full bg-cosmic [animation-delay:-0.3s] motion-reduce:animate-none" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-cosmic [animation-delay:-0.15s] motion-reduce:animate-none" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-cosmic motion-reduce:animate-none" />
      </span>
    </div>
  );
}
