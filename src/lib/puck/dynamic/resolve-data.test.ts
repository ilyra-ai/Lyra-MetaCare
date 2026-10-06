import { walkTree, type ComponentData, type Content } from '@puckeditor/core';
import { describe, expect, it } from 'vitest';

import { obterConfigPuckLyra } from '@/lib/puck/config/base';
import { getInitialPuckData } from '@/lib/puck/config/initial-data';
import { normalizarDadosPuck } from '@/lib/puck/data-utils';
import { migrarDadosPuckLyra } from '@/lib/puck/dynamic/resolve-data';
import {
  lyraPuckDocuments,
  type LyraPuckConfig,
  type LyraPuckData,
  type LyraPuckDocumentKey,
} from '@/lib/puck/types';

const chavesDosDocumentos = lyraPuckDocuments.map((doc) => doc.key);

// Conta todos os blocos do documento, inclusive os aninhados em slots.
function contarBlocosEmSlots(data: LyraPuckData, documentKey: string) {
  const config = obterConfigPuckLyra(documentKey as LyraPuckDocumentKey);
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

function camposSlot(config: LyraPuckConfig, tipo: string) {
  const campos = config.components[tipo]?.fields ?? {};
  return Object.entries(campos)
    .filter(([, campo]) => campo.type === 'slot')
    .map(([nome]) => nome);
}

/**
 * Converte um documento em slots para o formato legado de DropZones
 * (filhos em `zones["<id>:<slot>"]`), reproduzindo os documentos gravados
 * antes da migração para slots.
 */
function paraFormatoLegado(
  data: LyraPuckData,
  config: LyraPuckConfig
): LyraPuckData {
  const zones: Record<string, ComponentData[]> = {};
  const converter = (itens: Content): ComponentData[] =>
    itens.map((item) => {
      const props: Record<string, unknown> = { ...item.props };
      for (const slot of camposSlot(config, item.type)) {
        const filhos = (props[slot] as Content | undefined) ?? [];
        zones[`${String(props.id)}:${slot}`] = converter(filhos);
        delete props[slot];
      }
      return { ...item, props } as ComponentData;
    });
  const content = converter(data.content);
  return { ...data, content, zones };
}

describe('documentos iniciais do Puck', () => {
  it.each(chavesDosDocumentos)(
    'documento %s já nasce em slots nativos (sem zonas e sem migração pendente)',
    (documentKey) => {
      const inicial = getInitialPuckData(documentKey);
      expect(inicial.zones).toBeUndefined();
      expect(
        migrarDadosPuckLyra(inicial, obterConfigPuckLyra(documentKey))
      ).toEqual(inicial);
    }
  );

  it('preserva os 15 blocos da landing dentro dos slots', () => {
    // 2 na raiz + 6 na seção editorial + 2 + 2 nas colunas + 3 na grade.
    const inicial = getInitialPuckData('landing-home');
    expect(contarBlocosEmSlots(inicial, 'landing-home')).toBe(15);
  });
});

describe('migração de DropZones legadas para slots do Puck', () => {
  it.each(chavesDosDocumentos)(
    'documento legado %s volta exatamente ao formato em slots',
    (documentKey) => {
      const config = obterConfigPuckLyra(documentKey);
      const nativo = getInitialPuckData(documentKey);
      const legado = paraFormatoLegado(nativo, config);

      const migrado = migrarDadosPuckLyra(legado, config);

      expect(Object.keys(migrado.zones ?? {})).toEqual([]);
      expect(contarBlocosEmSlots(migrado, documentKey)).toBe(
        contarBlocosLegados(legado)
      );
      expect(migrado).toEqual(nativo);
    }
  );

  it('move os filhos da zona legada para o slot content do container', () => {
    const config = obterConfigPuckLyra('landing-home');
    const legado = paraFormatoLegado(
      getInitialPuckData('landing-home'),
      config
    );
    const filhosLegados =
      legado.zones?.['lyra-section-container-editorial:content'] ?? [];
    const migrado = migrarDadosPuckLyra(legado, config);
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
      paraFormatoLegado(getInitialPuckData('landing-home'), config),
      config
    );
    const duasVezes = migrarDadosPuckLyra(umaVez, config);

    expect(duasVezes).toEqual(umaVez);
  });
});

describe('normalizarDadosPuck', () => {
  it('não herda zonas do fallback quando o documento não tem zones', () => {
    const fallback = paraFormatoLegado(
      getInitialPuckData('landing-home'),
      obterConfigPuckLyra('landing-home')
    );
    const semZonas = { content: [], root: { props: {} } };

    const normalizado = normalizarDadosPuck(semZonas, fallback);

    expect(Object.keys(fallback.zones ?? {}).length).toBeGreaterThan(0);
    expect(normalizado.zones).toEqual({});
  });
});
