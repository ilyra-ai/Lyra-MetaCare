'use client';

import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { AdminContentManagement } from '@/components/admin/AdminContentManagement';
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';

export default function AdminContentPage() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin();

  if (session === undefined) {
    return <SplashScreen />;
  }

  if (!session || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background/80 p-4">
        <Card className="w-full max-w-md border-destructive/20 text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto mb-2 h-10 w-10 text-destructive" />
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background/80">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <PuckClientRenderer
          documentKey="admin-content"
          className="w-full shrink-0"
        />
        <main id="conteudo-principal" className="flex-1 p-4 sm:p-6 md:p-8">
          <AdminContentManagement />
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
