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
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';

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
      <div className="page-shell flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-destructive/40">
          <CardHeader>
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
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
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Background Decorativo Premium 2026 */}
      <div className="pointer-events-none absolute left-0 top-0 z-0 h-[50vh] w-full bg-gradient-to-b from-primary/10 to-transparent"></div>
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] z-0 h-[600px] w-[600px] rounded-full bg-primary/15 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] z-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl"></div>

      {/* A Sidebar no Lyra geralmente não recebe props, vamos assegurar que ela tenha z-index por css global se necessário, mas removemos a prop que não existe */}
      <Sidebar />
      <div className="flex flex-col flex-1 z-10 relative">
        <Header />
        <PuckClientRenderer
          documentKey="admin-ai-config"
          className="w-full flex-shrink-0"
        />
        <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full">
          <div className="mb-10 text-center sm:text-left">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
              Modelos de IA
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Gerencie a configuração central, comportamento e pesos do motor de
              IA da Lyra.
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
