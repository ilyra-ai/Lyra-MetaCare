import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium transition-all duration-200 before:absolute before:inset-0 before:rounded-[inherit] before:bg-white/20 before:opacity-0 before:transition-opacity before:duration-200 active:scale-[0.98] active:before:opacity-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-teal text-primary-foreground shadow-teal hover:brightness-105 hover:shadow-lg',
        primary:
          'bg-gradient-teal text-primary-foreground shadow-teal hover:brightness-105 hover:shadow-lg',
        secondary:
          'border border-border bg-card/95 text-foreground shadow-sm hover:bg-muted',
        accent:
          'bg-gradient-coral text-accent-foreground shadow-coral hover:brightness-105 hover:shadow-lg',
        ghost:
          'bg-transparent text-muted-foreground shadow-none hover:bg-muted/70 hover:text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground shadow-coral hover:brightness-95',
        outline:
          'border border-border bg-transparent text-foreground shadow-none hover:bg-muted',
        link: 'rounded-none px-0 py-0 text-primary shadow-none before:hidden hover:underline underline-offset-4',
      },
      size: {
        sm: 'h-8 rounded-full px-3 text-xs',
        default: 'h-10 rounded-full px-5 text-sm',
        lg: 'h-12 rounded-[16px] px-8 text-base',
        xl: 'h-14 rounded-[18px] px-10 text-lg',
        icon: 'h-10 w-10 rounded-full',
      },
    },
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
