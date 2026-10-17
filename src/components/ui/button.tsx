import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/*
  Botões do sistema "Lyra Clean": cores chapadas, raio de 10–12px e foco
  visível. O teal do logo é a ação principal; o coral (`accent`) fica para ações
  de IA. Sem gradientes, brilhos ou sombras coloridas.
*/
const buttonVariants = cva(
  // Ícones sem tamanho próprio ficam em 16 px (antes saíam em 24 px, maiores
  // que o texto); anel de foco com o recuo na cor do fundo (antes um halo
  // branco no escuro); leve afundamento ao clicar (estado ativo).
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-[color,background-color,border-color,transform] duration-(--duracao-rapida) ease-saida active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary:
          'border border-border bg-card text-foreground hover:bg-muted',
        accent: 'bg-accent text-accent-foreground hover:bg-accent-hover',
        ghost:
          'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-muted',
        link: 'h-auto px-0 py-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 rounded-sm px-3 text-xs',
        default: 'h-10 rounded px-4 text-sm',
        lg: 'h-11 rounded-md px-5 text-body font-semibold',
        xl: 'h-12 rounded-md px-6 text-base font-semibold',
        icon: 'h-10 w-10 rounded',
      },
    },
    // O tamanho padrão anulava o `h-auto px-0` do link (o cva aplica o
    // tamanho depois da variante): o link virava um bloco de 40 px.
    compoundVariants: [
      {
        variant: 'link',
        className: 'h-auto rounded-xs px-0 py-0 active:translate-y-0',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        // Escala dos botões do construtor de UI (app.sizing.buttonScale).
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        // Sem `type`, um <button> dentro de formulário envia o formulário:
        // o padrão é "button" e o envio é sempre explícito (tarefa 60).
        type={asChild ? type : (type ?? 'button')}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
