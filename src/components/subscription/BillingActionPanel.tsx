'use client';

import * as React from 'react';
import { ArrowUpRight, CreditCard, Loader2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccountBilling } from '@/hooks/use-account-billing';
import { PlanKey } from '@/types/subscription';

const PLAN_ORDER: Record<PlanKey, number> = {
  free: 0,
  meta: 1,
  care: 2,
};

function extractApiError(payload: unknown) {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }

  return undefined;
}

export function BillingActionPanel({
  currentPlanKey,
  compact = false,
  preferredPlanKey,
}: {
  currentPlanKey: PlanKey;
  compact?: boolean;
  preferredPlanKey?: PlanKey;
}) {
  const { data, loading, refresh } = useAccountBilling();
  const [actionKey, setActionKey] = React.useState<string | null>(null);

  const handleRedirectAction = React.useCallback(
    async (
      path: '/api/billing/checkout' | '/api/billing/portal',
      body?: object
    ) => {
      setActionKey(path + JSON.stringify(body ?? {}));
      try {
        const response = await fetch(path, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const payload = (await response.json()) as {
          url?: string;
          error?: string;
        };

        if (!response.ok || typeof payload.url !== 'string') {
          throw new Error(
            extractApiError(payload) || 'Falha ao iniciar o fluxo comercial.'
          );
        }

        window.location.href = payload.url;
      } catch (error) {
        toast.error('Falha ao iniciar o billing externo.', {
          description:
            error instanceof Error ? error.message : 'Erro desconhecido.',
        });
        await refresh();
      } finally {
        setActionKey(null);
      }
    },
    [refresh]
  );

  if (loading) {
    return compact ? (
      <Skeleton className="h-10 w-full rounded-[10px]" />
    ) : (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-[10px]" />
        <Skeleton className="h-10 w-full rounded-[10px]" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (!data.environment.configured) {
    return (
      <Alert className="rounded-md border-border bg-card shadow-none">
        <Settings2 className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Billing externo ainda não configurado</AlertTitle>
        <AlertDescription className="break-words">
          O app já possui a camada Stripe pronta, mas este ambiente ainda não
          recebeu: {data.environment.missingKeys.join(', ')}.
        </AlertDescription>
      </Alert>
    );
  }

  const canCheckoutCurrentPlan =
    currentPlanKey !== 'free' && data.subscriptionSource !== 'stripe';

  const commercialPlans = data.plans.filter((plan) => {
    if (!plan.purchaseEnabled) {
      return false;
    }

    if (preferredPlanKey && plan.key !== preferredPlanKey) {
      return false;
    }

    if (plan.key === currentPlanKey) {
      return canCheckoutCurrentPlan;
    }

    return PLAN_ORDER[plan.key] > PLAN_ORDER[currentPlanKey];
  });

  const portalEligible =
    data.customerLinked &&
    data.environment.portalEnabled &&
    data.subscriptionSource === 'stripe';

  if (!portalEligible && commercialPlans.length === 0) {
    return (
      <Alert className="rounded-md border-border bg-card shadow-none">
        <Settings2 className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Nenhuma ação comercial disponível agora</AlertTitle>
        <AlertDescription>
          {currentPlanKey === 'care'
            ? 'Seu usuário já está no plano mais alto do catálogo publicado e ainda não existe cobrança Stripe vinculada para abrir o portal.'
            : 'O catálogo comercial deste ambiente não expôs um checkout aplicável para o seu estado atual. Revise os price IDs do plano e a origem da assinatura para liberar a próxima ação.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {portalEligible ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleRedirectAction('/api/billing/portal')}
          disabled={actionKey === '/api/billing/portal{}'}
        >
          {actionKey === '/api/billing/portal{}' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Gerenciar cobrança no portal
        </Button>
      ) : null}

      {commercialPlans.map((plan) => {
        const isCurrentPlanCheckout = plan.key === currentPlanKey;

        return (
          <div
            key={plan.key}
            className={
              compact
                ? 'space-y-2'
                : 'space-y-3 rounded-md border border-border bg-card p-4'
            }
          >
            {!compact ? (
              <div>
                <p className="text-sm font-semibold">{plan.name}</p>
                <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                {isCurrentPlanCheckout ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Seu entitlement já está neste plano. O checkout abaixo serve
                    para ativar a cobrança externa real sem trocar o nível atual
                    da assinatura.
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              {plan.availableIntervals.includes('monthly') ? (
                <Button
                  className="h-auto min-h-10 whitespace-normal"
                  onClick={() =>
                    handleRedirectAction('/api/billing/checkout', {
                      planKey: plan.key,
                      billingInterval: 'monthly',
                    })
                  }
                  disabled={
                    actionKey ===
                    '/api/billing/checkout{"planKey":"' +
                      plan.key +
                      '","billingInterval":"monthly"}'
                  }
                >
                  {actionKey ===
                  '/api/billing/checkout{"planKey":"' +
                    plan.key +
                    '","billingInterval":"monthly"}' ? (
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowUpRight className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  {isCurrentPlanCheckout
                    ? `Ativar cobrança ${plan.name} mensal`
                    : `Assinar ${plan.name} mensal`}
                </Button>
              ) : null}
              {plan.availableIntervals.includes('annual') ? (
                <Button
                  variant="outline"
                  className="h-auto min-h-10 whitespace-normal"
                  onClick={() =>
                    handleRedirectAction('/api/billing/checkout', {
                      planKey: plan.key,
                      billingInterval: 'annual',
                    })
                  }
                  disabled={
                    actionKey ===
                    '/api/billing/checkout{"planKey":"' +
                      plan.key +
                      '","billingInterval":"annual"}'
                  }
                >
                  {actionKey ===
                  '/api/billing/checkout{"planKey":"' +
                    plan.key +
                    '","billingInterval":"annual"}' ? (
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowUpRight className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  {isCurrentPlanCheckout
                    ? `Ativar cobrança ${plan.name} anual`
                    : `Assinar ${plan.name} anual`}
                </Button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
