'use client';

import {
  LayoutGrid,
  Activity,
  Moon,
  Brain,
  Calendar,
  Target,
  Radio,
  Smartphone,
  Wand2,
  User,
  Shield,
  Users,
  Gem,
  HeartPulse,
  ClipboardList,
  BarChart2,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { useAuth } from '@/context/AuthContext';
=======
import Link from 'next/link';
import React from 'react';
import { Settings2, Sparkles, Workflow } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsAdmin } from '@/hooks/use-is-admin';

import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { SidebarLink } from './SidebarLink';

import React from 'react';
import Link from 'next/link';
=======
import { getVisibleNavigation, groupNavigation } from './navigation';

type ProfileState = {
  first_name: string | null;
  avatar_url: string | null;
};


export function Sidebar() {
  const { session, db } = useAuth();
  const isAdmin = useIsAdmin();

  const { session, db } = useAuth();
  const { data: subscription } = useAccountSubscription();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [firstName, setFirstName] = React.useState<string>('');

  React.useEffect(() => {
    if (!session?.user) return;
    const fetchProfile = async () => {
      const { data } = await db
        .from('profiles')
        .select('avatar_url, first_name')
        .eq('id', session.user.id)
        .maybeSingle();
      if (data) {
        setAvatarUrl(data.avatar_url || null);
        setFirstName(data.first_name || '');
      }
    };
    fetchProfile();
  }, [session, db]);

  const userEmail = session?.user?.email || '';
  const initial = (firstName || userEmail).charAt(0).toUpperCase();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border z-20">
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="p-2 bg-gradient-teal rounded-xl shadow-teal">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-display font-bold text-gradient-hero">
          lyra
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Principal */}
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Principal
        </p>
        <SidebarLink href="/" icon={LayoutGrid}>
          Dashboard
        </SidebarLink>
        <SidebarLink href="/plan" icon={Wand2}>
          Plano de IA
        </SidebarLink>
        <SidebarLink href="/goals" icon={Target}>
          Metas
        </SidebarLink>

        {/* Clínica */}
        <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Clínica
        </p>
        <SidebarLink href="/appointments" icon={Calendar}>
          Agendamentos
        </SidebarLink>
        <SidebarLink href="/monitoring" icon={Radio}>
          Monitoramento
        </SidebarLink>
        <SidebarLink href="/chat" icon={Brain}>
          Assistente IA
        </SidebarLink>

        {/* Pessoal */}
        <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Pessoal
        </p>
        <SidebarLink href="/connect" icon={Smartphone}>
          Dispositivos
        </SidebarLink>
        <SidebarLink href="/profile" icon={User}>
          Perfil
        </SidebarLink>

        {/* Admin */}
        {isAdmin && (
          <>
            <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Administração
            </p>
            <SidebarLink href="/admin/dashboard" icon={LayoutGrid}>
              Visão Geral
            </SidebarLink>
            <SidebarLink href="/admin/users" icon={Users}>
              Usuários
            </SidebarLink>
            <SidebarLink href="/admin/plans" icon={Gem}>
              Planos
            </SidebarLink>
            <SidebarLink href="/admin/data-health" icon={HeartPulse}>
              Saúde dos Dados
            </SidebarLink>
            <SidebarLink href="/admin/content" icon={ClipboardList}>
              Conteúdo
            </SidebarLink>
            <SidebarLink href="/admin/ai-config" icon={Shield}>
              Config. IA
            </SidebarLink>
            <SidebarLink href="/admin/reports" icon={BarChart2}>
              Relatórios
            </SidebarLink>
          </>
        )}
      </nav>

      {/* User Mini Profile */}
      {session && (
        <div className="border-t border-border p-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary"
          >
            <div className="relative">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src={avatarUrl || undefined} alt={userEmail} />
                <AvatarFallback className="bg-gradient-teal text-white text-sm font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {firstName || userEmail.split('@')[0]}
              </p>
              {subscription && (
                <PlanBadge planKey={subscription.plan.key} />
              )}
            </div>
            <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        </div>
      )}
=======
  const { data: subscription } = useAccountSubscription();
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
  const sections = groupNavigation(getVisibleNavigation(isAdmin));

  return (
    <aside className="glass sticky top-0 hidden h-screen w-[288px] shrink-0 flex-col border-r border-sidebar-border md:flex">
      <div className="flex h-full flex-col px-4 py-5">
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[26px] border border-white/80 bg-white/70 px-4 py-4 shadow-sm">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-teal text-white shadow-teal">
              <Sparkles className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold lowercase tracking-tight text-gradient-hero">
                lyra
              </p>
              <p className="truncate text-xs uppercase tracking-[0.24em] text-muted-foreground">
                metacare 2026
              </p>
            </div>
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic-light text-cosmic">
            <Workflow className="h-[18px] w-[18px]" strokeWidth={1.8} />
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Estado do dia
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Janela de foco, leveza e recuperação alta
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
              <Settings2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Preferências e acesso
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Ajuste perfil, hábitos e configurações do ambiente
              </p>
            </div>
          </Link>
        </div>
      </div>

    </aside>
  );
}
