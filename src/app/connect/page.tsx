'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PageIntro } from '@/components/layout/PageIntro';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { WearableConnection } from '@/components/data-connection/WearableConnection';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';

export default function DataConnectionPage() {
  const { session } = useAuth();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const {
    subscription,
    enabled: wearableEnabled,
    loading: subscriptionLoading,
  } = usePlanFeatureAccess('wearable_bluetooth_connection');

  // SplashScreen enquanto a sessão e a assinatura carregam.
  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  // O AuthContext redireciona quando não há sessão.
  if (!session) {
    return null;
  }

  return (
    <AppShell puckDocumentKey="connect">
      <PageIntro
        eyebrow={appConfig.connect.pageEyebrow}
        title={appConfig.connect.pageTitle}
        description={appConfig.connect.pageDescription}
      />
      {wearableEnabled ? (
        <WearableConnection
          config={appConfig.connect}
          typography={appConfig.typography}
        />
      ) : (
        <PlanUpgradeNotice
          currentPlanKey={subscription?.plan.key ?? 'free'}
          title="Conexão Bluetooth indisponível"
          description="Seu plano atual não inclui a camada de conexão com wearables via Bluetooth. O entitlement é aplicado de forma real na matriz de capacidades."
          showAction
          preferredPlanKey="meta"
        />
      )}
    </AppShell>
  );
}
