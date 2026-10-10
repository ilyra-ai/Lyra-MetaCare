'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PageIntro } from '@/components/layout/PageIntro';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { AIPlanContent } from '@/components/ai-plan/AIPlanContent';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
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

  // SplashScreen enquanto a sessão e a assinatura carregam.
  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  // O AuthContext redireciona quando não há sessão.
  if (!session) {
    return null;
  }

  return (
    <AppShell>
      <PageIntro
        eyebrow={appConfig.aiPlan.pageEyebrow}
        title={appConfig.aiPlan.pageTitle}
        description={appConfig.aiPlan.pageDescription}
      />
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
    </AppShell>
  );
}
