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

// Define a type for the user profile for better type safety
type UserProfile = {
  first_name: string | null;
  // Add other profile fields as needed
};

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

  // Para visitantes sem sessão, a landing deve ser a primeira experiência.
  if (!session) {
    return <LandingPage />;
  }

  const isLoading =
    session === undefined || !isMinimumTimeElapsed || profileLoading;

  if (isLoading) {
    return <SplashScreen />;
  }

  const firstName = profile?.first_name || 'Usuário';

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1 z-10">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent animate-pulse-slow">
            Olá, {firstName}!
          </h1>
          <Dashboard />
        </main>
        <MadeWithIlyra />
      </div>
      <QuickScanFAB />
    </div>
  );
}
