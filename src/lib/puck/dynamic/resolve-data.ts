import { resolveAllData, type Config } from '@puckeditor/core';

import type { LyraPuckConfig, LyraPuckData } from '@/lib/puck/types';

export async function aplicarResolveAllDataLyra(
  data: LyraPuckData,
  config: LyraPuckConfig | Config
) {
  return (await resolveAllData(data, config)) as LyraPuckData;
}
