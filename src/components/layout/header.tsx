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
import { useAccountSubscription } from '@/hooks/use-account-subscription';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scalePx, scaleRem } from '@/lib/site-page-config/runtime';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
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

export function Header() {
  const { session, db } = useAuth();
  const { data: subscription } = useAccountSubscription();
  const isAdmin = useIsAdmin();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = React.useState<ProfileState | null>(null);
  const [commandOpen, setCommandOpen] = React.useState(false);

  const pageMeta = getPageMeta(pathname, appConfig);
  const breadcrumbs = buildBreadcrumb(pathname, appConfig);
  const navigation = groupNavigation(getVisibleNavigation(isAdmin, appConfig));

  React.useEffect(() => {
    if (!session?.user) return;

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
              <h1
                className="truncate font-display font-bold tracking-tight text-foreground"
                style={{
                  fontSize: scaleRem(1.5, appConfig.typography.pageTitle),
                }}
              >
                {pageMeta.title}
              </h1>
              <p
                className="hidden truncate text-muted-foreground md:block"
                style={{
                  fontSize: scaleRem(0.875, appConfig.typography.pageBody),
                }}
              >
                {pageMeta.description}
              </p>
            </div>
          </div>

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
                  style={{
                    height: scalePx(18, appConfig.sizing.iconScale),
                    width: scalePx(18, appConfig.sizing.iconScale),
                  }}
                />
                <span>{appConfig.header.commandPlaceholder}</span>
              </span>
              <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
                {appConfig.header.commandShortcutLabel}
              </span>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 rounded-full"
              aria-label="Notificações"
            >
              <Bell
                className="h-[18px] w-[18px] text-foreground"
                strokeWidth={1.8}
                style={{
                  height: scalePx(18, appConfig.sizing.iconScale),
                  width: scalePx(18, appConfig.sizing.iconScale),
                }}
              />
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-accent shadow-coral animate-pulse-slow" />
            </Button>

            <Button
              type="button"
              className="hidden rounded-full bg-gradient-coral px-5 text-white shadow-coral hover:brightness-105 md:inline-flex"
              onClick={() => router.push('/chat')}
              style={{
                fontSize: scaleRem(0.875, appConfig.typography.buttonLabel),
              }}
            >
              <MessageCircleHeart
                className="mr-2 h-[18px] w-[18px]"
                strokeWidth={1.8}
                style={{
                  height: scalePx(18, appConfig.sizing.iconScale),
                  width: scalePx(18, appConfig.sizing.iconScale),
                }}
              />
              {appConfig.header.assistantLabel}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 rounded-full px-2 md:px-3"
                  aria-label="Abrir menu do usuário"
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
                  {appConfig.header.profileMenuLabel}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-2xl px-3 py-3"
                  onClick={() => router.push('/profile')}
                >
                  <Settings2 className="mr-2 h-[18px] w-[18px]" />
                  Preferências
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
        <CommandInput
          placeholder={`${appConfig.header.commandPlaceholder}...`}
        />
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
  );
}
