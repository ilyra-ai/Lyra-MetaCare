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
    return <Skeleton className="h-80 w-full rounded-xl" />;
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
    <Card className="min-w-0 overflow-hidden">
      {/*
        Faixa com a cor de destaque configurada no plano (dado do catálogo),
        agora chapada: o visual "Lyra Clean" não usa gradientes decorativos.
      */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: data.plan.accentFrom }}
        aria-hidden="true"
      />
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <PlanBadge planKey={data.plan.key} />
            <CardTitle className="text-xl font-semibold tracking-tight">
              {data.plan.name}
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              {data.plan.tagline}
            </CardDescription>
          </div>
          <div className="shrink-0 rounded-md bg-sidebar-accent p-2.5 text-primary">
            <Crown className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="rounded-md border border-border bg-background p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
              Ciclo atual
            </div>
            <p className="text-sm font-semibold">
              {data.billingInterval === 'annual' ? 'Anual' : 'Mensal'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vigente até {formatDate(data.currentPeriodEnd)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Status
            </div>
            <p className="text-sm font-semibold capitalize">{data.status}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Início em {formatDate(data.startsAt)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Descrição do plano</p>
          <p className="text-sm leading-6 text-foreground/80">
            {data.plan.description}
          </p>
        </div>

        {quotaFeatures.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-sm font-semibold">Consumo monitorado</p>
            </div>
            {quotaFeatures.map((feature) => {
              const percentage = getQuotaUsagePercentage(feature);
              return (
                <div
                  key={feature.key}
                  className="rounded-md border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right font-display text-xs font-medium tabular-nums text-foreground">
                      {feature.usedValue ?? 0}/{feature.quotaValue}{' '}
                      {feature.unit || ''}
                    </div>
                  </div>
                  {percentage !== null ? (
                    <Progress
                      aria-label={`Uso de ${feature.name}`}
                      value={percentage}
                      className="mt-3 h-2"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
            Seu plano atual não possui quotas numéricas expostas nesta tela.
          </div>
        )}

        <div className="space-y-3 rounded-md border border-border bg-background p-4">
          <p className="text-sm font-semibold">Ações comerciais</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Checkout e portal de cobrança ficam disponíveis aqui quando o
            ambiente Stripe estiver configurado com chaves e webhook reais.
          </p>
          <BillingActionPanel currentPlanKey={data.plan.key} />
        </div>
      </CardContent>
    </Card>
  );
}
