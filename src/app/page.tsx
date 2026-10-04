'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Waves } from 'lucide-react';
import { SplashScreen } from '@/components/SplashScreen';
import { Dashboard } from '@/components/dashboard/dashboard';
import { QuickScanFAB } from '@/components/dashboard/QuickScanFAB';
import { LandingPage } from '@/components/landing/LandingPage';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { HealthOrchestratorProvider } from '@/context/HealthOrchestratorContext';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scaleRem } from '@/lib/site-page-config/runtime';

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

  if (!session) {
    return <LandingPage />;
  }

  if (session === undefined || profileLoading || !minimumTimeElapsed) {
    return <SplashScreen />;
  }

  const firstName = profile?.first_name?.trim() || 'Paciente';
  const dashboardConfig = appConfig.dashboard;

  return (
    <AppShell>
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

            <div
              className="glass-card flex max-w-sm items-center gap-4 rounded-[24px] px-5 py-4"
              style={{
                transform: `scale(${appConfig.sizing.cardScale})`,
                transformOrigin: 'top right',
              }}
            >
              <div
                className="flex items-center justify-center rounded-full bg-gradient-cosmic text-white shadow-cosmic"
                style={{
                  width: scaleRem(3, appConfig.sizing.iconScale),
                  height: scaleRem(3, appConfig.sizing.iconScale),
                }}
              >
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <p
                  className="font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                  style={{
                    fontSize: scaleRem(0.72, appConfig.typography.cardBody),
                  }}
                >
                  {dashboardConfig.harmonyEyebrow}
                </p>
                <p className="metric-display text-gradient-aurora">94.2</p>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: scaleRem(0.76, appConfig.typography.cardBody),
                  }}
                >
                  {dashboardConfig.harmonyNote}
                </p>
              </div>
            </div>
          </div>
        </section>

        <HealthOrchestratorProvider>
          <Dashboard />
          <QuickScanFAB />
        </HealthOrchestratorProvider>
      </div>
    </AppShell>
  );
}
