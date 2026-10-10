'use client';

import { SiteExperienceBuilder } from '@/components/admin/SiteExperienceBuilder';
import { AppShell } from '@/components/layout/AppShell';
import { AccessDenied } from '@/components/layout/AccessDenied';
import { PageIntro } from '@/components/layout/PageIntro';
import { SplashScreen } from '@/components/SplashScreen';
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
      <AccessDenied
        description={`Somente perfis administradores podem editar ${surfaceLabels}.`}
      />
    );
  }

  return (
    <AppShell contentClassName="max-w-[1680px]">
      <PageIntro
        eyebrow="Construtor da experiência pública"
        title="Superfícies editáveis em tempo real"
        description="Ajuste conteúdo, ordem das seções, destaques, FAQ, botões, textos, a experiência interna e o JSON completo, e publique a versão final."
      />
      <SiteExperienceBuilder />
    </AppShell>
  );
}
