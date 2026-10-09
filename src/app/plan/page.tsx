'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { AIPlanContent } from '@/components/ai-plan/AIPlanContent';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scaleRem } from '@/lib/site-page-config/runtime';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { HealthOrchestratorProvider } from '@/context/HealthOrchestratorContext';

export default function AIPlanPage() {
  const { session } = useAuth();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const {
    subscription,
    enabled: planEnabled,
    loading: subscriptionLoading,
  } = usePlanFeatureAccess('ai_plan_generations');

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
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          id="conteudo-principal"
          className="flex-1 space-y-8 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8"
        >
          <section className="flex flex-col gap-3">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
              style={{
                fontSize: scaleRem(0.68, appConfig.typography.navLabel),
              }}
            >
              {appConfig.aiPlan.pageEyebrow}
            </p>
            <div className="space-y-2">
              <h2
                className="font-display font-semibold tracking-tight text-foreground md:text-4xl"
                style={{
                  fontSize: scaleRem(2, appConfig.typography.pageTitle),
                }}
              >
                {appConfig.aiPlan.pageTitle}
              </h2>
              <p
                className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base"
                style={{
                  fontSize: scaleRem(0.98, appConfig.typography.pageBody),
                }}
              >
                {appConfig.aiPlan.pageDescription}
              </p>
            </div>
          </section>
          {planEnabled ? (
            <HealthOrchestratorProvider>
              <AIPlanContent />
            </HealthOrchestratorProvider>
          ) : (
            <PlanUpgradeNotice
              currentPlanKey={subscription?.plan.key ?? 'free'}
              title="Plano de IA indisponível"
              description="A geração e a reorquestração do plano de IA não estão liberadas para a sua assinatura atual. Essa restrição é aplicada no backend e refletida nesta tela."
            />
          )}
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
