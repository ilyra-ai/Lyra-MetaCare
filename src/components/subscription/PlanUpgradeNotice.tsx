'use client';

import { ArrowUpRight, LockKeyhole, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { PlanKey } from '@/types/subscription';

interface PlanUpgradeNoticeProps {
  currentPlanKey: PlanKey;
  title: string;
  description: string;
  showAction?: boolean;
}

export function PlanUpgradeNotice({
  currentPlanKey,
  title,
  description,
  showAction = false,
}: PlanUpgradeNoticeProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-2xl ring-1 ring-slate-200/70 dark:ring-slate-800/80">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-sky-500 to-orange-500" />
      <CardHeader className="bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.12),_transparent_40%)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl dark:bg-white dark:text-slate-950">
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
          <Button
            variant="outline"
            className="rounded-full border-slate-300 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-950/60"
            disabled
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Gestão comercial via plano administrado
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
