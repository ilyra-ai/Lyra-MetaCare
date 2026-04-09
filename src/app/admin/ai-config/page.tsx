'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { AIConfigForm } from '@/components/admin/AIConfigForm';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function AIConfigPage() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin();

  // Use SplashScreen while session is loading
  if (session === undefined) {
    return <SplashScreen />;
  }

  // AuthContext handles redirect if not logged in
  if (!session) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
        <Card className="w-full max-w-md text-center border-red-500/50">
          <CardHeader>
            <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página de administração.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] relative overflow-hidden">
      {/* Background Decorativo Premium 2026 */}
      <div className="pointer-events-none absolute left-0 top-0 h-[50vh] w-full bg-gradient-to-b from-teal-50/50 to-transparent z-0"></div>
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-teal-100/30 blur-3xl z-0"></div>
      <div className="pointer-events-none absolute left-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-orange-100/20 blur-3xl z-0"></div>

      {/* A Sidebar no Lyra geralmente não recebe props, vamos assegurar que ela tenha z-index por css global se necessário, mas removemos a prop que não existe */}
      <Sidebar />
      <div className="flex flex-col flex-1 z-10 relative">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full">
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              Modelos de IA
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Gerencie a configuração central, comportamento e pesos do motor de IA da Lyra.
            </p>
          </div>
          <div className="w-full relative">
            <AIConfigForm />
          </div>
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
