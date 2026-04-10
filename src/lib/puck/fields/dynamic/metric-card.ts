import type { Fields } from '@puckeditor/core';

import { obterOpcoesIconePorTendencia } from '@/lib/puck/fields/dynamic/shared';
import type { LyraMetricCardBlockProps } from '@/lib/puck/types';

export function criarCamposBaseMetricCardLyra(): Fields<LyraMetricCardBlockProps> {
  return {
    dynamicSource: {
      type: 'select',
      label: 'Fonte dinâmica',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Resumo da assinatura', value: 'subscription-summary' },
      ],
    },
    eyebrow: {
      type: 'text',
      label: 'Sobretítulo',
    },
    value: {
      type: 'text',
      label: 'Valor principal',
    },
    unit: {
      type: 'text',
      label: 'Unidade',
    },
    description: {
      type: 'textarea',
      label: 'Descrição',
    },
    trendLabel: {
      type: 'text',
      label: 'Texto de tendência',
    },
    trendDirection: {
      type: 'select',
      label: 'Direção da tendência',
      options: [
        { label: 'Alta', value: 'up' },
        { label: 'Queda', value: 'down' },
        { label: 'Estável', value: 'neutral' },
      ],
    },
    badgeLabel: {
      type: 'text',
      label: 'Badge',
    },
    icon: {
      type: 'select',
      label: 'Ícone',
      options: obterOpcoesIconePorTendencia('up'),
    },
  };
}

export function resolverCamposMetricCardLyra(
  props: Partial<LyraMetricCardBlockProps>
): Fields<LyraMetricCardBlockProps> {
  const fields = criarCamposBaseMetricCardLyra();
  const dynamicSource = props.dynamicSource ?? 'manual';
  const trendDirection = props.trendDirection ?? 'neutral';
  const modoManual = dynamicSource === 'manual';
  const campoIcone = fields.icon;

  const campoIconeResolvido =
    campoIcone.type === 'select'
      ? {
          ...campoIcone,
          visible: modoManual,
          options: obterOpcoesIconePorTendencia(trendDirection),
        }
      : campoIcone;

  return {
    ...fields,
    eyebrow: {
      ...fields.eyebrow,
      visible: modoManual,
    },
    value: {
      ...fields.value,
      visible: modoManual,
    },
    unit: {
      ...fields.unit,
      visible: modoManual,
    },
    description: {
      ...fields.description,
      visible: modoManual,
      label: modoManual ? 'Descrição' : 'Descrição resolvida pela assinatura',
    },
    trendLabel: {
      ...fields.trendLabel,
      visible: modoManual && trendDirection !== 'neutral',
      label:
        trendDirection === 'neutral'
          ? 'Texto de tendência oculto em estabilidade'
          : 'Texto de tendência',
    },
    trendDirection: {
      ...fields.trendDirection,
      visible: modoManual,
    },
    badgeLabel: {
      ...fields.badgeLabel,
      visible: modoManual,
      label:
        trendDirection === 'neutral'
          ? 'Badge de estabilidade'
          : 'Badge de apoio',
    },
    icon: campoIconeResolvido,
  };
}
