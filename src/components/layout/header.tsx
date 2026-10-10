'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
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
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <MobileSidebar />

          <div className="min-w-0 flex-1">
            <h1
              className="truncate font-display font-semibold tracking-tight text-foreground"
              style={{
                fontSize: scaleRem(1.125, appConfig.typography.pageTitle),
              }}
            >
              {pageMeta.title}
            </h1>
            <p
              className="hidden truncate text-muted-foreground xl:block"
              style={{
                fontSize: scaleRem(0.8125, appConfig.typography.pageBody),
              }}
            >
              {pageMeta.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="command-surface hidden w-[280px] shrink-0 transition-colors hover:border-input md:flex"
            aria-keyshortcuts="Control+K"
          >
            <Search
              aria-hidden="true"
              className="shrink-0"
              strokeWidth={1.9}
              style={{
                height: scalePx(16, appConfig.sizing.iconScale),
                width: scalePx(16, appConfig.sizing.iconScale),
              }}
            />
            <span className="flex-1 truncate text-left">
              {appConfig.header.commandPlaceholder}
            </span>
            <kbd className="rounded-[6px] border border-border bg-card px-1.5 py-0.5 font-sans text-xs text-muted-foreground">
              {appConfig.header.commandShortcutLabel}
            </kbd>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setCommandOpen(true)}
              aria-label={appConfig.header.commandPlaceholder}
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Notificações"
            >
              <Bell
                className="text-foreground"
                strokeWidth={1.9}
                style={{
                  height: scalePx(18, appConfig.sizing.iconScale),
                  width: scalePx(18, appConfig.sizing.iconScale),
                }}
              />
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="hidden md:inline-flex"
              onClick={() => router.push('/chat')}
              style={{
                fontSize: scaleRem(0.875, appConfig.typography.buttonLabel),
              }}
            >
              <MessageCircleHeart
                aria-hidden="true"
                className="text-cosmic"
                strokeWidth={1.9}
                style={{
                  height: scalePx(16, appConfig.sizing.iconScale),
                  width: scalePx(16, appConfig.sizing.iconScale),
                }}
              />
              {appConfig.header.assistantLabel}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 gap-2 rounded-full px-1"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      alt={`Avatar de ${firstName}`}
                    />
                    <AvatarFallback aria-hidden="true">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Abrir menu do usuário </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={`Avatar de ${firstName}`}
                      />
                      <AvatarFallback>{initial}</AvatarFallback>
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
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <UserRound />
                  {appConfig.header.profileMenuLabel}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <Settings2 />
                  Preferências
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut />
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
