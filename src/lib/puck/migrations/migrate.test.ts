import { describe, expect, it } from 'vitest';

import type { LyraPuckData } from '@/lib/puck/types';

import { migrarDocumentoPuckLyra } from './migrate';

function documento(data: unknown) {
  return data as LyraPuckData;
}

describe('migração de documentos Puck legados', () => {
  it('preenche os campos novos sem sobrescrever os existentes', () => {
    const migrado = migrarDocumentoPuckLyra(
      documento({
        root: { props: {} },
        content: [
          { type: 'LyraHeroBlock', props: { id: 'h1', title: 'Olá' } },
          {
            type: 'LyraFixedColumnsBlock',
            props: { id: 'c1', ratio: '2-1' },
          },
        ],
      })
    );
    expect(migrado.content[0].props).toEqual({
      id: 'h1',
      title: 'Olá',
      dynamicSource: 'manual',
      ctaMode: 'manual-url',
    });
    expect(migrado.content[1].props).toEqual({
      id: 'c1',
      ratio: '2-1',
      gap: 'md',
      verticalAlign: 'stretch',
      surface: 'surface',
    });
  });

  it('garante rich text válido nos blocos de texto', () => {
    const migrado = migrarDocumentoPuckLyra(
      documento({
        root: { props: {} },
        content: [
          { type: 'LyraBodyTextBlock', props: { id: 't1', content: null } },
          {
            type: 'LyraFaqItemBlock',
            props: { id: 'f1', answer: '<p>Sim</p>' },
          },
        ],
      })
    );
    expect(migrado.content[0].props).toMatchObject({
      content: '',
      align: 'left',
      size: 'md',
      tone: 'default',
    });
    expect(migrado.content[1].props).toMatchObject({
      answer: '<p>Sim</p>',
      eyebrow: '',
    });
  });

  it('migra também as zonas e preserva tipos desconhecidos e a raiz', () => {
    const desconhecido = { type: 'BlocoExterno', props: { id: 'x', a: 1 } };
    const migrado = migrarDocumentoPuckLyra(
      documento({
        root: { props: { title: 'Página' } },
        content: [desconhecido],
        zones: {
          'c1:esquerda': [{ type: 'LyraMetricCardBlock', props: { id: 'm1' } }],
        },
      })
    );
    expect(migrado.root).toEqual({ props: { title: 'Página' } });
    expect(migrado.content[0]).toEqual(desconhecido);
    expect(migrado.zones?.['c1:esquerda']?.[0].props).toEqual({
      id: 'm1',
      dynamicSource: 'manual',
    });
  });

  it('é idempotente', () => {
    const original = documento({
      root: { props: {} },
      content: [{ type: 'LyraFluidGridBlock', props: { id: 'g1' } }],
    });
    const umaVez = migrarDocumentoPuckLyra(original);
    expect(migrarDocumentoPuckLyra(umaVez)).toEqual(umaVez);
  });
});
