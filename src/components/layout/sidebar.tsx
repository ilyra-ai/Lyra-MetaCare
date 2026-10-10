'use client';

import Link from 'next/link';
import React from 'react';
import { Settings2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scalePx, scaleRem } from '@/lib/site-page-config/runtime';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarLink } from './SidebarLink';
import { getVisibleNavigation, groupNavigation } from './navigation';

type ProfileState = {
  first_name: string | null;
  avatar_url: string | null;
};

/*
  Sidebar "Lyra Clean": branca, borda direita de 1px, marca compacta,
  seções com rótulo discreto e o usuário com o plano no rodapé. A largura
  continua configurável pelo construtor de UI (`sizing.sidebarWidth`).
*/
export function Sidebar() {
  const { session, db } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: subscription } = useAccountSubscription();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const [profile, setProfile] = React.useState<ProfileState | null>(null);

  React.useEffect(() => {
    if (!session?.user) return;

    const loadProfile = async () => {
      const { data, error } = await db
        .from('profiles')
        .select('first_name, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar perfil da sidebar:', error);
        return;
      }

      setProfile({
        first_name: data?.first_name ?? null,
        avatar_url: data?.avatar_url ?? null,
      });
    };

    void loadProfile();
  }, [db, session]);

  const userEmail = session?.user?.email ?? '';
  const firstName =
    profile?.first_name?.trim() || userEmail.split('@')[0] || 'Paciente';
  const initial = firstName.charAt(0).toUpperCase();
  const sections = groupNavigation(getVisibleNavigation(isAdmin, appConfig));
  const navLabelScale = appConfig.typography.navLabel;
  const iconScale = appConfig.sizing.iconScale;

  return (
    <aside
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex"
      style={{
        width: `${appConfig.sizing.sidebarWidth}px`,
        maxWidth: '34vw',
      }}
    >
      <div className="flex h-full flex-col gap-5 px-3.5 py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-1"
        >
          <span
            aria-hidden="true"
            className="flex shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-foreground"
            style={{
              height: scalePx(32, iconScale),
              width: scalePx(32, iconScale),
            }}
          >
            <Sparkles
              strokeWidth={2}
              style={{
                height: scalePx(16, iconScale),
                width: scalePx(16, iconScale),
              }}
            />
          </span>
          <span className="min-w-0">
            <span
              className="block font-display font-semibold lowercase leading-tight text-foreground"
              style={{ fontSize: scaleRem(1.125, navLabelScale) }}
            >
              {appConfig.sidebar.brandTitle}
            </span>
            <span
              className="block truncate text-muted-foreground"
              style={{ fontSize: scaleRem(0.75, navLabelScale) }}
            >
              {appConfig.sidebar.brandEyebrow}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto"
        >
          {Object.entries(sections).map(([section, items]) => (
            <section key={section} className="flex flex-col gap-0.5">
              <p className="px-2.5 pb-1.5 text-xs font-medium text-muted-foreground">
                {section}
              </p>
              {items.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  iconScale={iconScale}
                  labelScale={navLabelScale}
                >
                  {item.label}
                </SidebarLink>
              ))}
            </section>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 border-t border-sidebar-border px-2.5 pt-3.5">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={profile?.avatar_url || undefined}
              alt={`Avatar de ${firstName}`}
            />
            <AvatarFallback aria-hidden="true">{initial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {firstName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {subscription ? `Plano ${subscription.plan.name}` : userEmail}
            </p>
          </div>
          <Link
            href="/profile"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={appConfig.sidebar.preferencesTitle}
            title={appConfig.sidebar.preferencesDescription}
          >
            <Settings2 className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
