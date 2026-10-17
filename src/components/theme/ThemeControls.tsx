'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
} from '@/components/ui/dropdown-menu';

import { COR_DA_BARRA_DO_NAVEGADOR } from './tema';

/** Opções de tema oferecidas à pessoa (o claro continua sendo o padrão). */
export const OPCOES_DE_TEMA = [
  { valor: 'light', rotulo: 'Claro', Icone: Sun },
  { valor: 'dark', rotulo: 'Escuro', Icone: Moon },
  { valor: 'system', rotulo: 'Do sistema', Icone: Monitor },
] as const;

const semInscricao = () => () => {};

/**
 * O tema salvo só é conhecido no navegador; no servidor e na hidratação os
 * controles mostram um estado neutro para não divergir do HTML gerado.
 */
function useNoNavegador() {
  return React.useSyncExternalStore(
    semInscricao,
    () => true,
    () => false
  );
}

/** Mantém a meta `theme-color` alinhada ao tema efetivamente aplicado. */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  React.useEffect(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return;
    for (const meta of document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]'
    )) {
      meta.setAttribute('content', COR_DA_BARRA_DO_NAVEGADOR[resolvedTheme]);
    }
  }, [resolvedTheme]);
  return null;
}

/** Grupo "Tema" do menu do perfil: Claro, Escuro ou Do sistema. */
export function ThemeMenuGroup() {
  const { theme, setTheme } = useTheme();
  const noNavegador = useNoNavegador();
  return (
    <>
      <DropdownMenuLabel>Tema</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={noNavegador ? (theme ?? 'light') : ''}
        onValueChange={setTheme}
      >
        {OPCOES_DE_TEMA.map(({ valor, rotulo, Icone }) => (
          // Mesmo alinhamento dos demais itens do menu (ícone à esquerda) e a
          // marca da opção escolhida à direita.
          <DropdownMenuPrimitive.RadioItem
            key={valor}
            value={valor}
            className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-3 py-2.5 text-sm outline-hidden transition-colors focus:bg-muted focus:shadow-[inset_3px_0_0_hsl(var(--primary))]"
            // Escolher o tema não fecha o menu: a pessoa vê a mudança na hora.
            onSelect={(evento) => evento.preventDefault()}
          >
            <Icone aria-hidden="true" className="size-4 shrink-0" />
            {rotulo}
            <DropdownMenuPrimitive.ItemIndicator className="ml-auto">
              <Check aria-hidden="true" className="size-4 text-primary" />
            </DropdownMenuPrimitive.ItemIndicator>
          </DropdownMenuPrimitive.RadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );
}

/**
 * Botão de alternância claro/escuro para as telas públicas (landing, entrada
 * e documentos legais), que não têm o menu do perfil.
 */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const noNavegador = useNoNavegador();
  const escuro = noNavegador && resolvedTheme === 'dark';
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      aria-label="Tema escuro"
      aria-pressed={noNavegador ? escuro : undefined}
      onClick={() => setTheme(escuro ? 'light' : 'dark')}
    >
      {escuro ? (
        <Sun aria-hidden="true" className="h-[18px] w-[18px]" />
      ) : (
        <Moon aria-hidden="true" className="h-[18px] w-[18px]" />
      )}
    </Button>
  );
}
