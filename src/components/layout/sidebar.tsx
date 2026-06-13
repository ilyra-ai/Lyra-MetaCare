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
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { SidebarLink } from './SidebarLink';
import { getVisibleNavigation, groupNavigation } from './navigation';

type ProfileState = {
  first_name: string | null;
  avatar_url: string | null;
};

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
      className="glass sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border lg:flex"
      style={{
        width: `${appConfig.sizing.sidebarWidth}px`,
        maxWidth: '34vw',
      }}
    >
      <div className="flex h-full flex-col px-4 py-5">
        <div className="relative mb-8 flex flex-col items-center justify-center gap-3 py-6">
          <Link
            href="/"
            className="group interactive-lift flex flex-col items-center gap-2"
          >
            <div className="flex size-14 items-center justify-center rounded-[24px] bg-gradient-teal text-white shadow-teal ring-4 ring-white/50 backdrop-blur-md transition-all group-hover:scale-105 group-hover:shadow-cosmic">
              <Sparkles
                className="animate-float"
                strokeWidth={2}
                style={{
                  height: scalePx(24, iconScale),
                  width: scalePx(24, iconScale),
                }}
              />
            </div>
            <div className="text-center">
              <p
                className="font-display font-bold tracking-tight text-foreground"
                style={{ fontSize: scaleRem(1.25, navLabelScale) }}
              >
                {appConfig.sidebar.brandTitle}
              </p>
              <p
                className="font-semibold uppercase tracking-[0.2em] text-primary/80"
                style={{ fontSize: scaleRem(0.625, navLabelScale) }}
              >
                {appConfig.sidebar.brandEyebrow}
              </p>
            </div>
          </Link>
          <div className="soft-divider absolute -bottom-4 opacity-60" />
        </div>

        <nav
          aria-label="Navegação principal"
          className="mt-4 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2"
        >
          {Object.entries(sections).map(([section, items]) => (
            <section key={section} className="space-y-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                {section}
              </p>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    description={item.description}
                    iconScale={iconScale}
                    labelScale={navLabelScale}
                  >
                    {item.label}
                  </SidebarLink>
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="relative mt-auto border-t border-sidebar-border/70 pt-6">
          {subscription ? (
            <div className="mb-3 flex justify-center">
              <PlanBadge planKey={subscription.plan.key} />
            </div>
          ) : null}
          <Link
            href="/profile"
            className="interactive-lift group flex w-full items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-sidebar-accent/70"
          >
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
              <AvatarImage
                src={profile?.avatar_url || undefined}
                alt={`Avatar de ${firstName}`}
              />
              <AvatarFallback className="bg-gradient-teal font-medium text-white">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {firstName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>
            <Settings2 className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
