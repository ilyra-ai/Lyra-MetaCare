import type { ComponentConfig } from '@puckeditor/core';
import { ArrowUpRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  IconeDecorativo,
  juntarClasses,
  obterClasseTomHeading,
} from '@/lib/puck/config/components/helpers';
import { fetchListPlanos } from '@/lib/puck/data-sources/plans';
import { obterCacheDinamicoLyra } from '@/lib/puck/dynamic/cache';
import type {
  LyraExternalPlanData,
  LyraFeatureCardBlockProps,
} from '@/lib/puck/types';

/*
 * Fundo do ícone acompanha o tom do título: o coral do logo nos tons
 * cósmico (conteúdo astral/IA) e "coral", e o teal do logo nos demais.
 */
const classesIconePorTom: Record<LyraFeatureCardBlockProps['tone'], string> = {
  default: 'bg-sidebar-accent text-primary',
  cosmic: 'bg-cosmic-light text-cosmic',
  teal: 'bg-sidebar-accent text-primary',
  coral: 'bg-cosmic-light text-accent',
};

function LyraFeatureCardBlock({
  externalPlan,
  eyebrow,
  title,
  description,
  icon,
  tone,
  ctaLabel,
  ctaHref,
}: LyraFeatureCardBlockProps) {
  const seloExibido = externalPlan?.name ?? eyebrow;
  const descricaoExibida = externalPlan ? externalPlan.tagline : description;

  return (
    <Card className="h-full">
      <CardHeader className="gap-4">
        <div
          className={juntarClasses(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-md',
            classesIconePorTom[tone] ?? classesIconePorTom.default
          )}
        >
          <IconeDecorativo icone={icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="w-fit">
              {seloExibido}
            </Badge>
            {externalPlan ? (
              <Badge variant="outline" className="w-fit">
                {externalPlan.currencyCode}{' '}
                {externalPlan.monthlyPrice.toFixed(2)}
                /mês
              </Badge>
            ) : null}
          </div>
          <CardTitle
            className={juntarClasses(
              'break-words',
              obterClasseTomHeading(tone)
            )}
          >
            {title}
          </CardTitle>
          <CardDescription>{descricaoExibida}</CardDescription>
        </div>
      </CardHeader>
      <CardContent />
      {ctaLabel ? (
        <CardFooter>
          <Button asChild variant="ghost">
            <a href={ctaHref}>
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}

// Última falha ao listar os planos no seletor do editor, exibida no rodapé
// do seletor (o campo externo do Puck não tem estado de erro próprio).
let erroAoListarPlanos: string | null = null;

export const lyraFeatureCardBlockConfig = {
  label: 'Card de feature',
  fields: {
    externalPlan: {
      type: 'external',
      label: 'Plano vinculado (fonte externa)',
      placeholder: 'Selecione um plano do catálogo público...',
      fetchList: async () => {
        try {
          const planos = await fetchListPlanos();
          erroAoListarPlanos = null;
          return planos;
        } catch (error) {
          erroAoListarPlanos =
            error instanceof Error ? error.message : 'Falha desconhecida.';
          return [];
        }
      },
      renderFooter: ({ items }: { items: LyraExternalPlanData[] }) => (
        <p
          role={erroAoListarPlanos ? 'alert' : undefined}
          className="px-4 py-3 text-sm text-muted-foreground"
        >
          {erroAoListarPlanos
            ? `Não foi possível carregar os planos: ${erroAoListarPlanos}`
            : `${items.length} plano(s) no catálogo público.`}
        </p>
      ),
      getItemSummary: (item: LyraExternalPlanData) =>
        `${item.name}: ${item.tagline}`,
      mapProp: (item: LyraExternalPlanData) => item,
    },
    eyebrow: {
      type: 'text',
      label: 'Selo',
    },
    title: {
      type: 'text',
      label: 'Título',
    },
    description: {
      type: 'textarea',
      label: 'Descrição',
    },
    icon: {
      type: 'select',
      label: 'Ícone',
      options: [
        { label: 'Sparkles', value: 'sparkles' },
        { label: 'Coração', value: 'heart' },
        { label: 'CPU', value: 'cpu' },
        { label: 'Calendário', value: 'calendar' },
        { label: 'Escudo', value: 'shield' },
        { label: 'Mensagem', value: 'message' },
        { label: 'Atividade', value: 'activity' },
      ],
    },
    tone: {
      type: 'select',
      label: 'Tom do título',
      options: [
        { label: 'Padrão', value: 'default' },
        { label: 'Cósmico', value: 'cosmic' },
        { label: 'Teal', value: 'teal' },
        { label: 'Coral', value: 'coral' },
      ],
    },
    ctaLabel: {
      type: 'text',
      label: 'CTA',
    },
    ctaHref: {
      type: 'text',
      label: 'Link do CTA',
    },
  },
  defaultProps: {
    externalPlan: undefined,
    eyebrow: 'Recurso',
    title: 'Um benefício claro em poucas palavras',
    description:
      'Conte em uma frase como este recurso ajuda a pessoa no dia a dia.',
    icon: 'sparkles',
    tone: 'cosmic',
    ctaLabel: 'Saiba mais',
    ctaHref: '/',
  },
  // O plano vinculado era uma cópia tirada no momento da escolha: preço e
  // descrição mudados depois no catálogo não chegavam ao card. Agora cada
  // exibição relê o plano pela chave; plano retirado do catálogo desfaz o
  // vínculo, e uma falha de rede mantém a última cópia conhecida.
  resolveData: async (data) => {
    const vinculado = data.props.externalPlan as
      LyraExternalPlanData | undefined;
    if (!vinculado?.key) {
      return { props: {} };
    }
    try {
      // Cache curto compartilhado: vários cards na página fazem uma só busca.
      const planos = await obterCacheDinamicoLyra(
        'lyra-puck:catalogo-de-planos',
        fetchListPlanos
      );
      const atual = planos.find((plano) => plano.key === vinculado.key);
      return { props: { externalPlan: atual } };
    } catch {
      return { props: {} };
    }
  },
  render: (props: Record<string, unknown>) => (
    <LyraFeatureCardBlock
      externalPlan={
        (props.externalPlan as LyraFeatureCardBlockProps['externalPlan']) ??
        undefined
      }
      eyebrow={String(props.eyebrow ?? '')}
      title={String(props.title ?? '')}
      description={String(props.description ?? '')}
      icon={(props.icon as LyraFeatureCardBlockProps['icon']) ?? 'sparkles'}
      tone={(props.tone as LyraFeatureCardBlockProps['tone']) ?? 'default'}
      ctaLabel={String(props.ctaLabel ?? '')}
      ctaHref={String(props.ctaHref ?? '#')}
    />
  ),
} satisfies ComponentConfig<LyraFeatureCardBlockProps>;
