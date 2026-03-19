'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  Brain,
  Target,
  Calendar,
  Radio,
  Smartphone,
  User,
  Shield,
  HeartPulse,
  Menu,
  BarChart2,
  Users,
  ClipboardList,
  Gem,
  Wand2,
  Sparkles,
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { SidebarLink } from './SidebarLink';
import React from 'react';

export function MobileSidebar() {
  const isAdmin = useIsAdmin();
  const [open, setOpen] = React.useState(false);

  const closeSheet = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full h-9 w-9"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 p-0 border-r border-border bg-background"
      >
        {/* Logo */}
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="p-2 bg-gradient-teal rounded-xl shadow-teal">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold text-gradient-hero">
            lyra
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Principal
          </p>
          <SidebarLink href="/" icon={LayoutGrid} onClick={closeSheet}>
            Dashboard
          </SidebarLink>
          <SidebarLink href="/plan" icon={Wand2} onClick={closeSheet}>
            Plano de IA
          </SidebarLink>
          <SidebarLink href="/goals" icon={Target} onClick={closeSheet}>
            Metas
          </SidebarLink>

          <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Clínica
          </p>
          <SidebarLink href="/appointments" icon={Calendar} onClick={closeSheet}>
            Agendamentos
          </SidebarLink>
          <SidebarLink href="/monitoring" icon={Radio} onClick={closeSheet}>
            Monitoramento
          </SidebarLink>
          <SidebarLink href="/chat" icon={Brain} onClick={closeSheet}>
            Assistente IA
          </SidebarLink>

          <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Pessoal
          </p>
          <SidebarLink href="/connect" icon={Smartphone} onClick={closeSheet}>
            Dispositivos
          </SidebarLink>
          <SidebarLink href="/profile" icon={User} onClick={closeSheet}>
            Perfil
          </SidebarLink>

          {isAdmin && (
            <>
              <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Administração
              </p>
              <SidebarLink
                href="/admin/dashboard"
                icon={LayoutGrid}
                onClick={closeSheet}
              >
                Visão Geral
              </SidebarLink>
              <SidebarLink href="/admin/users" icon={Users} onClick={closeSheet}>
                Usuários
              </SidebarLink>
              <SidebarLink href="/admin/plans" icon={Gem} onClick={closeSheet}>
                Planos
              </SidebarLink>
              <SidebarLink
                href="/admin/data-health"
                icon={HeartPulse}
                onClick={closeSheet}
              >
                Saúde dos Dados
              </SidebarLink>
              <SidebarLink
                href="/admin/content"
                icon={ClipboardList}
                onClick={closeSheet}
              >
                Conteúdo
              </SidebarLink>
              <SidebarLink
                href="/admin/ai-config"
                icon={Shield}
                onClick={closeSheet}
              >
                Config. IA
              </SidebarLink>
              <SidebarLink
                href="/admin/reports"
                icon={BarChart2}
                onClick={closeSheet}
              >
                Relatórios
              </SidebarLink>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
