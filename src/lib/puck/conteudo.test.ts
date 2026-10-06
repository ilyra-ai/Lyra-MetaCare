import { describe, expect, it } from 'vitest';

import { getInitialPuckData } from '@/lib/puck/config/initial-data';
import { documentoPuckTemBlocos } from '@/lib/puck/conteudo';
import { normalizarDadosPuck } from '@/lib/puck/data-utils';

describe('documentoPuckTemBlocos', () => {
  it('documento de página sem blocos publicados não é exibido', () => {
    const fallback = getInitialPuckData('goals');
    expect(documentoPuckTemBlocos(normalizarDadosPuck(null, fallback))).toBe(
      false
    );
    expect(
      documentoPuckTemBlocos(
        normalizarDadosPuck(
          { content: [], root: { props: { title: 'Metas' } } },
          fallback
        )
      )
    ).toBe(false);
  });

  it('documento com blocos na raiz ou em zonas legadas é exibido', () => {
    const fallback = getInitialPuckData('goals');
    const bloco = {
      type: 'LyraHeadingBlock',
      props: { id: 'titulo', children: 'Olá' },
    };
    expect(
      documentoPuckTemBlocos(
        normalizarDadosPuck({ content: [bloco], root: { props: {} } }, fallback)
      )
    ).toBe(true);
    expect(
      documentoPuckTemBlocos(
        normalizarDadosPuck(
          { content: [], zones: { 'x:content': [bloco] }, root: { props: {} } },
          fallback
        )
      )
    ).toBe(true);
    expect(documentoPuckTemBlocos(getInitialPuckData('landing-home'))).toBe(
      true
    );
  });
});
