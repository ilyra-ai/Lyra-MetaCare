'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { ChatAssistantContent } from '@/components/chat/ChatAssistantContent';
import { usePlanFeatureAccess } from '@/hooks/use-plan-feature-access';
import { PlanUpgradeNotice } from '@/components/subscription/PlanUpgradeNotice';

export default function ChatPage() {
  const { session } = useAuth();
  const {
    subscription,
    enabled: chatEnabled,
    loading: subscriptionLoading,
  } = usePlanFeatureAccess('ai_chat_messages');

  if (session === undefined || subscriptionLoading) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <AppShell puckDocumentKey="chat" contentClassName="py-4 md:py-6">
      {chatEnabled ? (
        <ChatAssistantContent />
      ) : (
        <PlanUpgradeNotice
          currentPlanKey={subscription?.plan.key ?? 'free'}
          title="Assistente IA indisponível"
          description="Seu plano atual não possui mensagens com o assistente de IA liberadas. O consumo e o bloqueio são controlados pela matriz de entitlements."
        />
      )}
    </AppShell>
  );
}
