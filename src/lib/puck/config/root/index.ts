import type { RootConfig } from '@puckeditor/core';

import { lyraAppRootConfig } from '@/lib/puck/config/root/app-root';
import { lyraLandingRootConfig } from '@/lib/puck/config/root/landing-root';
import { lyraLoginRootConfig } from '@/lib/puck/config/root/login-root';
import {
  LyraPuckDocumentKey,
  LyraPuckRootProps,
  obterDocumentoPuckLyra,
} from '@/lib/puck/types';

type LyraPuckRootConfig = NonNullable<RootConfig<LyraPuckRootProps>>;

export function obterRootConfigLyra(
  documentKey: LyraPuckDocumentKey
): LyraPuckRootConfig {
  const doc = obterDocumentoPuckLyra(documentKey);

  if (!doc) return lyraLandingRootConfig;

  switch (doc.surfaceKey) {
    case 'login':
      return lyraLoginRootConfig;
    case 'app-shell':
    case 'patient-portal':
    case 'admin-panel':
    case 'billing':
      return lyraAppRootConfig;
    case 'landing':
    default:
      return lyraLandingRootConfig;
  }
}
