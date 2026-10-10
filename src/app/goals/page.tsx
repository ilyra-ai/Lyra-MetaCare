'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PageIntro } from '@/components/layout/PageIntro';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { GoalTrackingContent } from '@/components/goals/GoalTrackingContent';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';

export default function GoalTrackingPage() {
  const { session } = useAuth();
  const {
    subscription,
    enabled: goalsEnabled,
    loading: subscriptionLoading,
  } = usePlanFeatureAccess('goal_progress_tracking');

  // SplashScreen enquanto a sessão e a assinatura carregam.
  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  // O AuthContext redireciona quando não há sessão.
  if (!session) {
    return null;
  }

  return (
    <AppShell puckDocumentKey="goals">
      <PageIntro
        eyebrow="Ritmo e consistência"
        title="Suas metas"
        description="Evolução diária com progresso real, acompanhamento visual claro e atualização individual de cada objetivo."
      />
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
    </AppShell>
  );
}
