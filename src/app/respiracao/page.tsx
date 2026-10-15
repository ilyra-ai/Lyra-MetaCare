'use client';

import { Suspense } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { RespiracaoGuiada } from '@/components/respiracao/RespiracaoGuiada';
import { SplashScreen } from '@/components/SplashScreen';
import { useAuth } from '@/context/AuthContext';

export default function RespiracaoPage() {
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
      {/* `?tecnica=` e `?minutos=` (vindos do "Meu dia") são lidos no cliente. */}
      <Suspense fallback={null}>
        <RespiracaoGuiada />
      </Suspense>
    </AppShell>
  );
}
