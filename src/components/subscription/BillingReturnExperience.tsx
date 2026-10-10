'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  RotateCw,
  TriangleAlert,
} from 'lucide-react';
import { toast } from 'sonner';

import { SplashScreen } from '@/components/SplashScreen';
import { AppShell } from '@/components/layout/AppShell';
import { AccountSubscriptionCard } from '@/components/subscription/AccountSubscriptionCard';
import { BillingActionPanel } from '@/components/subscription/BillingActionPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useAccountBilling } from '@/hooks/use-account-billing';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { PLAN_KEYS, PlanKey } from '@/types/subscription';

function isPlanKey(value: string | null): value is PlanKey {
  return value !== null && PLAN_KEYS.includes(value as PlanKey);
}

function getExperienceCopy(mode: 'success' | 'cancel') {
  if (mode === 'success') {
    return {
      badge: 'Checkout recebido',
      title: 'Estamos sincronizando a sua assinatura',
      description:
        'A Stripe concluiu o redirecionamento para o app. Assim que o webhook for processado, o plano e o ciclo comercial aparecem atualizados na sua conta.',
      alertTitle: 'Próximo passo automático',
      alertDescription:
        'Se a assinatura ainda não mudou nesta tela, atualize em alguns segundos. O provisioning depende do webhook assinado chegar e ser persistido no MySQL.',
      icon: CheckCircle2,
      tone: 'border-success/30 bg-success-light/80 text-success',
      alertVariant: 'border-success/30 bg-success-light/70',
    };
  }

  return {
    badge: 'Checkout cancelado',
    title: 'Nenhuma cobrança foi confirmada',
    description:
      'O fluxo comercial foi interrompido antes da confirmação do checkout. Sua assinatura atual continua sendo a fonte de verdade do app.',
    alertTitle: 'Você pode retomar quando quiser',
    alertDescription:
      'O catálogo comercial continua disponível na sua conta. Se o ambiente Stripe estiver configurado, você pode reiniciar a assinatura imediatamente.',
    icon: TriangleAlert,
    tone: 'border-warning/30 bg-warning-light/80 text-warning',
    alertVariant: 'border-warning/30 bg-warning-light/70',
  };
}

export function BillingReturnExperience({
  mode,
}: {
  mode: 'success' | 'cancel';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const {
    data: subscription,
    loading: subscriptionLoading,
    refresh: refreshSubscription,
  } = useAccountSubscription();
  const {
    data: billing,
    loading: billingLoading,
    refresh: refreshBilling,
  } = useAccountBilling();
  const [refreshing, setRefreshing] = useState(false);

  const selectedPlan = searchParams.get('plan');
  const checkoutSessionId = searchParams.get('session_id');
  const preferredPlanKey = isPlanKey(selectedPlan) ? selectedPlan : undefined;
  const copy = getExperienceCopy(mode);
  const Icon = copy.icon;

  const handleRefreshStatus = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refreshSubscription(), refreshBilling()]);
      router.refresh();
      toast.success('Status da assinatura atualizado.');
    } catch (error) {
      toast.error('Falha ao atualizar o status da assinatura.', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido.',
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (session === undefined || subscriptionLoading || billingLoading) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  const currentPlanKey = subscription?.plan.key ?? 'free';
  const stripePending =
    mode === 'success' &&
    billing?.environment.configured &&
    subscription?.source !== 'stripe';

  return (
    <AppShell>
      <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                {copy.badge}
              </Badge>
              <div className="flex items-start gap-4">
                <div
                  aria-hidden="true"
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md border ${copy.tone}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <CardTitle
                    className="text-2xl font-semibold tracking-tight"
                    role="heading"
                    aria-level={2}
                  >
                    {copy.title}
                  </CardTitle>
                  <CardDescription className="max-w-3xl text-sm leading-7">
                    {copy.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <Alert className={copy.alertVariant}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{copy.alertTitle}</AlertTitle>
                <AlertDescription>{copy.alertDescription}</AlertDescription>
              </Alert>

              {checkoutSessionId ? (
                <Card className="border-dashed bg-background">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Referência do checkout
                    </CardTitle>
                    <CardDescription>
                      Guarde este identificador apenas para auditoria
                      operacional.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <code className="break-all rounded-xl bg-foreground px-3 py-2 text-xs text-background">
                      {checkoutSessionId}
                    </code>
                  </CardContent>
                </Card>
              ) : null}

              {stripePending ? (
                <Alert className="border-info/30 bg-info-light/80">
                  <CreditCard className="h-4 w-4" />
                  <AlertTitle>Sincronização pendente</AlertTitle>
                  <AlertDescription>
                    O checkout retornou, mas a assinatura local ainda não
                    aparece com origem Stripe. Isso normalmente indica que o
                    webhook ainda está em trânsito ou aguardando processamento.
                  </AlertDescription>
                </Alert>
              ) : null}

              {mode === 'cancel' ? (
                <div className="rounded-md border border-border bg-background p-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Retomar assinatura</p>
                    <p className="text-sm text-muted-foreground">
                      Se o catálogo estiver pronto neste ambiente, você pode
                      reiniciar o fluxo comercial sem sair desta tela.
                    </p>
                  </div>
                  <div className="mt-4">
                    <BillingActionPanel
                      currentPlanKey={currentPlanKey}
                      preferredPlanKey={preferredPlanKey}
                    />
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleRefreshStatus} disabled={refreshing}>
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCw className="h-4 w-4" />
                  )}
                  Atualizar assinatura
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/profile')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para minha conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AccountSubscriptionCard />
        </div>
      </div>
    </AppShell>
  );
}
