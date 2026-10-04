import { walkTree, type Content } from '@puckeditor/core';
import { describe, expect, it } from 'vitest';

import { obterConfigPuckLyra } from '@/lib/puck/config/base';
import { getInitialPuckData } from '@/lib/puck/config/initial-data';
import { normalizarDadosPuck } from '@/lib/puck/data-utils';
import { migrarDadosPuckLyra } from '@/lib/puck/dynamic/resolve-data';
import { lyraPuckDocuments, type LyraPuckData } from '@/lib/puck/types';

// Conta todos os blocos do documento, inclusive os aninhados em slots.
function contarBlocosEmSlots(data: LyraPuckData, documentKey: string) {
  const config = obterConfigPuckLyra(
    documentKey as (typeof lyraPuckDocuments)[number]['key']
  );
  let total = 0;
  walkTree(data, config, (content: Content) => {
    total += content.length;
  });
  return total;
}

function contarBlocosLegados(data: LyraPuckData) {
  return (
    data.content.length +
    Object.values(data.zones ?? {}).reduce(
      (soma, itens) => soma + itens.length,
      0
    )
  );
}

describe('migração de DropZones legadas para slots do Puck', () => {
  it.each(lyraPuckDocuments.map((doc) => doc.key))(
    'documento %s fica sem zonas e preserva todos os blocos',
    (documentKey) => {
      const legado = getInitialPuckData(documentKey);
      const migrado = migrarDadosPuckLyra(
        legado,
        obterConfigPuckLyra(documentKey)
      );

      expect(Object.keys(migrado.zones ?? {})).toEqual([]);
      expect(contarBlocosEmSlots(migrado, documentKey)).toBe(
        contarBlocosLegados(legado)
      );
    }
  );

  it('move os filhos da zona legada para o slot content do container', () => {
    const legado = getInitialPuckData('landing-home');
    const filhosLegados =
      legado.zones?.['lyra-section-container-editorial:content'] ?? [];
    const migrado = migrarDadosPuckLyra(
      legado,
      obterConfigPuckLyra('landing-home')
    );
    const container = migrado.content.find(
      (item) => item.props.id === 'lyra-section-container-editorial'
    );

    expect(filhosLegados.length).toBeGreaterThan(0);
    expect(
      (container?.props.content as Content).map((item) => item.props.id)
    ).toEqual(filhosLegados.map((item) => item.props.id));
  });

  it('é idempotente para documentos já em slots', () => {
    const config = obterConfigPuckLyra('landing-home');
    const umaVez = migrarDadosPuckLyra(
      getInitialPuckData('landing-home'),
      config
    );
    const duasVezes = migrarDadosPuckLyra(umaVez, config);

    expect(duasVezes).toEqual(umaVez);
  });
});

describe('normalizarDadosPuck', () => {
  it('não herda zonas do fallback quando o documento não tem zones', () => {
    const fallback = getInitialPuckData('landing-home');
    const semZonas = { content: [], root: { props: {} } };

    const normalizado = normalizarDadosPuck(semZonas, fallback);

    expect(Object.keys(fallback.zones ?? {}).length).toBeGreaterThan(0);
    expect(normalizado.zones).toEqual({});
  });
});
