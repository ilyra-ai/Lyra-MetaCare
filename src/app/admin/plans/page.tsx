'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AccessDenied } from '@/components/layout/AccessDenied';
import { SplashScreen } from '@/components/SplashScreen';
import { useAuth } from '@/context/AuthContext';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { AdminPlanMatrixContent } from '@/components/admin/AdminPlanMatrixContent';

export default function AdminPlansPage() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin();

  if (session === undefined) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <AppShell puckDocumentKey="admin-plans">
      <AdminPlanMatrixContent />
    </AppShell>
  );
}
