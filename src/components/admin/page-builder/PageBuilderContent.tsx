'use client';

import { AlertTriangle, Sparkles } from 'lucide-react';

import { SiteExperienceBuilder } from '@/components/admin/SiteExperienceBuilder';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { SplashScreen } from '@/components/SplashScreen';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { lyraCustomazeEditableSurfaces } from '@/lib/site-page-config/registry';

export function PageBuilderContent() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin();
  const surfaceLabels = lyraCustomazeEditableSurfaces
    .map((surface) => surface.label.toLowerCase())
    .join(', ');

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
              Somente perfis administradores podem editar {surfaceLabels}.
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
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6">
            <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(249,248,252,0.84),rgba(255,255,255,0.96))]">
              <CardHeader className="gap-4">
                <Badge className="w-fit rounded-full border-cosmic/20 bg-cosmic/10 px-4 py-1.5 text-cosmic">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  construtor premium da experiência pública
                </Badge>
                <div className="max-w-4xl space-y-3">
                  <CardTitle className="text-3xl">
                    Superfícies editáveis em tempo real
                  </CardTitle>
                  <CardDescription className="text-sm leading-7">
                    Esta rota administrativa concentra o editor avançado da
                    experiência web da Lyra. Aqui o administrador consegue
                    ajustar conteúdo, ordem das seções, destaques, FAQ, botões,
                    textos, experiência interna, JSON completo e publicar a
                    versão final sem depender de mock, placeholder ou atalho
                    visual.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <SiteExperienceBuilder />
          </div>
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
