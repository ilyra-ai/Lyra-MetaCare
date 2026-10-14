'use client';

import { MeuDia } from '@/components/coach/MeuDia';
import { AppShell } from '@/components/layout/AppShell';
import { SplashScreen } from '@/components/SplashScreen';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { useAuth } from '@/context/AuthContext';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';

export default function MeuDiaPage() {
  const { session } = useAuth();
  const {
    subscription,
    enabled: coachEnabled,
    loading: subscriptionLoading,
  } = usePlanFeatureAccess('ai_tips_feed');

  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  // O AuthContext redireciona quando não há sessão.
  if (!session) {
    return null;
  }

  return (
    <AppShell>
      {coachEnabled ? (
        <MeuDia />
      ) : (
        <PlanUpgradeNotice
          currentPlanKey={subscription?.plan.key ?? 'free'}
          title="Coach diário indisponível"
          description="O seu plano atual não inclui o feed de dicas de IA, que alimenta o coach diário."
          showAction
        />
      )}
    </AppShell>
  );
}
