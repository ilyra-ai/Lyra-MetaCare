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
      <Skeleton className="h-10 w-full rounded-full" />
    ) : (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (!data.environment.configured) {
    return (
      <Alert>
        <Settings2 className="h-4 w-4" />
        <AlertTitle>Billing externo ainda não configurado</AlertTitle>
        <AlertDescription>
          O app já possui a camada Stripe pronta, mas este ambiente ainda não
          recebeu: {data.environment.missingKeys.join(', ')}.
        </AlertDescription>
      </Alert>
    );
  }

  const upgradePlans = data.plans.filter((plan) => {
    if (!plan.purchaseEnabled) {
      return false;
    }

    if (preferredPlanKey && plan.key !== preferredPlanKey) {
      return false;
    }

    return PLAN_ORDER[plan.key] > PLAN_ORDER[currentPlanKey];
  });

  const portalEligible =
    data.customerLinked &&
    data.environment.portalEnabled &&
    data.subscriptionSource === 'stripe';

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {portalEligible ? (
        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={() => handleRedirectAction('/api/billing/portal')}
          disabled={actionKey === '/api/billing/portal{}'}
        >
          {actionKey === '/api/billing/portal{}' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          Gerenciar cobrança no portal
        </Button>
      ) : null}

      {upgradePlans.map((plan) => (
        <div
          key={plan.key}
          className={compact ? 'space-y-2' : 'rounded-2xl border p-4 space-y-3'}
        >
          {!compact ? (
            <div>
              <p className="text-sm font-semibold">{plan.name}</p>
              <p className="text-xs text-muted-foreground">{plan.tagline}</p>
            </div>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {plan.availableIntervals.includes('monthly') ? (
              <Button
                className="rounded-full"
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                )}
                Assinar {plan.name} mensal
              </Button>
            ) : null}
            {plan.availableIntervals.includes('annual') ? (
              <Button
                variant="outline"
                className="rounded-full"
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                )}
                Assinar {plan.name} anual
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
