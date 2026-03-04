"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  BrainCircuit,
  Target,
  Zap,
  Shield,
  HeartPulse,
  MessageCircle,
  Menu,
  Calendar,
  BarChart2,
  Users,
  LayoutGrid,
  ClipboardList,
} from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { Separator } from "@/components/ui/separator";
import { SidebarLink } from "./SidebarLink";

export function MobileSidebar() {
  const isAdmin = useIsAdmin();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="p-4 border-b flex items-center justify-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Lyra MetaCare</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarLink href="/" icon={LayoutDashboard}>Dashboard</SidebarLink>
          <SidebarLink href="/plan" icon={BrainCircuit}>Plano de IA</SidebarLink>
          <SidebarLink href="/goals" icon={Target}>Metas</SidebarLink>

          <Separator className="my-2" />

          <SidebarLink href="/appointments" icon={Calendar}>Agendamentos</SidebarLink>
          <SidebarLink href="/monitoring" icon={HeartPulse}>Monitoramento</SidebarLink>
          <SidebarLink href="/chat" icon={MessageCircle}>Assistente IA</SidebarLink>
          
          <Separator className="my-2" />

          <SidebarLink href="/connect" icon={Zap}>Conexão de Dados</SidebarLink>
          <SidebarLink href="/profile" icon={User}>Perfil</SidebarLink>
          
          {isAdmin && (
            <>
              <Separator className="my-2" />
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">ADMINISTRAÇÃO</div>
              <SidebarLink href="/admin/dashboard" icon={LayoutGrid}>Visão Geral</SidebarLink>
              <SidebarLink href="/admin/users" icon={Users}>Usuários</SidebarLink>
              <SidebarLink href="/admin/data-health" icon={HeartPulse}>Saúde dos Dados</SidebarLink>
              <SidebarLink href="/admin/content" icon={ClipboardList}>Conteúdo do App</SidebarLink>
              <SidebarLink href="/admin/ai-config" icon={Shield}>Configuração da IA</SidebarLink>
              <SidebarLink href="/admin/reports" icon={BarChart2}>Relatórios</SidebarLink>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}