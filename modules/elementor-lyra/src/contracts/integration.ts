export type ElementorLyraSupportedProject = 'nextjs-app-router-typescript';

export type ElementorLyraSurfaceScope =
  | 'public-page'
  | 'auth-page'
  | 'internal-page'
  | 'layout'
  | 'template';

export interface ElementorLyraEditableZone {
  key: string;
  label: string;
  description: string;
  scope: ElementorLyraSurfaceScope;
  supportsChildren: boolean;
  supportsReorder: boolean;
  supportsVisibilityToggle: boolean;
}

export interface ElementorLyraEditableSurface {
  key: string;
  label: string;
  description: string;
  route: string;
  scope: ElementorLyraSurfaceScope;
  zones: ElementorLyraEditableZone[];
  adminOnly: boolean;
}

export interface ElementorLyraConsumerContract {
  moduleId: string;
  moduleVersion: string;
  supportedProject: ElementorLyraSupportedProject;
  sourceRoot: string;
  editableSurfaces: ElementorLyraEditableSurface[];
  adminRouteBase: string;
  publicReadApiBase: string;
  adminReadApiBase: string;
  storageDriver: 'mysql-json';
  adminRoleKeys: string[];
}

export interface ElementorLyraInstallAction {
  kind: 'create' | 'update' | 'skip' | 'validate';
  path: string;
  details: string;
}

export interface ElementorLyraInstallReport {
  moduleId: string;
  moduleVersion: string;
  supportedProject: ElementorLyraSupportedProject;
  installedAt: string;
  targetRoot: string;
  sourceRoot: string;
  actions: ElementorLyraInstallAction[];
  warnings: string[];
}
