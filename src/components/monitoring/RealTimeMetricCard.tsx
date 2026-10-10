'use client';

import { Activity, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RealTimeMetricCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  accent?: 'primary' | 'accent' | 'cosmic' | 'info';
  isActive?: boolean;
}

export function RealTimeMetricCard({
  icon: Icon,
  label,
  value,
  unit,
  accent = 'primary',
  isActive = false,
}: RealTimeMetricCardProps) {
  // Fundos suaves chapados por tom (o violeta segue o token `cosmic`).
  const accentStyles = {
    primary: 'bg-sidebar-accent text-primary',
    accent: 'bg-cosmic-light text-cosmic-strong',
    cosmic: 'bg-cosmic-light text-cosmic-strong',
    info: 'bg-info-light text-info',
  };

  return (
    <Card className="min-w-0">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex flex-wrap items-end gap-x-2">
              <span className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground">
                {value}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-md',
              accentStyles[accent]
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="size-4" aria-hidden="true" />
            <span>Atualização contínua</span>
          </div>
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? (
              <>
                <ArrowUpRight aria-hidden="true" />
                ao vivo
              </>
            ) : (
              'aguardando'
            )}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
