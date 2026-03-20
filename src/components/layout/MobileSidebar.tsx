'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarLink } from './SidebarLink';
import { getVisibleNavigation, groupNavigation } from './navigation';
import { useAuth } from '@/context/AuthContext';
import { useIsAdmin } from '@/hooks/use-is-admin';

export function MobileSidebar() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin();
  const [open, setOpen] = React.useState(false);

  const sections = groupNavigation(getVisibleNavigation(isAdmin));
  const firstName =
    session?.user?.email?.split('@')[0]?.replace(/\./g, ' ') || 'Paciente';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full md:hidden"
          aria-label="Abrir navegação"
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[92vw] max-w-[360px] border-r-0 bg-transparent p-0 shadow-none"
      >
        <div className="glass flex h-full flex-col rounded-r-[32px] border-r border-white/80 px-4 py-4">
          <SheetHeader className="space-y-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-teal text-white shadow-teal">
                  <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </div>
                <div>
                  <SheetTitle className="font-display text-xl font-bold lowercase text-gradient-hero">
                    lyra
                  </SheetTitle>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    metacare
                  </p>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setOpen(false)}
                aria-label="Fechar navegação"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </Button>
            </div>
          </SheetHeader>

          <div className="mb-5 rounded-[24px] border border-white/80 bg-white/70 px-4 py-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Navegação ativa
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">
              Olá, {firstName}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Acesse seus fluxos de cuidado, consultas, monitoramento e operação
              administrativa sem perder o contexto.
            </p>
          </div>

          <nav
            aria-label="Navegação móvel"
            className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1"
          >
            {Object.entries(sections).map(([section, items]) => (
              <section key={section} className="space-y-2">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                  {section}
                </p>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <SidebarLink
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      description={item.description}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </SidebarLink>
                  ))}
                </div>
              </section>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
