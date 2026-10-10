'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles } from 'lucide-react';
import { SplashScreen } from '@/components/SplashScreen';
import { QuickScanFAB } from '@/components/dashboard/QuickScanFAB';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { HealthOrchestratorProvider } from '@/context/HealthOrchestratorContext';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scaleRem } from '@/lib/site-page-config/runtime';

// A rota "/" serve a landing (visitante) e o dashboard (sessão ativa). Cada
// um é carregado só quando é exibido: o visitante não baixa o dashboard e os
// gráficos (Recharts), e quem está logado não baixa a landing.
const LandingPage = dynamic(
  () =>
    import('@/components/landing/LandingPage').then(
      (modulo) => modulo.LandingPage
    ),
  { loading: () => <SplashScreen /> }
);
const Dashboard = dynamic(() =>
  import('@/components/dashboard/dashboard').then((modulo) => modulo.Dashboard)
);
const HarmoniaAtualCard = dynamic(() =>
  import('@/components/dashboard/HarmoniaAtualCard').then(
    (modulo) => modulo.HarmoniaAtualCard
  )
);

type UserProfile = {
  first_name: string | null;
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Home() {
  const { session, db } = useAuth();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);
  // Perfil carregado junto com o id do usuário a que pertence: o estado de
  // carregamento é derivado (perfil ausente ou de outro usuário), sem setState
  // síncrono dentro do efeito.
  const [loadedProfile, setLoadedProfile] = useState<{
    userId: string;
    profile: UserProfile;
  } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMinimumTimeElapsed(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    const userId = session.user.id;
    let active = true;

    const loadProfile = async () => {
      const { data, error } = await db
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar perfil na home:', error);
      }

      if (active) {
        setLoadedProfile({
          userId,
          profile: { first_name: data?.first_name ?? null },
        });
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [db, session]);

  const currentUserId = session?.user?.id ?? null;
  const profile =
    currentUserId && loadedProfile?.userId === currentUserId
      ? loadedProfile.profile
      : null;
  const profileLoading =
    currentUserId !== null && loadedProfile?.userId !== currentUserId;

  const greeting = useMemo(() => getGreeting(), []);

  // O AuthProvider só renderiza a página depois de resolver a sessão, então
  // aqui ela é a sessão ativa ou `null` (visitante).
  if (!session) {
    return <LandingPage />;
  }

  if (profileLoading || !minimumTimeElapsed) {
    return <SplashScreen />;
  }

  const firstName = profile?.first_name?.trim() || 'Paciente';
  const dashboardConfig = appConfig.dashboard;

  return (
    <AppShell>
      <HealthOrchestratorProvider>
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p
                className="flex items-center gap-1.5 text-muted-foreground"
                style={{
                  fontSize: scaleRem(0.875, appConfig.typography.cardBody),
                }}
              >
                <Sparkles
                  className="h-3.5 w-3.5 text-cosmic"
                  aria-hidden="true"
                />
                {dashboardConfig.heroEyebrow}
              </p>
              <h2
                className="mt-1 font-display font-semibold tracking-[-0.02em] text-foreground"
                style={{
                  fontSize: scaleRem(2, appConfig.typography.pageTitle),
                  lineHeight: 1.15,
                }}
              >
                {greeting}, {firstName}
              </h2>
              <p
                className="mt-2 max-w-2xl text-muted-foreground"
                style={{
                  fontSize: scaleRem(0.9375, appConfig.typography.pageBody),
                  lineHeight: 1.6,
                }}
              >
                {dashboardConfig.heroDescription}
              </p>
            </div>

            <HarmoniaAtualCard appConfig={appConfig} />
          </section>

          <Dashboard />
          <QuickScanFAB />
        </div>
      </HealthOrchestratorProvider>
    </AppShell>
  );
}
