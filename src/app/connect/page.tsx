'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { WearableConnection } from '@/components/data-connection/WearableConnection';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';

export default function DataConnectionPage() {
  const { session } = useAuth();
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
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
            Conectar Dados de Saúde
          </h1>
          {wearableEnabled ? (
            <WearableConnection />
          ) : (
            <PlanUpgradeNotice
              currentPlanKey={subscription?.plan.key ?? 'free'}
              title="Conexão Bluetooth indisponível"
              description="Seu plano atual não inclui a camada de conexão com wearables via Bluetooth. O entitlement é aplicado de forma real na matriz de capacidades."
            />
          )}
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
