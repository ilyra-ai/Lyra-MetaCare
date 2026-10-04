'use client';

import { CalendarClock, Crown, Sparkles, Wallet } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { getQuotaUsagePercentage } from '@/lib/plans/access';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { BillingActionPanel } from '@/components/subscription/BillingActionPanel';

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function AccountSubscriptionCard() {
  const { data, loading } = useAccountSubscription();

  if (loading) {
    return <Skeleton className="h-80 w-full rounded-3xl" />;
  }

  if (!data) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>
            Não foi possível carregar os dados do plano atual.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const quotaFeatures = data.features.filter(
    (feature) =>
      feature.enabled &&
      feature.featureType === 'quota' &&
      feature.quotaValue !== null
  );

  return (
    <Card className="overflow-hidden border-border/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(249,248,255,0.88))] shadow-[0_24px_60px_-34px_rgba(22,21,48,0.24)]">
      <div
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${data.plan.accentFrom}, ${data.plan.accentTo})`,
        }}
      />
      <CardHeader className="space-y-4 bg-[radial-gradient(circle_at_top_left,rgba(49,155,142,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_35%)]">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <PlanBadge planKey={data.plan.key} />
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {data.plan.name}
            </CardTitle>
            <CardDescription className="text-sm leading-7">
              {data.plan.tagline}
            </CardDescription>
          </div>
          <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(240,101,67,0.12),rgba(139,92,246,0.16),rgba(255,255,255,0.94))] p-3 text-foreground shadow-sm">
            <Crown className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-white/84 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              Ciclo atual
            </div>
            <p className="text-sm font-semibold">
              {data.billingInterval === 'annual' ? 'Anual' : 'Mensal'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vigente até {formatDate(data.currentPeriodEnd)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-white/84 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Status
            </div>
            <p className="text-sm font-semibold capitalize">{data.status}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Início em {formatDate(data.startsAt)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Descrição do plano</p>
          <p className="text-sm leading-7 text-muted-foreground">
            {data.plan.description}
          </p>
        </div>

        {quotaFeatures.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Consumo monitorado</p>
            </div>
            {quotaFeatures.map((feature) => {
              const percentage = getQuotaUsagePercentage(feature);
              return (
                <div
                  key={feature.key}
                  className="rounded-2xl border border-border/70 bg-white/84 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {feature.usedValue ?? 0}/{feature.quotaValue}{' '}
                      {feature.unit || ''}
                    </div>
                  </div>
                  {percentage !== null ? (
                    <Progress value={percentage} className="mt-3 h-2.5" />
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-white/84 p-4 text-sm text-muted-foreground backdrop-blur-sm">
            Seu plano atual não possui quotas numéricas expostas nesta tela.
          </div>
        )}

        <div className="space-y-3 rounded-2xl border border-border/70 bg-white/84 p-4 backdrop-blur-sm">
          <p className="text-sm font-semibold">Ações comerciais</p>
          <p className="text-sm text-muted-foreground">
            Checkout e portal de cobrança ficam disponíveis aqui quando o
            ambiente Stripe estiver configurado com chaves e webhook reais.
          </p>
          <BillingActionPanel currentPlanKey={data.plan.key} />
        </div>
      </CardContent>
    </Card>
  );
}
