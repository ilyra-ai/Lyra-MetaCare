"use client";

import Link from "next/link";
import { LayoutDashboard, User, Settings, BrainCircuit, Target, Zap, Shield, HeartPulse, MessageCircle, Calendar } from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { Separator } from "@/components/ui/separator";
import { SidebarLink } from "./SidebarLink";

export function Sidebar() {
  const isAdmin = useIsAdmin();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r dark:bg-gray-950 dark:border-gray-800">
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
        <SidebarLink href="#" icon={Settings} className="text-muted-foreground cursor-not-allowed">Configurações</SidebarLink>
        
        {isAdmin && (
          <>
            <Separator className="my-2" />
            <SidebarLink 
              href="/admin/ai-config" 
              icon={Shield} 
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Admin IA
            </SidebarLink>
          </>
        )}
      </nav>
    </aside>
  );
}