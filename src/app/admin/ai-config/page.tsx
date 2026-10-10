'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AccessDenied } from '@/components/layout/AccessDenied';
import { PageIntro } from '@/components/layout/PageIntro';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { AIConfigForm } from '@/components/admin/AIConfigForm';
import { AIKnowledgeManager } from '@/components/admin/AIKnowledgeManager';
import { useIsAdmin } from '@/hooks/use-is-admin';

export default function AIConfigPage() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin();

  // SplashScreen enquanto a sessão carrega.
  if (session === undefined) {
    return <SplashScreen />;
  }

  // O AuthContext redireciona quando não há sessão.
  if (!session) {
    return null;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <AppShell puckDocumentKey="admin-ai-config">
      <PageIntro
        title="Modelos de IA"
        description="Gerencie a configuração central, comportamento e pesos do motor de IA da Lyra."
      />
      <AIConfigForm />
      <AIKnowledgeManager />
    </AppShell>
  );
}
