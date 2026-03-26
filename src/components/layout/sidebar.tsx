'use client';

import Link from 'next/link';
import React from 'react';
import { Settings2, Sparkles, Workflow } from 'lucide-react';
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
      className="glass sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border md:flex"
      style={{ width: `${appConfig.sizing.sidebarWidth}px` }}
    >
      <div className="flex h-full flex-col px-4 py-5">
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[26px] border border-white/80 bg-white/70 px-4 py-4 shadow-sm">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div
              className="flex items-center justify-center rounded-2xl bg-gradient-teal text-white shadow-teal"
              style={{
                height: scalePx(48, iconScale),
                width: scalePx(48, iconScale),
              }}
            >
              <Sparkles
                className="h-5 w-5"
                strokeWidth={1.9}
                style={{
                  height: scalePx(20, iconScale),
                  width: scalePx(20, iconScale),
                }}
              />
            </div>
            <div className="min-w-0">
              <p
                className="font-display font-bold lowercase tracking-tight text-gradient-hero"
                style={{ fontSize: scaleRem(1.25, navLabelScale) }}
              >
                {appConfig.sidebar.brandTitle}
              </p>
              <p
                className="truncate uppercase tracking-[0.24em] text-muted-foreground"
                style={{ fontSize: scaleRem(0.75, navLabelScale) }}
              >
                {appConfig.sidebar.brandEyebrow}
              </p>
            </div>
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic-light text-cosmic">
            <Workflow
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
              style={{
                height: scalePx(18, iconScale),
                width: scalePx(18, iconScale),
              }}
            />
          </div>
        </div>

        <div className="mb-5 rounded-[26px] border border-white/75 bg-white/70 px-4 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              <AvatarImage
                src={profile?.avatar_url || undefined}
                alt={`Avatar de ${firstName}`}
              />
              <AvatarFallback className="bg-gradient-coral font-semibold text-white">
                {initial}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {firstName}
                </p>
                <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {userEmail || 'Conta autenticada'}
              </p>
              {subscription ? (
                <div className="mt-3">
                  <PlanBadge planKey={subscription.plan.key} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 rounded-[20px] bg-gradient-aurora px-4 py-3">
            <p
              className="font-semibold uppercase tracking-[0.24em] text-muted-foreground"
              style={{ fontSize: scaleRem(0.6875, navLabelScale) }}
            >
              {appConfig.sidebar.statusEyebrow}
            </p>
            <p
              className="mt-1 font-medium text-foreground"
              style={{ fontSize: scaleRem(0.875, navLabelScale) }}
            >
              {appConfig.sidebar.statusTitle}
            </p>
          </div>
        </div>

        <nav
          aria-label="Navegação principal"
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1"
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

        <div className="mt-5 rounded-[26px] border border-white/75 bg-white/70 p-3 shadow-sm">
          <Link
            href="/profile"
            className="interactive-lift flex items-center gap-3 rounded-[20px] px-3 py-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground">
              <Settings2
                className="h-[18px] w-[18px]"
                strokeWidth={1.8}
                style={{
                  height: scalePx(18, iconScale),
                  width: scalePx(18, iconScale),
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="font-semibold text-foreground"
                style={{ fontSize: scaleRem(0.875, navLabelScale) }}
              >
                {appConfig.sidebar.preferencesTitle}
              </p>
              <p
                className="truncate text-muted-foreground"
                style={{ fontSize: scaleRem(0.75, navLabelScale) }}
              >
                {appConfig.sidebar.preferencesDescription}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
