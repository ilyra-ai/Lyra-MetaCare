import type { Permissions } from '@puckeditor/core';

import type { LyraPuckDocumentKey } from '@/lib/puck/types';

type LyraPuckPermissions = Partial<Permissions>;

/**
 * Permissões globais do editor Puck por superfície Lyra.
 * - landing-home: todas as operações habilitadas (superfície editorial livre)
 * - login-experience: inserção livre, duplicação e deleção controladas
 * - app-shell: inserção bloqueada (layout estrutural fixo)
 */
const landingPermissions: LyraPuckPermissions = {
  drag: true,
  duplicate: true,
  delete: true,
  edit: true,
  insert: true,
};

const loginPermissions: LyraPuckPermissions = {
  drag: true,
  duplicate: true,
  delete: true,
  edit: true,
  insert: true,
};

const appShellPermissions: LyraPuckPermissions = {
  drag: true,
  duplicate: false,
  delete: false,
  edit: true,
  insert: false,
};

export function obterPermissoesPuckLyra(
  documentKey: LyraPuckDocumentKey
): LyraPuckPermissions {
  if (documentKey === 'app-shell') return appShellPermissions;
  if (documentKey === 'login-experience') return loginPermissions;

  return landingPermissions;
}
