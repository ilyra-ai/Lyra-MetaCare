import { lyraPuckComponents } from '@/lib/puck/config/components';
import { obterRootConfigLyra } from '@/lib/puck/config/root';
import type { LyraPuckConfig, LyraPuckDocumentKey } from '@/lib/puck/types';

export function obterConfigPuckLyra(
  documentKey: LyraPuckDocumentKey
): LyraPuckConfig {
  return {
    components: lyraPuckComponents,
    root: obterRootConfigLyra(documentKey),
  };
}

export const lyraPuckConfig = obterConfigPuckLyra('landing-home');
