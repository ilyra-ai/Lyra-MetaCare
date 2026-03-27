'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { WearableConnection } from '@/components/data-connection/WearableConnection';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scaleRem } from '@/lib/site-page-config/runtime';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';

export default function DataConnectionPage() {
  const { session } = useAuth();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const {
    subscription,
    enabled: wearableEnabled,
    loading: subscriptionLoading,
  } = usePlanFeatureAccess('wearable_bluetooth_connection');

  // Use SplashScreen while session is loading
  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  // AuthContext handles redirect if not logged in
  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--background))_48%,rgba(255,255,255,0.96))] font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <section className="mx-auto flex max-w-6xl flex-col gap-6">
            <div className="space-y-3">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground"
                style={{
                  fontSize: scaleRem(0.68, appConfig.typography.navLabel),
                }}
              >
                {appConfig.connect.pageEyebrow}
              </p>
              <h1
                className="text-center font-bold text-foreground md:text-left"
                style={{
                  fontSize: scaleRem(2, appConfig.typography.pageTitle),
                }}
              >
                {appConfig.connect.pageTitle}
              </h1>
              <p
                className="max-w-4xl text-center leading-7 text-muted-foreground md:text-left"
                style={{
                  fontSize: scaleRem(0.98, appConfig.typography.pageBody),
                }}
              >
                {appConfig.connect.pageDescription}
              </p>
            </div>
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
          </section>
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
