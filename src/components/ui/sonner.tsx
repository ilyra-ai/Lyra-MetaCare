'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'light' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-[20px] border border-white/80 bg-card/95 text-card-foreground shadow-xl backdrop-blur-xl',
          title: 'text-sm font-semibold text-foreground',
          description: 'text-sm text-muted-foreground',
          actionButton:
            'rounded-full bg-primary text-primary-foreground shadow-teal',
          cancelButton:
            'rounded-full border border-border bg-secondary text-secondary-foreground',
          success:
            'border-success/20 bg-success-light text-success shadow-[0_8px_32px_rgba(16,185,129,0.16)]',
          error:
            'border-destructive/20 bg-destructive-light text-destructive shadow-[0_8px_32px_rgba(220,38,38,0.16)]',
          warning:
            'border-warning/20 bg-warning-light text-warning shadow-[0_8px_32px_rgba(245,158,11,0.16)]',
          info: 'border-info/20 bg-info-light text-info shadow-[0_8px_32px_rgba(99,102,241,0.16)]',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
