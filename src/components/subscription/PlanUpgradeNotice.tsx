'use client';

import { LockKeyhole } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { PlanKey } from '@/types/subscription';
import { BillingActionPanel } from '@/components/subscription/BillingActionPanel';

interface PlanUpgradeNoticeProps {
  currentPlanKey: PlanKey;
  title: string;
  description: string;
  showAction?: boolean;
  preferredPlanKey?: PlanKey;
}

export function PlanUpgradeNotice({
  currentPlanKey,
  title,
  description,
  showAction = false,
  preferredPlanKey,
}: PlanUpgradeNoticeProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-border/70">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--cosmic)),hsl(var(--accent)))]" />
      <CardHeader className="bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_45%),radial-gradient(circle_at_top_right,hsl(var(--accent)/0.12),transparent_40%)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-teal text-white shadow-teal">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <PlanBadge planKey={currentPlanKey} />
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
        {showAction ? (
          <BillingActionPanel
            currentPlanKey={currentPlanKey}
            compact
            preferredPlanKey={preferredPlanKey}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
