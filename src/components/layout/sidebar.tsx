import Link from "next/link";
import { LayoutDashboard, User, Settings, BrainCircuit, Target, Zap, Shield, HeartPulse, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/hooks/use-is-admin"; // Importando o hook de admin

export function Sidebar() {
  const isAdmin = useIsAdmin();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-center text-primary">Lyra MetaCare</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
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
        
        {/* Link de Administração visível apenas para o admin */}
        {isAdmin && (
            <Button asChild variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                <Link href="/admin/ai-config">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin IA
                </Link>
            </Button>
        )}

        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="#">
            <Settings className="mr-2 h-4 w-4" />
            Configurações (Em Breve)
          </Link>
        </Button>
      </nav>
    </aside>
  );
}