'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
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
    return (
      <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center p-6 md:p-10">
            <div className="max-w-xl rounded-3xl border bg-white/80 p-8 text-center shadow-xl backdrop-blur dark:bg-slate-950/70">
              <h1 className="text-2xl font-semibold tracking-tight">
                Acesso restrito
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Você não tem permissão para acessar a gestão premium de planos.
              </p>
            </div>
          </main>
          <MadeWithIlyra />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <AdminPlanMatrixContent />
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
