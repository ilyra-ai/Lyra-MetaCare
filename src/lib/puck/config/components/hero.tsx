import type { ComponentConfig } from '@puckeditor/core';
import { ArrowUpRight, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { obterResumoAssinaturaLyra } from '@/lib/puck/dynamic/metrics';
import { obterPerfilDinamicoLyra } from '@/lib/puck/dynamic/profile';
import type { LyraHeroBlockProps } from '@/lib/puck/types';

const camposSomenteLeituraHero: Partial<
  Record<keyof LyraHeroBlockProps, boolean>
> = {
  eyebrow: true,
  title: true,
  description: true,
  note: true,
};

function deveResolverHero(
  changed: Partial<Record<keyof LyraHeroBlockProps, boolean>>
) {
  return Boolean(
    changed.dynamicSource ||
    changed.eyebrow ||
    changed.title ||
    changed.description ||
    changed.note
  );
}

async function resolverPropsHeroDinamicos(props: LyraHeroBlockProps) {
  const dynamicSource = props.dynamicSource ?? 'manual';

  if (dynamicSource === 'manual') {
    return {
      props: {
        dynamicSource,
      },
    };
  }

  const perfil = await obterPerfilDinamicoLyra();

  if (dynamicSource === 'session-profile') {
    const primeiroNome = perfil.primeiroNome ?? perfil.nomeExibicao;

    return {
      props: {
        dynamicSource,
        eyebrow: perfil.isAdmin
          ? 'Sessão administrativa ativa'
          : 'Sessão autenticada ativa',
        title: `${perfil.saudacao}, ${primeiroNome}. O editor visual da Lyra está pronto para você.`,
        description: `Você está autenticada como ${perfil.role ?? 'usuária'} e este bloco agora consome os dados reais da sessão atual para alimentar o canvas do Puck sem conteúdo estático.`,
        note: `Usuária ${perfil.email ?? 'sem e-mail visível'} • iniciais ${perfil.iniciais}`,
      },
      readOnly: camposSomenteLeituraHero,
    };
  }

  const assinatura = await obterResumoAssinaturaLyra();

  return {
    props: {
      dynamicSource,
      eyebrow: `Plano ${assinatura.planoNome}`,
      title: `${perfil.saudacao}, ${perfil.primeiroNome ?? perfil.nomeExibicao}. Sua experiência está conectada ao contexto real da assinatura.`,
      description: assinatura.descricaoCurta,
      note: `${assinatura.tendenciaRotulo} • badge ${assinatura.badgeLabel}`,
    },
    readOnly: camposSomenteLeituraHero,
  };
}

function LyraHeroBlock({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  note,
}: LyraHeroBlockProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(237,233,254,0.34),rgba(224,231,255,0.24),rgba(255,255,255,0.98))] shadow-[0_24px_80px_-42px_rgba(22,21,48,0.35)]">
      <CardContent className="space-y-6 p-8 sm:p-10">
        <Badge className="w-fit rounded-full border-cosmic/20 bg-cosmic/10 px-4 py-1.5 text-cosmic">
          <Sparkles className="mr-2 h-3.5 w-3.5" />
          {eyebrow}
        </Badge>

        <div className="max-w-3xl space-y-4">
          <h2 className="text-balance font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          <p className="text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <a href={ctaHref}>
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
          <p className="text-sm leading-7 text-muted-foreground">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export const lyraHeroBlockConfig: ComponentConfig<LyraHeroBlockProps> = {
  label: 'Hero Lyra',
  fields: {
    dynamicSource: {
      type: 'select',
      label: 'Fonte dinâmica',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Sessão atual', value: 'session-profile' },
        { label: 'Assinatura atual', value: 'subscription-context' },
      ],
    },
    eyebrow: {
      type: 'text',
      label: 'Selo superior',
    },
    title: {
      type: 'text',
      label: 'Título principal',
    },
    description: {
      type: 'textarea',
      label: 'Descrição',
    },
    ctaLabel: {
      type: 'text',
      label: 'Rótulo do CTA',
    },
    ctaHref: {
      type: 'text',
      label: 'Link do CTA',
    },
    note: {
      type: 'text',
      label: 'Nota auxiliar',
    },
  },
  defaultProps: {
    dynamicSource: 'manual',
    eyebrow: 'Puck inicial da Lyra',
    title: 'Editor visual real, claro e pronto para evoluir.',
    description:
      'Este primeiro documento prova a integração do Puck com a Lyra em modo administrativo, com preview renderizado por Render e persistência real em MySQL.',
    ctaLabel: 'Abrir experiência pública',
    ctaHref: '/login',
    note: 'Base inicial do Lyra Customaze UI UX com Puck.',
  },
  resolveData: async (data, params) => {
    const props = (data.props ?? {}) as Partial<LyraHeroBlockProps>;
    const changed = params.changed as Partial<
      Record<keyof LyraHeroBlockProps, boolean>
    >;
    const dynamicSource =
      (props.dynamicSource as LyraHeroBlockProps['dynamicSource']) ?? 'manual';

    if (
      params.trigger !== 'load' &&
      params.trigger !== 'force' &&
      !deveResolverHero(changed)
    ) {
      return {
        props: {
          dynamicSource,
        },
        readOnly: dynamicSource === 'manual' ? {} : camposSomenteLeituraHero,
      };
    }

    if (
      params.trigger !== 'load' &&
      params.trigger !== 'force' &&
      (params.lastData?.props as Partial<LyraHeroBlockProps> | undefined)
        ?.dynamicSource === dynamicSource
    ) {
      return {
        props: {
          dynamicSource,
        },
        readOnly: dynamicSource === 'manual' ? {} : camposSomenteLeituraHero,
      };
    }

    return resolverPropsHeroDinamicos({
      dynamicSource,
      eyebrow: String(props.eyebrow ?? ''),
      title: String(props.title ?? ''),
      description: String(props.description ?? ''),
      ctaLabel: String(props.ctaLabel ?? ''),
      ctaHref: String(props.ctaHref ?? '#'),
      note: String(props.note ?? ''),
    });
  },
  render: (props: Record<string, unknown>) => (
    <LyraHeroBlock
      dynamicSource={
        (props.dynamicSource as LyraHeroBlockProps['dynamicSource']) ?? 'manual'
      }
      eyebrow={String(props.eyebrow ?? '')}
      title={String(props.title ?? '')}
      description={String(props.description ?? '')}
      ctaLabel={String(props.ctaLabel ?? '')}
      ctaHref={String(props.ctaHref ?? '#')}
      note={String(props.note ?? '')}
    />
  ),
};
