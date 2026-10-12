'use client';

import { cn } from '@/lib/utils';
import { type CarouselApi } from '@/components/ui/carousel';
import * as React from 'react';

/**
 * Índice (base 0) da etapa visível do carrossel. O índice vive no Embla
 * (store externo): useSyncExternalStore lê o valor atual e assina as
 * mudanças, removendo o listener na desmontagem.
 */
export function useEtapaAtual(api: CarouselApi | undefined): number {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (!api) {
        return () => undefined;
      }
      api.on('select', onStoreChange);
      api.on('reInit', onStoreChange);
      return () => {
        api.off('select', onStoreChange);
        api.off('reInit', onStoreChange);
      };
    },
    [api]
  );
  return React.useSyncExternalStore(
    subscribe,
    () => (api ? api.selectedScrollSnap() : 0),
    () => 0
  );
}

interface OnboardingNavigationDotsProps {
  api: CarouselApi | undefined;
  count: number;
}

export function OnboardingNavigationDots({
  api,
  count,
}: OnboardingNavigationDotsProps) {
  const atual = useEtapaAtual(api);

  // Os pontos são só visuais; o progresso é anunciado pelo texto "Etapa X
  // de N" (antes eram um `role="tablist"` sem abas, que não informava nada
  // ao leitor de tela).
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-2 rounded-full transition-[width,background-color] duration-200',
              index === atual ? 'w-6 bg-primary' : 'w-2 bg-control',
              index < atual && 'bg-primary/45'
            )}
          />
        ))}
      </div>
      <p className="text-xs font-medium tabular-nums text-muted-foreground">
        Etapa {atual + 1} de {count}
      </p>
    </div>
  );
}
