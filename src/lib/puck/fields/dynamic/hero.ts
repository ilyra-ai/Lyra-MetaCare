import type { Fields } from '@puckeditor/core';

import type { LyraHeroBlockProps } from '@/lib/puck/types';
import { obterOpcoesDestinoPublicoLyra } from '@/lib/puck/fields/dynamic/shared';

export function criarCamposBaseHeroLyra(): Fields<LyraHeroBlockProps> {
  return {
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
    ctaMode: {
      type: 'radio',
      label: 'Origem do destino do CTA',
      options: [
        { label: 'Link manual', value: 'manual-url' },
        { label: 'Tela pública da Lyra', value: 'surface-route' },
      ],
    },
    ctaLabel: {
      type: 'text',
      label: 'Rótulo do CTA',
    },
    ctaHref: {
      type: 'text',
      label: 'Link manual do CTA',
    },
    ctaDocumentKey: {
      type: 'select',
      label: 'Tela pública da Lyra',
      options: obterOpcoesDestinoPublicoLyra(),
      visible: false,
    },
    note: {
      type: 'text',
      label: 'Nota auxiliar',
    },
  };
}

export function resolverCamposHeroLyra(
  props: Partial<LyraHeroBlockProps>
): Fields<LyraHeroBlockProps> {
  const fields = criarCamposBaseHeroLyra();
  const dynamicSource = props.dynamicSource ?? 'manual';
  const ctaMode = props.ctaMode ?? 'manual-url';
  const modoManual = dynamicSource === 'manual';

  return {
    ...fields,
    eyebrow: {
      ...fields.eyebrow,
      visible: modoManual,
      label: modoManual ? 'Selo superior' : 'Selo derivado da fonte dinâmica',
    },
    title: {
      ...fields.title,
      visible: modoManual,
      label: modoManual ? 'Título principal' : 'Título dinâmico da sessão',
    },
    description: {
      ...fields.description,
      visible: modoManual,
      label: modoManual ? 'Descrição' : 'Descrição dinâmica da sessão',
    },
    ctaMode: {
      ...fields.ctaMode,
      label: modoManual
        ? 'Origem do destino do CTA'
        : 'Destino do CTA contextual',
    },
    ctaLabel: {
      ...fields.ctaLabel,
      label: modoManual ? 'Rótulo do CTA' : 'Rótulo do CTA contextual',
    },
    ctaHref: {
      ...fields.ctaHref,
      visible: ctaMode === 'manual-url',
    },
    ctaDocumentKey: {
      ...fields.ctaDocumentKey,
      visible: ctaMode === 'surface-route',
    },
    note: {
      ...fields.note,
      visible: modoManual,
      label: modoManual ? 'Nota auxiliar' : 'Nota dinâmica da sessão',
    },
  };
}
