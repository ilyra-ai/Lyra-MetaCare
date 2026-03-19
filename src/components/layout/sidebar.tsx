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
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlanBadge } from '@/components/subscription/PlanBadge';
import { SidebarLink } from './SidebarLink';
import React from 'react';
import Link from 'next/link';

export function Sidebar() {
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
    </aside>
  );
}
