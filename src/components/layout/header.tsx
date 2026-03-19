'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, ChevronRight, LogOut, Search, Settings, User } from 'lucide-react';
import React from 'react';
import { MobileSidebar } from './MobileSidebar';
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { PlanBadge } from '@/components/subscription/PlanBadge';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/plan': 'Plano de IA',
  '/goals': 'Metas',
  '/appointments': 'Agendamentos',
  '/monitoring': 'Monitoramento',
  '/chat': 'Assistente IA',
  '/connect': 'Dispositivos',
  '/profile': 'Perfil',
  '/admin/dashboard': 'Admin — Visão Geral',
  '/admin/users': 'Admin — Usuários',
  '/admin/plans': 'Admin — Planos',
  '/admin/data-health': 'Admin — Saúde dos Dados',
  '/admin/content': 'Admin — Conteúdo',
  '/admin/ai-config': 'Admin — Config. IA',
  '/admin/reports': 'Admin — Relatórios',
};

export function Header() {
  const { session, db } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const { data: subscription } = useAccountSubscription();

  const fetchAvatar = React.useCallback(async () => {
    if (!session?.user) return;
    const { data, error } = await db
      .from('profiles')
      .select('avatar_url')
      .eq('id', session.user.id)
      .maybeSingle();
    if (error) {
      setAvatarUrl(null);
      return;
    }
    setAvatarUrl(data?.avatar_url || null);
  }, [session, db]);

  React.useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  const handleSignOut = async () => {
    await db.auth.signOut();
    router.push('/login');
  };

  if (!session) return null;

  const userEmail = session.user.email || '';
  const initial = userEmail.charAt(0).toUpperCase();
  const pageTitle = PAGE_TITLES[pathname] || '';

  return (
    <header className="sticky top-0 z-30 flex items-center h-16 px-4 md:px-6 border-b border-border bg-background/85 backdrop-blur-xl">
      {/* Left: Mobile sidebar + Page title */}
      <div className="flex items-center gap-3">
        <MobileSidebar />
        {pageTitle && (
          <h2 className="hidden md:block text-lg font-display font-semibold text-foreground">
            {pageTitle}
          </h2>
        )}
      </div>

      {/* Center: Search (desktop) */}
      <div className="hidden lg:flex flex-1 justify-center max-w-md mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar em tudo..."
            className="w-full rounded-full bg-secondary border-none pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          />
        </div>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full h-9 w-9"
          aria-label="Notificações"
        >
          <Bell className="h-[18px] w-[18px] text-muted-foreground" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
              aria-label="Menu do usuário"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl || undefined} alt={userEmail} />
                <AvatarFallback className="bg-gradient-teal text-white text-sm font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-medium leading-none">Minha Conta</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {userEmail}
                </p>
                {subscription ? (
                  <div className="pt-0.5">
                    <PlanBadge planKey={subscription.plan.key} />
                  </div>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className="rounded-lg cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className="rounded-lg cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
