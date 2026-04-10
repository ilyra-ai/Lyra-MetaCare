import type { ComponentConfig } from '@puckeditor/core';
import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  juntarClasses,
  obterClasseAlinhamento,
} from '@/lib/puck/config/components/helpers';
import type { LyraCTAButtonBlockProps } from '@/lib/puck/types';

function LyraCTAButtonBlock({
  label,
  href,
  variant,
  size,
  align,
  supportingText,
}: LyraCTAButtonBlockProps) {
  return (
    <div
      className={juntarClasses(
        'flex w-full flex-col gap-3',
        obterClasseAlinhamento(align)
      )}
    >
      <Button
        asChild
        variant={variant === 'primary' ? 'default' : variant}
        size={size === 'xl' ? 'xl' : size}
      >
        <a href={href}>
          {label}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </Button>
      {supportingText ? (
        <p className="max-w-xl text-sm leading-7 text-muted-foreground">
          {supportingText}
        </p>
      ) : null}
    </div>
  );
}

export const lyraCTAButtonBlockConfig = {
  label: 'Botão CTA',
  fields: {
    label: {
      type: 'text',
      label: 'Rótulo',
    },
    href: {
      type: 'text',
      label: 'Destino',
    },
    variant: {
      type: 'select',
      label: 'Variante',
      options: [
        { label: 'Primário', value: 'primary' },
        { label: 'Accent', value: 'accent' },
        { label: 'Secundário', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
      ],
    },
    size: {
      type: 'select',
      label: 'Tamanho',
      options: [
        { label: 'Pequeno', value: 'sm' },
        { label: 'Padrão', value: 'default' },
        { label: 'Grande', value: 'lg' },
        { label: 'Extra grande', value: 'xl' },
      ],
    },
    align: {
      type: 'radio',
      label: 'Alinhamento',
      options: [
        { label: 'Esquerda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Direita', value: 'right' },
      ],
    },
    supportingText: {
      type: 'text',
      label: 'Texto auxiliar',
    },
  },
  defaultProps: {
    label: 'Começar agora',
    href: '/login',
    variant: 'primary',
    size: 'lg',
    align: 'left',
    supportingText:
      'Conecte seus sinais, ajuste sua experiência e publique com segurança.',
  },
  render: (props: Record<string, unknown>) => (
    <LyraCTAButtonBlock
      label={String(props.label ?? '')}
      href={String(props.href ?? '#')}
      variant={
        (props.variant as LyraCTAButtonBlockProps['variant']) ?? 'primary'
      }
      size={(props.size as LyraCTAButtonBlockProps['size']) ?? 'lg'}
      align={(props.align as LyraCTAButtonBlockProps['align']) ?? 'left'}
      supportingText={String(props.supportingText ?? '')}
    />
  ),
} satisfies ComponentConfig<LyraCTAButtonBlockProps>;
