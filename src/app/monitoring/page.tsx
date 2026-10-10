'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PageIntro } from '@/components/layout/PageIntro';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { RealTimeMonitoringContent } from '@/components/monitoring/RealTimeMonitoringContent';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { isPlanFeatureEnabled } from '@/lib/plans/access';

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
    <AppShell puckDocumentKey="monitoring">
      <PageIntro
        eyebrow={monitoringConfig.pageEyebrow}
        title={monitoringConfig.pageTitle}
        description={monitoringConfig.pageDescription}
      />
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
    </AppShell>
  );
}
