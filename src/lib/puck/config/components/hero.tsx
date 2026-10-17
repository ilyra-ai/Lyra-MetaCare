import type { ComponentConfig } from '@puckeditor/core';
import { ArrowUpRight, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { obterResumoAssinaturaLyra } from '@/lib/puck/dynamic/metrics';
import { obterPerfilDinamicoLyra } from '@/lib/puck/dynamic/profile';
import {
  criarCamposBaseHeroLyra,
  resolverCamposHeroLyra,
} from '@/lib/puck/fields/dynamic';
import {
  obterDocumentoPuckLyra,
  type LyraHeroBlockProps,
} from '@/lib/puck/types';

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
  const ctaMode = props.ctaMode ?? 'manual-url';
  const ctaDocumentKey = props.ctaDocumentKey ?? 'login-experience';

  if (dynamicSource === 'manual') {
    return {
      props: {
        dynamicSource,
        ctaMode,
        ctaDocumentKey,
      },
    };
  }

  // Textos montados para quem está vendo a página (resolvidos de novo a cada
  // exibição). Não incluem e-mail nem papel da conta (tarefa 53): o
  // documento publicado é público, e o editor salva sem estes textos
  // (`limparDadosResolvidosPuck`).
  const semSessao = {
    props: {
      dynamicSource,
      ctaMode,
      ctaDocumentKey,
      eyebrow: 'Lyra MetaCare',
      title: 'Boas-vindas à Lyra.',
      description:
        'Entre na sua conta para ver uma mensagem feita para o seu dia.',
      note: '',
    },
    readOnly: camposSomenteLeituraHero,
  };

  let perfil: Awaited<ReturnType<typeof obterPerfilDinamicoLyra>>;
  try {
    perfil = await obterPerfilDinamicoLyra();
  } catch (erro) {
    // Antes engolido sem registro (tarefa 58).
    console.error('Puck/hero: falha ao ler o perfil da sessão:', erro);
    return semSessao;
  }

  if (!perfil.usuarioId) {
    return semSessao;
  }

  const primeiroNome = perfil.primeiroNome ?? perfil.nomeExibicao;

  if (dynamicSource === 'session-profile') {
    return {
      props: {
        dynamicSource,
        ctaMode,
        ctaDocumentKey,
        eyebrow: 'Para você',
        title: `${perfil.saudacao}, ${primeiroNome}.`,
        description:
          'Que bom ter você por aqui. O seu dia, o seu plano e a Lyra estão a um clique.',
        note: '',
      },
      readOnly: camposSomenteLeituraHero,
    };
  }

  try {
    const assinatura = await obterResumoAssinaturaLyra();

    return {
      props: {
        dynamicSource,
        ctaMode,
        ctaDocumentKey,
        eyebrow: `Plano ${assinatura.planoNome}`,
        title: `${perfil.saudacao}, ${primeiroNome}.`,
        description: assinatura.descricaoCurta,
        note: assinatura.tendenciaRotulo,
      },
      readOnly: camposSomenteLeituraHero,
    };
  } catch (erro) {
    console.error('Puck/hero: falha ao ler o plano da pessoa:', erro);
    // Sem prometer uma recarga que não acontece (antes: "aparecem aqui em
    // instantes").
    return {
      props: {
        dynamicSource,
        ctaMode,
        ctaDocumentKey,
        eyebrow: 'Para você',
        title: `${perfil.saudacao}, ${primeiroNome}.`,
        description:
          'Não foi possível carregar os dados do seu plano agora. Recarregue a página para tentar de novo.',
        note: '',
      },
      readOnly: camposSomenteLeituraHero,
    };
  }
}

function LyraHeroBlock({
  eyebrow,
  title,
  description,
  ctaMode,
  ctaLabel,
  ctaHref,
  ctaDocumentKey,
  note,
}: LyraHeroBlockProps) {
  const hrefResolvido =
    ctaMode === 'surface-route'
      ? (obterDocumentoPuckLyra(ctaDocumentKey)?.publicRoute ?? ctaHref)
      : ctaHref;

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <Badge variant="default" className="w-fit max-w-full">
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{eyebrow}</span>
        </Badge>

        <div className="max-w-3xl space-y-3">
          <h2 className="text-balance break-words font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <a href={hrefResolvido}>
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          {note ? (
            <p className="min-w-0 text-sm leading-6 text-muted-foreground">
              {note}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export const lyraHeroBlockConfig: ComponentConfig<LyraHeroBlockProps> = {
  label: 'Hero Lyra',
  fields: criarCamposBaseHeroLyra(),
  defaultProps: {
    dynamicSource: 'manual',
    eyebrow: 'Novidade',
    title: 'Um título curto e claro para este espaço',
    description:
      'Explique em uma ou duas frases o que a pessoa encontra aqui e por que vale a pena.',
    ctaMode: 'manual-url',
    ctaLabel: 'Saiba mais',
    ctaHref: '/login',
    ctaDocumentKey: 'login-experience',
    note: 'Leva menos de um minuto.',
  },
  resolveFields: (data, params) => {
    const dynamicSource =
      (data.props?.dynamicSource as LyraHeroBlockProps['dynamicSource']) ??
      'manual';
    const ctaMode =
      (data.props?.ctaMode as LyraHeroBlockProps['ctaMode']) ?? 'manual-url';

    if (
      !params.changed.dynamicSource &&
      !params.changed.ctaMode &&
      !params.changed.ctaLabel &&
      !params.changed.ctaHref &&
      !params.changed.ctaDocumentKey &&
      params.lastFields
    ) {
      return params.lastFields;
    }

    return resolverCamposHeroLyra({
      dynamicSource,
      ctaMode,
      ctaLabel: String(data.props?.ctaLabel ?? ''),
      ctaHref: String(data.props?.ctaHref ?? ''),
      ctaDocumentKey:
        (data.props?.ctaDocumentKey as LyraHeroBlockProps['ctaDocumentKey']) ??
        'login-experience',
      eyebrow: String(data.props?.eyebrow ?? ''),
      title: String(data.props?.title ?? ''),
      description: String(data.props?.description ?? ''),
      note: String(data.props?.note ?? ''),
    });
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
      ctaMode: (props.ctaMode as LyraHeroBlockProps['ctaMode']) ?? 'manual-url',
      ctaLabel: String(props.ctaLabel ?? ''),
      ctaHref: String(props.ctaHref ?? '#'),
      ctaDocumentKey:
        (props.ctaDocumentKey as LyraHeroBlockProps['ctaDocumentKey']) ??
        'login-experience',
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
      ctaMode={(props.ctaMode as LyraHeroBlockProps['ctaMode']) ?? 'manual-url'}
      ctaLabel={String(props.ctaLabel ?? '')}
      ctaHref={String(props.ctaHref ?? '#')}
      ctaDocumentKey={
        (props.ctaDocumentKey as LyraHeroBlockProps['ctaDocumentKey']) ??
        'login-experience'
      }
      note={String(props.note ?? '')}
    />
  ),
};
