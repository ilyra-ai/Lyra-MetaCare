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
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-center text-primary">Lyra MetaCare</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {/* Grupo: Análise */}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Análise</div>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/plan">
              <BrainCircuit className="mr-2 h-4 w-4" />
              Plano de IA
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/goals">
              <Target className="mr-2 h-4 w-4" />
              Metas
            </Link>
          </Button>

          <Separator className="my-2" />

          {/* Grupo: Ferramentas */}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Ferramentas</div>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/appointments">
              <Calendar className="mr-2 h-4 w-4" />
              Agendamentos
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/monitoring">
              <HeartPulse className="mr-2 h-4 w-4" />
              Monitoramento
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/chat">
              <MessageCircle className="mr-2 h-4 w-4" />
              Assistente IA
            </Link>
          </Button>
          
          <Separator className="my-2" />

          {/* Grupo: Sua Conta */}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Sua Conta</div>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/connect">
              <Zap className="mr-2 h-4 w-4" />
              Conexão de Dados
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="#">
              <Settings className="mr-2 h-4 w-4" />
              Configurações (Em Breve)
            </Link>
          </Button>
          
          {isAdmin && (
            <>
              <Separator className="my-2" />
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Admin</div>
              <Button asChild variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  <Link href="/admin/ai-config">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin IA
                  </Link>
              </Button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}