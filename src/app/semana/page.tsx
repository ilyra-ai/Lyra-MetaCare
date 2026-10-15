'use client';

import { AppShell } from '@/components/layout/AppShell';
import { SuaSemana } from '@/components/semana/SuaSemana';
import { SplashScreen } from '@/components/SplashScreen';
import { useAuth } from '@/context/AuthContext';

export default function SemanaPage() {
  const { session } = useAuth();

  if (session === undefined) {
    return <SplashScreen />;
  }

  // O AuthContext redireciona quando não há sessão.
  if (!session) {
    return null;
  }

  return (
    <AppShell>
      <SuaSemana />
    </AppShell>
  );
}
