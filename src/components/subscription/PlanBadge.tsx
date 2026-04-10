'use client';

import { Crown, ShieldCheck, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlanKey } from '@/types/subscription';

const planVisuals: Record<
  PlanKey,
  {
    label: string;
    className: string;
    icon: typeof Sparkles;
  }
> = {
  free: {
    label: 'Free',
    className: 'border-border bg-muted text-muted-foreground shadow-sm',
    icon: Sparkles,
  },
  meta: {
    label: 'Meta',
    className: 'border-primary/20 bg-primary/10 text-primary shadow-teal',
    icon: ShieldCheck,
  },
  care: {
    label: 'Care',
    className: 'border-accent/20 bg-accent/10 text-accent shadow-coral',
    icon: Crown,
  },
};

export function PlanBadge({ planKey }: { planKey: PlanKey }) {
  const visual = planVisuals[planKey];
  const Icon = visual.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
        visual.className
      )}
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {visual.label}
    </Badge>
  );
}
