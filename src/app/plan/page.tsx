'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { AIPlanContent } from '@/components/ai-plan/AIPlanContent';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { HealthOrchestratorProvider } from '@/context/HealthOrchestratorContext';

export default function AIPlanPage() {
  const { session } = useAuth();
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
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-8">Seu Plano de IA</h1>
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
