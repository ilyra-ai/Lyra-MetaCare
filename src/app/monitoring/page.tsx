'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { RealTimeMonitoringContent } from '@/components/monitoring/RealTimeMonitoringContent';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { isPlanFeatureEnabled } from '@/lib/plans/access';

export default function MonitoringPage() {
  const { session } = useAuth();
  const { data: subscription, loading: subscriptionLoading } =
    useAccountSubscription();
  const monitoringEnabled = isPlanFeatureEnabled(
    subscription,
    'realtime_monitoring'
  );
  const voiceUpdatesEnabled = isPlanFeatureEnabled(
    subscription,
    'voice_monitoring_updates'
  );

  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-8">
            Monitoramento em Tempo Real
          </h1>
          {monitoringEnabled ? (
            <RealTimeMonitoringContent
              voiceUpdatesEnabled={voiceUpdatesEnabled}
              currentPlanKey={subscription?.plan.key ?? 'free'}
            />
          ) : (
            <PlanUpgradeNotice
              currentPlanKey={subscription?.plan.key ?? 'free'}
              title="Monitoramento premium bloqueado"
              description="Seu plano atual não inclui o painel contínuo de monitoramento em tempo real. A liberação desta experiência depende do entitlement correspondente."
              showAction
              preferredPlanKey="meta"
            />
          )}
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
