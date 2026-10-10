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
    className: 'border-border bg-muted text-muted-foreground',
    icon: Sparkles,
  },
  meta: {
    label: 'Meta',
    className: 'border-transparent bg-sidebar-accent text-primary',
    icon: ShieldCheck,
  },
  care: {
    label: 'Care',
    className: 'border-transparent bg-cosmic-light text-cosmic-strong',
    icon: Crown,
  },
};

export function PlanBadge({ planKey }: { planKey: PlanKey }) {
  const visual = planVisuals[planKey];
  const Icon = visual.icon;

  return (
    <Badge variant="outline" className={cn(visual.className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {visual.label}
    </Badge>
  );
}
