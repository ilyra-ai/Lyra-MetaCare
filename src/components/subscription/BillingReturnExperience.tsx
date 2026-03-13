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
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MadeWithIlyra } from '@/components/made-with-ilyra';
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
      tone: 'border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/80 dark:bg-emerald-950/30 dark:text-emerald-100',
      alertVariant:
        'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/80 dark:bg-emerald-950/30',
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
    tone: 'border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-900/80 dark:bg-amber-950/30 dark:text-amber-100',
    alertVariant:
      'border-amber-200 bg-amber-50/80 dark:border-amber-900/80 dark:bg-amber-950/30',
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
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mx-auto grid w-full max-w-7xl gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <Card className="overflow-hidden border-0 shadow-2xl ring-1 ring-slate-200/70 dark:ring-slate-800/80">
                <div className="h-2 w-full bg-gradient-to-r from-teal-500 via-sky-500 to-orange-500" />
                <CardHeader className="space-y-4 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.12),_transparent_40%)]">
                  <Badge
                    variant="secondary"
                    className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]"
                  >
                    {copy.badge}
                  </Badge>
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${copy.tone}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-3xl font-semibold tracking-tight">
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
                    <Card className="border-dashed bg-white/80 dark:bg-slate-950/50">
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
                        <code className="break-all rounded-xl bg-slate-950 px-3 py-2 text-xs text-white dark:bg-slate-100 dark:text-slate-950">
                          {checkoutSessionId}
                        </code>
                      </CardContent>
                    </Card>
                  ) : null}

                  {stripePending ? (
                    <Alert className="border-sky-200 bg-sky-50/80 dark:border-sky-900/80 dark:bg-sky-950/30">
                      <CreditCard className="h-4 w-4" />
                      <AlertTitle>Sincronização pendente</AlertTitle>
                      <AlertDescription>
                        O checkout retornou, mas a assinatura local ainda não
                        aparece com origem Stripe. Isso normalmente indica que o
                        webhook ainda está em trânsito ou aguardando
                        processamento.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {mode === 'cancel' ? (
                    <div className="rounded-3xl border bg-white/80 p-5 backdrop-blur dark:bg-slate-950/50">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">
                          Retomar assinatura
                        </p>
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
                    <Button
                      className="rounded-full"
                      onClick={handleRefreshStatus}
                      disabled={refreshing}
                    >
                      {refreshing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCw className="mr-2 h-4 w-4" />
                      )}
                      Atualizar assinatura
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => router.push('/profile')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
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
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
