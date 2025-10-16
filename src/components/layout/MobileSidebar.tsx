"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  Settings,
  BrainCircuit,
  Target,
  Zap,
  Shield,
  HeartPulse,
  MessageCircle,
  Menu,
  Calendar,
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
          {/* Grupo: Análise */}
          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">Análise</div>
          <SidebarLink href="/" icon={LayoutDashboard}>Dashboard</SidebarLink>
          <SidebarLink href="/plan" icon={BrainCircuit}>Plano de IA</SidebarLink>
          <SidebarLink href="/goals" icon={Target}>Metas</SidebarLink>

          <Separator className="my-2" />

          {/* Grupo: Ferramentas */}
          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">Ferramentas</div>
          <SidebarLink href="/appointments" icon={Calendar}>Agendamentos</SidebarLink>
          <SidebarLink href="/monitoring" icon={HeartPulse}>Monitoramento</SidebarLink>
          <SidebarLink href="/chat" icon={MessageCircle}>Assistente IA</SidebarLink>
          
          <Separator className="my-2" />

          {/* Grupo: Sua Conta */}
          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">Sua Conta</div>
          <SidebarLink href="/connect" icon={Zap}>Conexão de Dados</SidebarLink>
          <SidebarLink href="/profile" icon={User}>Perfil</SidebarLink>
          <SidebarLink href="#" icon={Settings} className="text-muted-foreground cursor-not-allowed">Configurações</SidebarLink>
          
          {isAdmin && (
            <>
              <Separator className="my-2" />
              <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">Admin</div>
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
      </SheetContent>
    </Sheet>
  );
}