'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { RealTimeMonitoringContent } from '@/components/monitoring/RealTimeMonitoringContent';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { isPlanFeatureEnabled } from '@/lib/plans/access';
import { scaleRem } from '@/lib/site-page-config/runtime';

export default function MonitoringPage() {
  const { session } = useAuth();
  const { config: appConfig } = usePublicSitePageConfig('app');
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
  const monitoringConfig = appConfig.monitoring;

  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background/80">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mb-8 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {monitoringConfig.pageEyebrow}
            </p>
            <h1
              className="font-display font-bold text-foreground"
              style={{
                fontSize: scaleRem(1.875, appConfig.typography.pageTitle),
              }}
            >
              {monitoringConfig.pageTitle}
            </h1>
            <p
              className="max-w-3xl leading-7 text-muted-foreground"
              style={{
                fontSize: scaleRem(0.95, appConfig.typography.pageBody),
              }}
            >
              {monitoringConfig.pageDescription}
            </p>
          </div>
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
