import { migrate, resolveAllData, type Config } from '@puckeditor/core';

import type { LyraPuckConfig, LyraPuckData } from '@/lib/puck/types';

/**
 * Converte dados no formato legado de DropZones (`zones` com chaves
 * `"<id>:<zona>"`) para slot fields, usando a migração oficial do Puck.
 *
 * Os componentes de layout da Lyra declaram `content` (e colunas) como
 * `type: 'slot'`. Quando os blocos filhos ficavam em `zones`, o editor tratava
 * a mesma área como DropZone depreciada e slot ao mesmo tempo, entrando em
 * laço de montagem e desmontagem (React #185). Documentos já no formato de
 * slots passam inalterados.
 */
export function migrarDadosPuckLyra(
  data: LyraPuckData,
  config: LyraPuckConfig | Config
): LyraPuckData {
  return migrate(data, config) as LyraPuckData;
}

export async function aplicarResolveAllDataLyra(
  data: LyraPuckData,
  config: LyraPuckConfig | Config
) {
  return (await resolveAllData(
    migrarDadosPuckLyra(data, config),
    config
  )) as LyraPuckData;
}
