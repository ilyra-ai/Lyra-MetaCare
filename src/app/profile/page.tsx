'use client';

import { SplashScreen } from '@/components/SplashScreen';
import { AppShell } from '@/components/layout/AppShell';
import { PageIntro } from '@/components/layout/PageIntro';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AccountSubscriptionCard } from '@/components/subscription/AccountSubscriptionCard';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';
import { useAuth } from '@/context/AuthContext';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';

export default function ProfilePage() {
  const { session } = useAuth();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const {
    subscription,
    enabled: profileEnabled,
    loading: subscriptionLoading,
  } = usePlanFeatureAccess('profile_management');
  const profileConfig = appConfig.profile;

  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <AppShell puckDocumentKey="profile">
      <PageIntro
        eyebrow={profileConfig.pageEyebrow}
        title={profileConfig.pageTitle}
        description={profileConfig.pageDescription}
      />
      {profileEnabled ? (
        <ProfileForm />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
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
    </AppShell>
  );
}
