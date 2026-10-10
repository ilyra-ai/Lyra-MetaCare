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
            'group toast rounded-xl border border-border bg-card text-card-foreground shadow-lg',
          title: 'text-sm font-semibold text-foreground',
          description: 'text-sm text-muted-foreground',
          actionButton: 'rounded-[10px] bg-primary text-primary-foreground',
          cancelButton:
            'rounded-[10px] border border-border bg-secondary text-secondary-foreground',
          success: 'border-success/20 bg-success-light text-success',
          error: 'border-destructive/20 bg-destructive-light text-destructive',
          warning: 'border-warning/20 bg-warning-light text-warning',
          info: 'border-info/20 bg-info-light text-info',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
