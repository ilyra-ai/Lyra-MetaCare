import { describe, expect, it } from 'vitest';

import type { LyraPuckData } from '@/lib/puck/types';

import { limparDadosResolvidosPuck } from './dados-resolvidos';

function documento(data: unknown) {
  return data as LyraPuckData;
}

describe('limparDadosResolvidosPuck', () => {
  it('esvazia os textos resolvidos de blocos dinâmicos e o resumo da raiz', () => {
    const limpo = limparDadosResolvidosPuck(
      documento({
        root: {
          props: {
            title: 'Landing',
            resolvedContextSummary: 'admin@exemplo.com • perfil admin',
          },
        },
        content: [
          {
            type: 'LyraHeroBlock',
            props: {
              id: 'h1',
              dynamicSource: 'session-profile',
              eyebrow: 'Para você',
              title: 'Bom dia, Ana.',
              description: 'Texto da sessão',
              note: 'nota',
              ctaLabel: 'Entrar',
            },
          },
        ],
      })
    );
    expect(limpo.root.props?.resolvedContextSummary).toBe('');
    expect(limpo.root.props?.title).toBe('Landing');
    expect(limpo.content[0].props).toEqual({
      id: 'h1',
      dynamicSource: 'session-profile',
      eyebrow: '',
      title: '',
      description: '',
      note: '',
      ctaLabel: 'Entrar',
    });
  });

  it('preserva blocos manuais e limpa dinâmicos dentro de slots e zonas', () => {
    const manual = {
      type: 'LyraMetricCardBlock',
      props: { id: 'm1', dynamicSource: 'manual', value: '42' },
    };
    const limpo = limparDadosResolvidosPuck(
      documento({
        root: { props: {} },
        content: [
          {
            type: 'LyraSectionContainerBlock',
            props: {
              id: 's1',
              content: [
                manual,
                {
                  type: 'LyraMetricCardBlock',
                  props: {
                    id: 'm2',
                    dynamicSource: 'subscription-summary',
                    value: '12',
                    icon: 'activity',
                  },
                },
              ],
            },
          },
        ],
        zones: {
          'x:content': [
            {
              type: 'LyraHeroBlock',
              props: {
                id: 'h2',
                dynamicSource: 'session-profile',
                title: 'Oi',
              },
            },
          ],
        },
      })
    );
    const filhos = limpo.content[0].props.content as Array<{
      props: Record<string, unknown>;
    }>;
    expect(filhos[0]).toEqual(manual);
    expect(filhos[1].props).toMatchObject({ value: '', icon: 'activity' });
    expect(limpo.zones?.['x:content']?.[0].props.title).toBe('');
  });
});
