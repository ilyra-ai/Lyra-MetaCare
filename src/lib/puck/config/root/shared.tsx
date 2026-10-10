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

/*
 * As chaves de tema são valores persistidos nos documentos publicados e
 * permanecem iguais; a renderização usa superfície branca com borda, e o tema
 * de landing recebe apenas um detalhe violeta discreto na borda e no selo.
 */
const classesPorTema: Record<LyraPuckThemeVariant, string> = {
  aurora: 'border-cosmic/30 bg-card',
  serene: 'border-primary/20 bg-card',
  shell: 'border-border bg-card',
};

const badgePorTema: Record<LyraPuckThemeVariant, string> = {
  aurora: 'border-cosmic/20 bg-cosmic-light text-cosmic-strong',
  serene: 'border-transparent bg-sidebar-accent text-primary',
  shell: 'border-border bg-muted text-foreground',
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
  isEditing,
}: LyraPuckRootProps & {
  children?: ReactNode;
  rotuloBadge: string;
  isEditing: boolean;
}) {
  const regras = obterRegrasVisibilidade(visibilityRules);

  return (
    <section
      className={cn(
        'min-w-0 space-y-6 rounded-xl border p-5 md:p-6',
        classesPorTema[themeVariant]
      )}
      data-surface-key={surfaceKey}
      data-theme-variant={themeVariant}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn('px-3 py-1', badgePorTema[themeVariant])}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {rotuloBadge}
          </Badge>

          <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            <Layers3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">superfície: {surfaceTitle}</span>
          </div>

          <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">chave: {surfaceKey}</span>
          </div>

          <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">fonte: {dynamicSource ?? 'manual'}</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-2">
            <h2 className="break-words font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {surfaceTitle}
            </h2>
            <p className="max-w-4xl text-sm leading-6 text-muted-foreground md:text-base md:leading-relaxed">
              {surfaceDescription}
            </p>
            {resolvedContextSummary ? (
              <div className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground/80">
                {resolvedContextSummary}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {regras.map((regra) => (
            <span
              key={regra}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {regra}
            </span>
          ))}
        </div>
      </div>

      {/*
        Fora do editor, o painel do slot some quando não há blocos publicados
        (o Puck renderiza apenas um `<div>` vazio); no editor ele permanece
        visível como área de soltar.
      */}
      <div
        className={cn(
          'space-y-4 rounded-xl border border-border bg-background p-4 md:p-6',
          !isEditing && 'has-[>div:only-child:empty]:hidden'
        )}
      >
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
        isEditing={props.puck.isEditing}
      >
        {props?.children}
      </LyraSurfaceRoot>
    ),
  } satisfies RootConfig<LyraPuckRootProps>;
}
