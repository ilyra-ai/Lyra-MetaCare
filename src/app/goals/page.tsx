'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { GoalTrackingContent } from '@/components/goals/GoalTrackingContent';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';

export default function GoalTrackingPage() {
  const { session } = useAuth();
  const {
    subscription,
    enabled: goalsEnabled,
    loading: subscriptionLoading,
  } = usePlanFeatureAccess('goal_progress_tracking');

  // Use SplashScreen while session is loading
  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  // AuthContext handles redirect if not logged in
  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-surface text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <PuckClientRenderer
          documentKey="goals"
          className="w-full flex-shrink-0"
        />
        <main
          id="conteudo-principal"
          className="flex-1 space-y-8 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8"
        >
          <section className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Ritmo e consistência
            </p>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Suas metas
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                Evolução diária com progresso real, acompanhamento visual claro
                e atualização individual de cada objetivo.
              </p>
            </div>
          </section>
          {goalsEnabled ? (
            <GoalTrackingContent />
          ) : (
            <PlanUpgradeNotice
              currentPlanKey={subscription?.plan.key ?? 'free'}
              title="Acompanhamento de metas indisponível"
              description="Seu plano atual não libera a gestão e o acompanhamento detalhado de metas. A restrição está aplicada de forma real na camada de capacidades."
              showAction
            />
          )}
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
