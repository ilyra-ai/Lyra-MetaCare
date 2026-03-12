'use client';

import { Crown, ShieldCheck, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
    className:
      'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300',
    icon: Sparkles,
  },
  meta: {
    label: 'Meta',
    className:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300',
    icon: ShieldCheck,
  },
  care: {
    label: 'Care',
    className:
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300',
    icon: Crown,
  },
};

export function PlanBadge({ planKey }: { planKey: PlanKey }) {
  const visual = planVisuals[planKey];
  const Icon = visual.icon;

  return (
    <Badge variant="outline" className={visual.className}>
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {visual.label}
    </Badge>
  );
}
