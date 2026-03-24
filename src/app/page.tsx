'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Waves } from 'lucide-react';
import { SplashScreen } from '@/components/SplashScreen';
import { Dashboard } from '@/components/dashboard/dashboard';
import { QuickScanFAB } from '@/components/dashboard/QuickScanFAB';
import { LandingPage } from '@/components/landing/LandingPage';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';

type UserProfile = {
  first_name: string | null;
};

function getGreeting(): string {
  const hour = new Date().getHours();
function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Home() {
  const { session, db } = useAuth();
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMinimumTimeElapsed(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    const loadProfile = async () => {
      setProfileLoading(true);

      const { data, error } = await db
        .from('profiles')
        .select('first_name')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar perfil na home:', error);
      }

      setProfile({ first_name: data?.first_name ?? null });
      setProfileLoading(false);
    };

    void loadProfile();
  }, [db, session]);

  const greeting = useMemo(() => getGreeting(), []);

  if (!session) {
    return <LandingPage />;
  }

  if (session === undefined || profileLoading || !minimumTimeElapsed) {
    return <SplashScreen />;
  }

  const firstName = profile?.first_name || 'Usuário';
  const greeting = getGreeting();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 z-10">
        <Header />
        <main id="main-content" className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              {greeting},{' '}
              <span className="text-gradient-hero">{firstName}</span>!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Aqui está o resumo do seu bem-estar hoje.
            </p>
          </div>
          <Dashboard />
        </main>
        <MadeWithIlyra />
  const firstName = profile?.first_name?.trim() || 'Paciente';

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <section className="surface-panel relative overflow-hidden px-6 py-7 md:px-8 md:py-8">
          <div className="orchestrated-orb -left-16 top-0 h-36 w-36 bg-primary" />
          <div className="orchestrated-orb bottom-0 right-0 h-32 w-32 bg-cosmic" />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Santuário digital de bem-estar
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                {greeting},{' '}
                <span className="text-gradient-hero">{firstName}</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Sua leitura do dia reúne biometria, sono, energia, astrologia
                védica e protocolos orientados por IA em uma visão premium,
                clara e acionável.
              </p>
            </div>

            <div className="glass-card flex max-w-sm items-center gap-4 rounded-[24px] px-5 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-cosmic text-white shadow-cosmic">
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Harmonia atual
                </p>
                <p className="metric-display text-gradient-aurora">94.2</p>
                <p className="text-xs text-muted-foreground">
                  Janela de recuperação alta nas últimas 24 horas
                </p>
              </div>
            </div>
          </div>
        </section>

        <Dashboard />
        <QuickScanFAB />
      </div>
    </AppShell>
  );
}
