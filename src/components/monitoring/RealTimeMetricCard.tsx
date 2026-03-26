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
  const accentStyles = {
    primary: 'bg-primary/12 text-primary',
    accent: 'bg-accent/12 text-accent',
    cosmic: 'bg-cosmic/12 text-cosmic',
    info: 'bg-info/12 text-info',
  };

  return (
    <Card className="border-border/70 bg-card/90 backdrop-blur-xl">
      <CardContent className="flex flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </p>
            <div className="flex items-end gap-2">
              <span className="font-mono text-3xl font-semibold tracking-tight text-foreground">
                {value}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
          <div
            className={cn(
              'flex size-11 items-center justify-center rounded-2xl shadow-sm',
              accentStyles[accent]
            )}
          >
            <Icon />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="size-4" />
            <span>Atualização contínua</span>
          </div>
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? (
              <>
                <ArrowUpRight />
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
