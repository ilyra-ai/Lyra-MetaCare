'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AccessDenied } from '@/components/layout/AccessDenied';
import { PageIntro } from '@/components/layout/PageIntro';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { AdminFiscalRecordsContent } from '@/components/admin/AdminFiscalRecordsContent';

export default function AdminFiscalPage() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin();

  if (session === undefined) {
    return <SplashScreen />;
  }

  if (!session || !isAdmin) {
    return <AccessDenied />;
  }

  return (
    <AppShell>
      <PageIntro
        title="Registros fiscais"
        description="Faturas pagas guardadas por obrigação legal. Somente leitura e acesso exclusivo do administrador."
      />
      <AdminFiscalRecordsContent />
    </AppShell>
  );
}
