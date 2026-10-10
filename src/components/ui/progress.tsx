'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  /**
   * Nome acessível obrigatório: uma barra `role="progressbar"` sem nome é
   * anunciada só como "barra de progresso" (WCAG 4.1.2).
   */
  'aria-label': string;
  /**
   * `astral` usa o violeta reservado a conteúdo astral e de IA; o padrão é
   * o teal das métricas de saúde.
   */
  tone?: 'default' | 'astral';
};

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, tone = 'default', ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-muted',
      className
    )}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full w-full rounded-full transition-transform duration-300',
        tone === 'astral' ? 'bg-cosmic' : 'bg-primary'
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
