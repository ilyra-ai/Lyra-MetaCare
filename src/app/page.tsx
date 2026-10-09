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
        <div className="flex flex-col gap-8">
          <section className="surface-panel relative overflow-hidden px-6 py-7 md:px-8 md:py-8">
            <div className="orchestrated-orb -left-16 top-0 h-36 w-36 bg-primary" />
            <div className="orchestrated-orb bottom-0 right-0 h-32 w-32 bg-cosmic" />

            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <span
                  className="eyebrow"
                  style={{
                    fontSize: scaleRem(0.72, appConfig.typography.cardBody),
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {dashboardConfig.heroEyebrow}
                </span>
                <h1
                  className="mt-4 font-display font-bold tracking-tight text-foreground"
                  style={{
                    fontSize: scaleRem(2.65, appConfig.typography.pageTitle),
                    lineHeight: 1.05,
                  }}
                >
                  {greeting},{' '}
                  <span className="text-gradient-hero">{firstName}</span>
                </h1>
                <p
                  className="mt-3 max-w-2xl text-muted-foreground"
                  style={{
                    fontSize: scaleRem(0.98, appConfig.typography.pageBody),
                    lineHeight: 1.7,
                  }}
                >
                  {dashboardConfig.heroDescription}
                </p>
              </div>

              <HarmoniaAtualCard appConfig={appConfig} />
            </div>
          </section>

          <Dashboard />
          <QuickScanFAB />
        </div>
      </HealthOrchestratorProvider>
    </AppShell>
  );
}
