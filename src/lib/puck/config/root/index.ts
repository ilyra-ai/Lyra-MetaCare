import type { RootConfig } from '@puckeditor/core';

import { lyraAppRootConfig } from '@/lib/puck/config/root/app-root';
import { lyraLandingRootConfig } from '@/lib/puck/config/root/landing-root';
import { lyraLoginRootConfig } from '@/lib/puck/config/root/login-root';
import type { LyraPuckDocumentKey, LyraPuckRootProps } from '@/lib/puck/types';

type LyraPuckRootConfig = NonNullable<RootConfig<LyraPuckRootProps>>;

const rootConfigPorDocumento: Record<LyraPuckDocumentKey, LyraPuckRootConfig> =
  {
    'landing-home': lyraLandingRootConfig,
    'login-experience': lyraLoginRootConfig,
    'app-shell': lyraAppRootConfig,
  };

export function obterRootConfigLyra(
  documentKey: LyraPuckDocumentKey
): LyraPuckRootConfig {
  return rootConfigPorDocumento[documentKey] ?? lyraLandingRootConfig;
}
