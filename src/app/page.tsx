'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { SplashScreen } from '@/components/SplashScreen';
import { Dashboard } from '@/components/dashboard/dashboard';
import { QuickScanFAB } from '@/components/dashboard/QuickScanFAB';
import { LandingPage } from '@/components/landing/LandingPage';

type UserProfile = {
  first_name: string | null;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Home() {
  const { session, db } = useAuth();
  const [isMinimumTimeElapsed, setIsMinimumTimeElapsed] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimumTimeElapsed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session?.user) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        const { data: profiles, error } = await db
          .from('profiles')
          .select('first_name')
          .eq('id', session.user.id);

        if (error) {
          console.error('Erro ao carregar perfil para a home:', error);
        } else if (profiles && profiles.length > 0) {
          setProfile(profiles[0]);
        }
        setProfileLoading(false);
      };
      fetchProfile();
    }
  }, [db, session]);

  if (!session) {
    return <LandingPage />;
  }

  const isLoading =
    session === undefined || !isMinimumTimeElapsed || profileLoading;

  if (isLoading) {
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
      </div>
      <QuickScanFAB />
    </div>
  );
}
