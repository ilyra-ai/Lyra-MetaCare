  'use client';

  import React from 'react';
  import { usePathname, useRouter } from 'next/navigation';
  import {
    Bell,
    ChevronRight,
    LogOut,
    MessageCircleHeart,
    Search,
    Settings2,
    UserRound,
  } from 'lucide-react';
  import { useAuth } from '@/context/AuthContext';
  
  import { useRouter, usePathname } from 'next/navigation';

  import { useAccountSubscription } from '@/hooks/use-account-subscription';
  import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
  >>>>>>> main
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

  import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
  } from '@/components/ui/command';
  >>>>>>> main
  import { PlanBadge } from '@/components/subscription/PlanBadge';
  import { MobileSidebar } from './MobileSidebar';
  import {
    buildBreadcrumb,
    getPageMeta,
    getVisibleNavigation,
    groupNavigation,
  } from './navigation';
  import { useIsAdmin } from '@/hooks/use-is-admin';

  type ProfileState = {
    avatar_url: string | null;
    first_name: string | null;
  };

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

  >>>>>>> main
    const { data: subscription } = useAccountSubscription();
    const isAdmin = useIsAdmin();
    const pathname = usePathname();
    const router = useRouter();
    const [profile, setProfile] = React.useState<ProfileState | null>(null);
    const [commandOpen, setCommandOpen] = React.useState(false);

    const pageMeta = getPageMeta(pathname);
    const breadcrumbs = buildBreadcrumb(pathname);
    const navigation = groupNavigation(getVisibleNavigation(isAdmin));

    React.useEffect(() => {
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


      const loadProfile = async () => {
        const { data, error } = await db
          .from('profiles')
          .select('avatar_url, first_name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao carregar perfil no header:', error);
          return;
        }

        setProfile({
          avatar_url: data?.avatar_url ?? null,
          first_name: data?.first_name ?? null,
        });
      };

      void loadProfile();
    }, [db, session]);
  >>>>>>> main

    React.useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          setCommandOpen((current) => !current);
        }
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    if (!session) {
      return null;
    }

    const userEmail = session.user.email ?? '';
    const firstName =
      profile?.first_name?.trim() || userEmail.split('@')[0] || 'Paciente';
    const initial = firstName.charAt(0).toUpperCase();

    const handleNavigate = (href: string) => {
      setCommandOpen(false);
      router.push(href);
    };

    const handleSignOut = async () => {
      await db.auth.signOut();
      router.push('/login');
    };

    return (
      <>
        <header className="glass sticky top-0 z-40 border-b border-border/80">
          <div className="section-shell flex min-h-[88px] items-center gap-4 py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <MobileSidebar />

              <div className="min-w-0">
                <div className="mb-1 hidden items-center gap-2 md:flex">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={`${crumb}-${index}`}>
                      {index > 0 ? (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : null}
                      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        {crumb}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
                <h1 className="truncate font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {pageMeta.title}
                </h1>
                <p className="hidden truncate text-sm text-muted-foreground md:block">
                  {pageMeta.description}
                </p>
              </div>
            </div>

  
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

            <div className="hidden flex-1 items-center justify-center lg:flex">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="command-surface w-full max-w-xl justify-between hover:border-primary/20 hover:bg-white"
                aria-label="Abrir busca global"
              >
                <span className="flex items-center gap-3">
                  <Search
                    className="h-[18px] w-[18px] text-muted-foreground"
                    strokeWidth={1.8}
                  />
                  <span>Buscar pÃ¡ginas, fluxos e aÃ§Ãµes</span>
                </span>
                <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
                  Ctrl K
                </span>
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative h-11 w-11 rounded-full"
                aria-label="NotificaÃ§Ãµes"
              >
                <Bell
                  className="h-[18px] w-[18px] text-foreground"
                  strokeWidth={1.8}
                />
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-accent shadow-coral animate-pulse-slow" />
              </Button>

              <Button
                type="button"
                className="hidden rounded-full bg-gradient-coral px-5 text-white shadow-coral hover:brightness-105 md:inline-flex"
                onClick={() => router.push('/chat')}
              >
                <MessageCircleHeart
                  className="mr-2 h-[18px] w-[18px]"
                  strokeWidth={1.8}
                />
                Chat IA
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 rounded-full px-2 md:px-3"
                    aria-label="Abrir menu do usuÃ¡rio"
                  >
                    <Avatar className="h-10 w-10 border border-white shadow-sm">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={`Avatar de ${firstName}`}
                      />
                      <AvatarFallback className="bg-gradient-teal text-white">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden min-w-0 text-left md:block">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {firstName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-[320px] rounded-[24px] border-white/85 bg-card/95 p-2 shadow-xl backdrop-blur-xl"
                >
                  <DropdownMenuLabel className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-white shadow-sm">
                        <AvatarImage
                          src={profile?.avatar_url || undefined}
                          alt={`Avatar de ${firstName}`}
                        />
                        <AvatarFallback className="bg-gradient-cosmic text-white">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {firstName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {userEmail}
                        </p>
                        {subscription ? (
                          <div className="mt-2">
                            <PlanBadge planKey={subscription.plan.key} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="rounded-2xl px-3 py-3"
                    onClick={() => router.push('/profile')}
                  >
                    <UserRound className="mr-2 h-[18px] w-[18px]" />
                    Meu perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-2xl px-3 py-3"
                    onClick={() => router.push('/profile')}
                  >
                    <Settings2 className="mr-2 h-[18px] w-[18px]" />
                    PreferÃªncias
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="rounded-2xl px-3 py-3 text-destructive focus:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-[18px] w-[18px]" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <CommandInput placeholder="Buscar por pÃ¡gina, fluxo ou atalho..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            {Object.entries(navigation).map(([section, items]) => (
              <CommandGroup key={section} heading={section}>
                {items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <CommandItem
                      key={item.href}
                      value={`${item.label} ${item.description}`}
                      onSelect={() => handleNavigate(item.href)}
                    >
                      <Icon className="h-[18px] w-[18px] text-primary" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{item.label}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                      {item.shortcut ? (
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      ) : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </CommandDialog>
      </>
  >>>>>>> main
    );
  }
