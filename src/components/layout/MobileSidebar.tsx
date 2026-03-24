'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Sparkles, X } from 'lucide-react';
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

  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SidebarLink } from './SidebarLink';
import { getVisibleNavigation, groupNavigation } from './navigation';
import { useAuth } from '@/context/AuthContext';
import { useIsAdmin } from '@/hooks/use-is-admin';


export function MobileSidebar() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin();
  const [open, setOpen] = React.useState(false);


  const closeSheet = () => setOpen(false);

  const sections = groupNavigation(getVisibleNavigation(isAdmin));
  const firstName =
    session?.user?.email?.split('@')[0]?.replace(/\./g, ' ') || 'Paciente';


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

          className="h-11 w-11 rounded-full md:hidden"
          aria-label="Abrir navegação"
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[92vw] max-w-[360px] border-r-0 bg-transparent p-0 shadow-none"
      >
        <div className="glass flex h-full flex-col rounded-r-[32px] border-r border-white/80 px-4 py-4">
          <SheetHeader className="space-y-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={() => setOpen(false)}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-teal text-white shadow-teal">
                  <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </div>
                <div>
                  <SheetTitle className="font-display text-xl font-bold lowercase text-gradient-hero">
                    lyra
                  </SheetTitle>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    metacare
                  </p>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setOpen(false)}
                aria-label="Fechar navegação"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </Button>
            </div>
          </SheetHeader>

          <div className="mb-5 rounded-[24px] border border-white/80 bg-white/70 px-4 py-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Navegação ativa
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">
              Olá, {firstName}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Acesse seus fluxos de cuidado, consultas, monitoramento e operação
              administrativa sem perder o contexto.
            </p>
          </div>

          <nav
            aria-label="Navegação móvel"
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
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </SidebarLink>
                  ))}
                </div>
              </section>
            ))}
          </nav>
        </div>

      </SheetContent>
    </Sheet>
  );
}
