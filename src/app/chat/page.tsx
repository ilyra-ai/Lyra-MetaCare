'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
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
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4 animate-in fade-in duration-500">
          {/* Container que centraliza e define a largura máxima do chat */}
          <div className="h-full w-full max-w-6xl">
            {chatEnabled ? (
              <ChatAssistantContent />
            ) : (
              <PlanUpgradeNotice
                currentPlanKey={subscription?.plan.key ?? 'free'}
                title="Assistente IA indisponível"
                description="Seu plano atual não possui mensagens com o assistente de IA liberadas. O consumo e o bloqueio são controlados pela matriz de entitlements."
              />
            )}
          </div>
        </main>
        <div className="border-t border-gray-100 dark:border-gray-800">
          <MadeWithIlyra />
        </div>
      </div>
    </div>
  );
}
