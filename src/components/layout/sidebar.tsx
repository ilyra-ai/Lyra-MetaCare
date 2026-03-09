"use client";

import { LayoutDashboard, User, BrainCircuit, Target, Zap, Shield, HeartPulse, MessageCircle, Calendar, BarChart2, Users, LayoutGrid, ClipboardList } from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { Separator } from "@/components/ui/separator";
import { SidebarLink } from "./SidebarLink";

export function Sidebar() {
  const isAdmin = useIsAdmin();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white/60 backdrop-blur-xl border-r border-white/20 dark:bg-gray-950/60 dark:border-gray-800/50 shadow-glass dark:shadow-glass-dark z-20">
      <div className="p-6 border-b border-white/10 flex items-center justify-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <BrainCircuit className="h-6 w-6 text-primary drop-shadow-md" />
        </div>
        <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Lyra MetaCare
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
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
    </aside>
  );
}