import type { ReactNode } from 'react';
import type { RootConfig } from '@puckeditor/core';
import { Eye, Layers3, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { obterResumoAssinaturaLyra } from '@/lib/puck/dynamic/metrics';
import { obterPerfilDinamicoLyra } from '@/lib/puck/dynamic/profile';
import {
  criarCamposBaseRootLyra,
  resolverCamposRootLyra,
} from '@/lib/puck/fields/dynamic';
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

const camposSomenteLeituraRoot: Partial<
  Record<keyof LyraPuckRootProps, boolean>
> = {
  resolvedContextSummary: true,
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
  dynamicSource,
  surfaceKey,
  surfaceTitle,
  surfaceDescription,
  themeVariant,
  visibilityRules,
  resolvedContextSummary,
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

          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/75 px-3 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            fonte: {dynamicSource ?? 'manual'}
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
            {resolvedContextSummary ? (
              <div className="rounded-[22px] border border-primary/15 bg-primary/[0.06] px-4 py-3 text-sm leading-7 text-foreground/85">
                {resolvedContextSummary}
              </div>
            ) : null}
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
  configParams: CriarRootConfigParams
): LyraPuckRootConfig {
  return {
    fields: criarCamposBaseRootLyra(),
    defaultProps: {
      title: configParams.tituloPadrao,
      dynamicSource: 'manual',
      surfaceKey: configParams.surfaceKey,
      surfaceTitle: configParams.surfaceTitle,
      surfaceDescription: configParams.surfaceDescription,
      themeVariant: configParams.themeVariant,
      visibilityRules: configParams.visibilityRules,
      resolvedContextSummary: '',
    },
    resolveFields: async (data, resolverParams) => {
      const dynamicSource =
        (data.props?.dynamicSource as LyraPuckRootProps['dynamicSource']) ??
        'manual';
      const surfaceKey =
        (data.props?.surfaceKey as LyraPuckRootProps['surfaceKey']) ??
        configParams.surfaceKey;

      if (
        !resolverParams.changed.dynamicSource &&
        !resolverParams.changed.surfaceKey &&
        !resolverParams.changed.surfaceTitle &&
        !resolverParams.changed.surfaceDescription &&
        resolverParams.lastFields
      ) {
        return resolverParams.lastFields;
      }

      return resolverCamposRootLyra({
        dynamicSource,
        surfaceKey,
        title: String(data.props?.title ?? configParams.tituloPadrao),
        surfaceTitle: String(
          data.props?.surfaceTitle ?? configParams.surfaceTitle
        ),
        surfaceDescription: String(
          data.props?.surfaceDescription ?? configParams.surfaceDescription
        ),
        themeVariant:
          (data.props?.themeVariant as LyraPuckRootProps['themeVariant']) ??
          configParams.themeVariant,
        visibilityRules: String(
          data.props?.visibilityRules ?? configParams.visibilityRules
        ),
        resolvedContextSummary: String(
          data.props?.resolvedContextSummary ?? ''
        ),
      });
    },
    resolveData: async (data, params) => {
      const props = (data.props ?? {}) as Partial<LyraPuckRootProps>;
      const changed = params.changed as Partial<
        Record<keyof LyraPuckRootProps, boolean>
      >;
      const dynamicSource =
        (props.dynamicSource as LyraPuckRootProps['dynamicSource']) ?? 'manual';

      if (dynamicSource === 'manual') {
        return {
          props: {
            dynamicSource,
            resolvedContextSummary: '',
          },
          readOnly: camposSomenteLeituraRoot,
        };
      }

      if (
        params.trigger !== 'load' &&
        params.trigger !== 'force' &&
        !changed.dynamicSource &&
        !changed.surfaceKey &&
        !changed.surfaceTitle
      ) {
        return {
          props: {
            dynamicSource,
          },
          readOnly: camposSomenteLeituraRoot,
        };
      }

      const [perfil, assinatura] = await Promise.all([
        obterPerfilDinamicoLyra(),
        obterResumoAssinaturaLyra(),
      ]);

      return {
        props: {
          dynamicSource,
          resolvedContextSummary: `Sessão ${perfil.email ?? 'sem e-mail visível'} • perfil ${perfil.role ?? 'não informado'} • plano ${assinatura.planoNome} • ${assinatura.tendenciaRotulo}.`,
        },
        readOnly: camposSomenteLeituraRoot,
      };
    },
    render: (props) => (
      <LyraSurfaceRoot
        title={String(props?.title ?? configParams.tituloPadrao)}
        dynamicSource={
          (props?.dynamicSource as LyraPuckRootProps['dynamicSource']) ??
          'manual'
        }
        surfaceKey={
          (props?.surfaceKey as LyraPuckRootProps['surfaceKey']) ??
          configParams.surfaceKey
        }
        surfaceTitle={String(props?.surfaceTitle ?? configParams.surfaceTitle)}
        surfaceDescription={String(
          props?.surfaceDescription ?? configParams.surfaceDescription
        )}
        themeVariant={
          (props?.themeVariant as LyraPuckRootProps['themeVariant']) ??
          configParams.themeVariant
        }
        visibilityRules={String(
          props?.visibilityRules ?? configParams.visibilityRules
        )}
        resolvedContextSummary={String(props?.resolvedContextSummary ?? '')}
        rotuloBadge={configParams.rotuloBadge}
      >
        {props?.children}
      </LyraSurfaceRoot>
    ),
  } satisfies RootConfig<LyraPuckRootProps>;
}
