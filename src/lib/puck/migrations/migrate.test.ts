import { describe, expect, it } from 'vitest';

import type { LyraPuckData } from '@/lib/puck/types';

import { obterDocumentoDeDemonstracao } from './documentos-de-demonstracao';
import {
  migrarDocumentoPuckLyra,
  removerBlocosDeDemonstracao,
} from './migrate';

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

  it('migra os blocos aninhados nos slots dos contêineres', () => {
    const migrado = migrarDocumentoPuckLyra(
      documento({
        root: { props: {} },
        content: [
          {
            type: 'LyraFixedColumnsBlock',
            props: {
              id: 'c1',
              leftColumn: [{ type: 'LyraHeroBlock', props: { id: 'h1' } }],
              rightColumn: [
                {
                  type: 'LyraSectionContainerBlock',
                  props: {
                    id: 's1',
                    content: [
                      { type: 'LyraMetricCardBlock', props: { id: 'm1' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      })
    );
    const colunas = migrado.content[0].props as Record<string, unknown>;
    const esquerda = colunas.leftColumn as Array<{
      props: Record<string, unknown>;
    }>;
    const direita = colunas.rightColumn as Array<{
      props: Record<string, unknown>;
    }>;
    expect(esquerda[0].props).toMatchObject({
      dynamicSource: 'manual',
      ctaMode: 'manual-url',
    });
    expect(direita[0].props).toMatchObject({ surface: 'surface' });
    const internos = direita[0].props.content as Array<{
      props: Record<string, unknown>;
    }>;
    expect(internos[0].props).toEqual({ id: 'm1', dynamicSource: 'manual' });
  });
});

describe('retirada dos blocos de demonstração', () => {
  it('retira a demonstração intocada em slots e em zonas legadas', () => {
    const demonstracao = obterDocumentoDeDemonstracao('landing-home');
    expect(demonstracao?.content.length).toBe(2);

    const emSlots = removerBlocosDeDemonstracao(
      documento(demonstracao),
      'landing-home'
    );
    expect(emSlots.content).toEqual([]);

    // Formato legado: filhos do contêiner em `zones`.
    const secao = demonstracao!.content[1];
    const filhos = (secao.props.content ?? []) as unknown[];
    const legado = documento({
      root: { props: {} },
      content: [
        demonstracao!.content[0],
        { ...secao, props: { ...secao.props, content: undefined } },
      ],
      zones: { [`${String(secao.props.id)}:content`]: filhos },
    });
    const semLegado = removerBlocosDeDemonstracao(legado, 'landing-home');
    expect(semLegado.content).toEqual([]);
    expect(semLegado.zones).toEqual({});
  });

  it('preserva um bloco de demonstração editado pelo administrador', () => {
    const demonstracao = obterDocumentoDeDemonstracao('landing-home')!;
    const hero = demonstracao.content[0];
    const editado = documento({
      ...demonstracao,
      content: [
        { ...hero, props: { ...hero.props, title: 'Título escrito por mim' } },
        demonstracao.content[1],
      ],
    });
    const resultado = removerBlocosDeDemonstracao(editado, 'landing-home');
    expect(resultado.content.map((bloco) => bloco.props.title)).toEqual([
      'Título escrito por mim',
    ]);
  });

  it('não mexe em documentos sem demonstração nem em blocos com outro id', () => {
    const proprio = documento({
      root: { props: {} },
      content: [{ type: 'LyraHeroBlock', props: { id: 'meu-hero' } }],
    });
    expect(removerBlocosDeDemonstracao(proprio, 'goals')).toBe(proprio);
    expect(removerBlocosDeDemonstracao(proprio, 'landing-home')).toBe(proprio);
  });

  it('migrarDocumentoPuckLyra com a chave já entrega o documento limpo', () => {
    const demonstracao = obterDocumentoDeDemonstracao('login-experience')!;
    expect(
      migrarDocumentoPuckLyra(documento(demonstracao), 'login-experience')
        .content
    ).toEqual([]);
  });
});
