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
        <div className="mb-8 flex flex-col items-center justify-center gap-3 py-6 relative">
          <Link href="/" className="flex flex-col items-center gap-2 group interactive-lift">
            <div className="flex size-14 items-center justify-center rounded-[24px] bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-[0_8px_24px_rgba(45,212,191,0.4)] ring-4 ring-white/50 backdrop-blur-md transition-all group-hover:scale-105 group-hover:shadow-[0_12px_32px_rgba(45,212,191,0.5)]">
              <Sparkles className="h-6 w-6 animate-float" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold tracking-tight text-slate-800">
                {appConfig.sidebar.brandTitle}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-600/80">
                {appConfig.sidebar.brandEyebrow}
              </p>
            </div>
          </Link>
          <div className="absolute -bottom-4 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
        </div>

        <nav
          aria-label="Navegação principal"
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2 mt-4 custom-scrollbar"
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

        <div className="mt-auto pt-6 border-t border-slate-200/60 relative">
          <Link href="/profile" className="flex items-center gap-3 interactive-lift group w-full rounded-2xl hover:bg-slate-50/80 p-2 transition-colors">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
              <AvatarImage src={profile?.avatar_url || undefined} alt={`Avatar de ${firstName}`} />
              <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 font-medium">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{firstName}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
            <Settings2 className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
