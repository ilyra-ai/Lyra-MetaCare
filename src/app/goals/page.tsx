'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
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

  // Use SplashScreen while session is loading
  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  // AuthContext handles redirect if not logged in
  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-8">Suas Metas</h1>
          {goalsEnabled ? (
            <GoalTrackingContent />
          ) : (
            <PlanUpgradeNotice
              currentPlanKey={subscription?.plan.key ?? 'free'}
              title="Acompanhamento de metas indisponível"
              description="Seu plano atual não libera a gestão e o acompanhamento detalhado de metas. A restrição está aplicada de forma real na camada de capacidades."
            />
          )}
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
