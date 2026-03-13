'use client';

import { SplashScreen } from '@/components/SplashScreen';
import { Header } from '@/components/layout/header';
import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AccountSubscriptionCard } from '@/components/subscription/AccountSubscriptionCard';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { useAuth } from '@/context/AuthContext';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';

export default function ProfilePage() {
  const { session } = useAuth();
  const {
    subscription,
    enabled: profileEnabled,
    loading: subscriptionLoading,
  } = usePlanFeatureAccess('profile_management');

  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="mb-8 text-3xl font-bold">Seu Perfil</h1>
          {profileEnabled ? (
            <ProfileForm />
          ) : (
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
              <PlanUpgradeNotice
                currentPlanKey={subscription?.plan.key ?? 'free'}
                title="Gestão de perfil bloqueada"
                description="A edição completa do perfil e dos dados de contexto pessoal está desabilitada para o seu plano atual. A jornada comercial continua disponível nesta tela para que você consiga revisar o plano atual e avançar para um upgrade real sem sair da conta."
                showAction
                preferredPlanKey="meta"
              />
              <AccountSubscriptionCard />
            </div>
          )}
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
