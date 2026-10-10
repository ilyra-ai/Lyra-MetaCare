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
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-primary">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-2">
            <PlanBadge planKey={currentPlanKey} />
            <CardTitle className="text-xl font-semibold tracking-tight">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-foreground/80">{description}</p>
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
