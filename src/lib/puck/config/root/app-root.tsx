import { criarLyraRootConfig } from '@/lib/puck/config/root/shared';

export const lyraAppRootConfig = criarLyraRootConfig({
  tituloPadrao: 'App Shell',
  surfaceKey: 'app-shell',
  surfaceTitle: 'App shell autenticado',
  surfaceDescription:
    'Superfície estrutural do app autenticado, pensada para navegação, contexto de módulo e leitura operacional.',
  themeVariant: 'shell',
  visibilityRules:
    'Privada\nUsuário autenticado\nAdministrador quando necessário',
  rotuloBadge: 'root app shell',
});
