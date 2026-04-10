import type { Fields } from '@puckeditor/core';

import { obterPerfilDinamicoLyra } from '@/lib/puck/dynamic/profile';
import {
  obterOpcoesTemaPorSuperficie,
  obterRotuloSuperficie,
} from '@/lib/puck/fields/dynamic/shared';
import type { LyraPuckRootProps } from '@/lib/puck/types';

export function criarCamposBaseRootLyra(): Fields<LyraPuckRootProps> {
  return {
    title: {
      type: 'text',
      label: 'Rótulo interno da superfície',
    },
    dynamicSource: {
      type: 'select',
      label: 'Fonte dinâmica do contexto',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Sessão atual', value: 'session-context' },
      ],
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
      options: obterOpcoesTemaPorSuperficie('landing'),
    },
    visibilityRules: {
      type: 'textarea',
      label: 'Regras de visibilidade',
    },
    resolvedContextSummary: {
      type: 'textarea',
      label: 'Resumo dinâmico resolvido',
      visible: false,
    },
  };
}

export async function resolverCamposRootLyra(
  props: Partial<LyraPuckRootProps>
): Promise<Fields<LyraPuckRootProps>> {
  const fields = criarCamposBaseRootLyra();
  const dynamicSource = props.dynamicSource ?? 'manual';
  const surfaceKey = props.surfaceKey ?? 'landing';
  const rotuloSuperficie = obterRotuloSuperficie(surfaceKey);
  const perfil =
    dynamicSource === 'session-context'
      ? await obterPerfilDinamicoLyra()
      : null;
  const campoTema = fields.themeVariant;
  const campoResumo = fields.resolvedContextSummary;

  const campoTemaResolvido =
    campoTema.type === 'select'
      ? {
          ...campoTema,
          label:
            surfaceKey === 'app-shell'
              ? 'Tema do shell autenticado'
              : 'Tema da superfície',
          options: obterOpcoesTemaPorSuperficie(surfaceKey),
        }
      : campoTema;

  const campoResumoResolvido =
    campoResumo?.type === 'textarea'
      ? {
          ...campoResumo,
          visible: dynamicSource === 'session-context',
          label: perfil
            ? `Resumo dinâmico para ${perfil.primeiroNome ?? perfil.nomeExibicao}`
            : 'Resumo dinâmico resolvido',
        }
      : campoResumo;

  return {
    ...fields,
    surfaceTitle: {
      ...fields.surfaceTitle,
      label: `Título da ${rotuloSuperficie}`,
    },
    surfaceDescription: {
      ...fields.surfaceDescription,
      label: `Descrição estrutural da ${rotuloSuperficie}`,
    },
    themeVariant: campoTemaResolvido,
    visibilityRules: {
      ...fields.visibilityRules,
      label:
        surfaceKey === 'app-shell'
          ? 'Regras de visibilidade do shell'
          : 'Regras de visibilidade pública',
    },
    resolvedContextSummary: campoResumoResolvido,
  };
}
