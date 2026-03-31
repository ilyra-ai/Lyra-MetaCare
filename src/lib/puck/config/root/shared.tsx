import type { ReactNode } from 'react';
import type { RootConfig } from '@puckeditor/core';
import { Eye, Layers3, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LyraPuckRootProps, LyraPuckThemeVariant } from '@/lib/puck/types';

type LyraPuckRootConfig = NonNullable<RootConfig<LyraPuckRootProps>>;

type CriarRootConfigParams = {
  tituloPadrao: string;
  surfaceKey: LyraPuckRootProps['surfaceKey'];
  surfaceTitle: string;
  surfaceDescription: string;
  themeVariant: LyraPuckThemeVariant;
  visibilityRules: string;
  rotuloBadge: string;
};

const classesPorTema: Record<LyraPuckThemeVariant, string> = {
  aurora:
    'border-cosmic/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(237,233,254,0.7),rgba(224,231,255,0.62))]',
  serene:
    'border-primary/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,253,250,0.86),rgba(249,248,252,0.92))]',
  shell:
    'border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))]',
};

const badgePorTema: Record<LyraPuckThemeVariant, string> = {
  aurora: 'border-cosmic/20 bg-cosmic/10 text-cosmic',
  serene: 'border-primary/20 bg-primary/10 text-primary',
  shell: 'border-foreground/10 bg-foreground/[0.06] text-foreground',
};

function obterRegrasVisibilidade(visibilityRules: string) {
  return visibilityRules
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function LyraSurfaceRoot({
  children,
  title,
  surfaceKey,
  surfaceTitle,
  surfaceDescription,
  themeVariant,
  visibilityRules,
  rotuloBadge,
}: LyraPuckRootProps & {
  children?: ReactNode;
  rotuloBadge: string;
}) {
  const regras = obterRegrasVisibilidade(visibilityRules);

  return (
    <section
      className={cn(
        'space-y-6 rounded-[32px] border p-6 shadow-[0_28px_90px_-56px_rgba(15,23,42,0.32)] md:p-8',
        classesPorTema[themeVariant]
      )}
      data-surface-key={surfaceKey}
      data-theme-variant={themeVariant}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            className={cn(
              'rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.22em]',
              badgePorTema[themeVariant]
            )}
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            {rotuloBadge}
          </Badge>

          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/75 px-3 py-1.5 text-xs text-muted-foreground">
            <Layers3 className="h-3.5 w-3.5" />
            superfície: {surfaceTitle}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/75 px-3 py-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            chave: {surfaceKey}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {title}
          </p>
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {surfaceTitle}
            </h2>
            <p className="max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
              {surfaceDescription}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {regras.map((regra) => (
            <span
              key={regra}
              className="rounded-full border border-border/80 bg-white/80 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {regra}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_20px_80px_-60px_rgba(15,23,42,0.38)] md:p-6">
        {children}
      </div>
    </section>
  );
}

export function criarLyraRootConfig(
  params: CriarRootConfigParams
): LyraPuckRootConfig {
  return {
    fields: {
      title: {
        type: 'text',
        label: 'Rótulo interno da superfície',
      },
      surfaceKey: {
        type: 'radio',
        label: 'Chave da superfície',
        options: [
          { label: 'Landing', value: 'landing' },
          { label: 'Login', value: 'login' },
          { label: 'App Shell', value: 'app-shell' },
        ],
      },
      surfaceTitle: {
        type: 'text',
        label: 'Título da superfície',
      },
      surfaceDescription: {
        type: 'textarea',
        label: 'Descrição estrutural',
      },
      themeVariant: {
        type: 'select',
        label: 'Tema da superfície',
        options: [
          { label: 'Aurora', value: 'aurora' },
          { label: 'Sereno', value: 'serene' },
          { label: 'Shell', value: 'shell' },
        ],
      },
      visibilityRules: {
        type: 'textarea',
        label: 'Regras de visibilidade',
      },
    },
    defaultProps: {
      title: params.tituloPadrao,
      surfaceKey: params.surfaceKey,
      surfaceTitle: params.surfaceTitle,
      surfaceDescription: params.surfaceDescription,
      themeVariant: params.themeVariant,
      visibilityRules: params.visibilityRules,
    },
    render: (props) => (
      <LyraSurfaceRoot
        title={String(props.title ?? params.tituloPadrao)}
        surfaceKey={
          (props.surfaceKey as LyraPuckRootProps['surfaceKey']) ??
          params.surfaceKey
        }
        surfaceTitle={String(props.surfaceTitle ?? params.surfaceTitle)}
        surfaceDescription={String(
          props.surfaceDescription ?? params.surfaceDescription
        )}
        themeVariant={
          (props.themeVariant as LyraPuckRootProps['themeVariant']) ??
          params.themeVariant
        }
        visibilityRules={String(
          props.visibilityRules ?? params.visibilityRules
        )}
        rotuloBadge={params.rotuloBadge}
      >
        {props.children}
      </LyraSurfaceRoot>
    ),
  } satisfies RootConfig<LyraPuckRootProps>;
}
