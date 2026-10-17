import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // `data-slot` permite aplicar a escala dos cards do construtor de UI
    // (app.sizing.cardScale) em todo o app autenticado (ver globals.css).
    data-slot="card"
    className={cn(
      'rounded-xl border border-border bg-card text-card-foreground',
      className
    )}
    {...props}
  />
));

Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-2 p-6', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

/**
 * Título do card como título de verdade (tarefa 60): antes era uma `div`, e
 * cerca de 90 títulos de card não existiam para leitores de tela (WCAG
 * 1.3.1). `h3` por padrão (abaixo do h1 da página e do h2 das seções); `as`
 * ajusta o nível onde a hierarquia pede outro.
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h2' | 'h3' | 'h4' | 'p';
  }
>(({ className, as: Elemento = 'h3', ...props }, ref) => (
  <Elemento
    ref={ref}
    className={cn(
      'font-display text-lg font-semibold leading-tight tracking-tight text-card-foreground',
      className
    )}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm leading-6 text-muted-foreground', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-6 pb-6', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-3 px-6 pb-6 pt-2', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
