'use client';

import { cn } from '@/lib/utils';
import { type CarouselApi } from '@/components/ui/carousel';
import * as React from 'react';

interface OnboardingNavigationDotsProps {
  api: CarouselApi | undefined;
  count: number;
}

export function OnboardingNavigationDots({
  api,
  count,
}: OnboardingNavigationDotsProps) {
  // O índice do slide vive no Embla (store externo): useSyncExternalStore lê o
  // valor atual e assina as mudanças, removendo o listener na desmontagem.
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
  const current = React.useSyncExternalStore(
    subscribe,
    () => (api ? api.selectedScrollSnap() + 1 : 0),
    () => 0
  );

  const dots = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn(
        'h-2 rounded-full transition-[width,background-color] duration-200',
        index === current - 1 ? 'w-6 bg-primary' : 'w-2 bg-control'
      )}
    />
  ));

  return (
    <div
      className="flex items-center space-x-1.5"
      role="tablist"
      aria-label="Progresso do onboarding"
    >
      {dots}
    </div>
  );
}
