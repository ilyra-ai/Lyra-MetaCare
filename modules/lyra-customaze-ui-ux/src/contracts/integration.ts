export type LyraCustomazeSupportedProject = 'nextjs-app-router-typescript';

export type LyraCustomazeSurfaceScope =
  | 'public-page'
  | 'auth-page'
  | 'internal-page'
  | 'layout'
  | 'template';

export interface LyraCustomazeEditableZone {
  key: string;
  label: string;
  description: string;
  scope: LyraCustomazeSurfaceScope;
  supportsChildren: boolean;
  supportsReorder: boolean;
  supportsVisibilityToggle: boolean;
}

export interface LyraCustomazeEditableSurface {
  key: string;
  label: string;
  description: string;
  route: string;
  scope: LyraCustomazeSurfaceScope;
  zones: LyraCustomazeEditableZone[];
  adminOnly: boolean;
}

export interface LyraCustomazeConsumerContract {
  moduleId: string;
  moduleVersion: string;
  supportedProject: LyraCustomazeSupportedProject;
  sourceRoot: string;
  editableSurfaces: LyraCustomazeEditableSurface[];
  adminRouteBase: string;
  publicReadApiBase: string;
  adminReadApiBase: string;
  storageDriver: 'mysql-json';
  adminRoleKeys: string[];
}

export interface LyraCustomazeInstallAction {
  kind: 'create' | 'update' | 'skip' | 'validate';
  path: string;
  details: string;
}

export interface LyraCustomazeInstallReport {
  moduleId: string;
  moduleVersion: string;
  supportedProject: LyraCustomazeSupportedProject;
  installedAt: string;
  targetRoot: string;
  sourceRoot: string;
  actions: LyraCustomazeInstallAction[];
  warnings: string[];
}
