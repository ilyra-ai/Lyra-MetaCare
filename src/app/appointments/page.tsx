'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { AppointmentsContent } from '@/components/appointments/AppointmentsContent';

export default function AppointmentsPage() {
  const { session } = useAuth();

  if (session === undefined) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <AppShell puckDocumentKey="appointments">
      <AppointmentsContent />
    </AppShell>
  );
}
