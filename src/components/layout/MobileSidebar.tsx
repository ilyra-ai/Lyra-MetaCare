'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SidebarLink } from './SidebarLink';
import { getVisibleNavigation, groupNavigation } from './navigation';
import { useAuth } from '@/context/AuthContext';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scalePx, scaleRem } from '@/lib/site-page-config/runtime';

/*
  Navegação do celular e tablet (abaixo de `lg`): painel lateral com a
  mesma estrutura da sidebar do desktop. O botão de fechar vem do próprio
  `SheetContent`.
*/
export function MobileSidebar() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const [open, setOpen] = React.useState(false);

  const sections = groupNavigation(getVisibleNavigation(isAdmin, appConfig));
  const firstName =
    session?.user?.email?.split('@')[0]?.replace(/\./g, ' ') || 'Paciente';
  const iconScale = appConfig.sizing.iconScale;
  const navLabelScale = appConfig.typography.navLabel;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir navegação"
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="gap-5">
        <SheetHeader className="space-y-0 pr-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-1"
            onClick={() => setOpen(false)}
          >
            <span
              aria-hidden="true"
              className="flex shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-foreground"
              style={{
                height: scalePx(32, iconScale),
                width: scalePx(32, iconScale),
              }}
            >
              <Sparkles
                strokeWidth={2}
                style={{
                  height: scalePx(16, iconScale),
                  width: scalePx(16, iconScale),
                }}
              />
            </span>
            <span className="min-w-0 text-left">
              <SheetTitle
                className="font-display font-semibold lowercase leading-tight text-foreground"
                style={{ fontSize: scaleRem(1.125, navLabelScale) }}
              >
                {appConfig.sidebar.brandTitle}
              </SheetTitle>
              <span
                className="block truncate text-muted-foreground"
                style={{ fontSize: scaleRem(0.75, navLabelScale) }}
              >
                {appConfig.sidebar.brandEyebrow}
              </span>
            </span>
          </Link>
        </SheetHeader>

        <div className="rounded-md border border-border bg-background px-3.5 py-3">
          <p className="text-xs font-medium text-muted-foreground">
            {appConfig.sidebar.statusEyebrow}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            Olá, {firstName}
          </p>
          <SheetDescription className="mt-0.5 text-sm leading-6 text-muted-foreground">
            {appConfig.sidebar.statusTitle}
          </SheetDescription>
        </div>

        <nav
          aria-label="Navegação móvel"
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto"
        >
          {Object.entries(sections).map(([section, items]) => (
            <section key={section} className="flex flex-col gap-0.5">
              <p className="px-2.5 pb-1.5 text-xs font-medium text-muted-foreground">
                {section}
              </p>
              {items.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  onClick={() => setOpen(false)}
                  iconScale={iconScale}
                  labelScale={navLabelScale}
                >
                  {item.label}
                </SidebarLink>
              ))}
            </section>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
