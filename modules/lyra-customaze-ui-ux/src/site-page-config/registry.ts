import { LyraCustomazeEditableSurface } from '../contracts/integration';
import { SitePageKey, sitePageKeys } from './schema';

export const sitePageLabels: Record<SitePageKey, string> = {
  landing: 'Landing',
  login: 'Login',
  app: 'App interno',
};

export const lyraCustomazeEditableSurfaceMap: Record<
  SitePageKey,
  LyraCustomazeEditableSurface
> = {
  landing: {
    key: 'landing',
    label: sitePageLabels.landing,
    description:
      'Vitrine pública da Lyra com hero, recursos, métricas, fluxo, planos, FAQ e CTA final.',
    route: '/',
    scope: 'public-page',
    adminOnly: true,
    zones: [
      {
        key: 'hero',
        label: 'Hero',
        description: 'Abertura principal, quick auth e preview inicial.',
        scope: 'public-page',
        supportsChildren: true,
        supportsReorder: false,
        supportsVisibilityToggle: true,
      },
      {
        key: 'features',
        label: 'Recursos',
        description: 'Cards de capacidades e diferenciais do produto.',
        scope: 'public-page',
        supportsChildren: true,
        supportsReorder: true,
        supportsVisibilityToggle: true,
      },
      {
        key: 'metrics',
        label: 'Métricas',
        description: 'Faixa com indicadores públicos ligados a dados reais.',
        scope: 'public-page',
        supportsChildren: true,
        supportsReorder: true,
        supportsVisibilityToggle: true,
      },
      {
        key: 'flow',
        label: 'Fluxo',
        description: 'Etapas da jornada e narrativa de funcionamento.',
        scope: 'public-page',
        supportsChildren: true,
        supportsReorder: true,
        supportsVisibilityToggle: true,
      },
      {
        key: 'plans',
        label: 'Planos',
        description: 'Vitrine comercial conectada ao catálogo publicado.',
        scope: 'public-page',
        supportsChildren: false,
        supportsReorder: true,
        supportsVisibilityToggle: true,
      },
      {
        key: 'faq',
        label: 'FAQ',
        description: 'Perguntas frequentes configuráveis.',
        scope: 'public-page',
        supportsChildren: true,
        supportsReorder: true,
        supportsVisibilityToggle: true,
      },
      {
        key: 'finalCta',
        label: 'CTA final',
        description: 'Fechamento da landing com chamada principal.',
        scope: 'public-page',
        supportsChildren: false,
        supportsReorder: true,
        supportsVisibilityToggle: true,
      },
      {
        key: 'footer',
        label: 'Rodapé',
        description: 'Assinatura da marca e observações finais.',
        scope: 'template',
        supportsChildren: false,
        supportsReorder: false,
        supportsVisibilityToggle: false,
      },
    ],
  },
  login: {
    key: 'login',
    label: sitePageLabels.login,
    description:
      'Experiência de autenticação com introdução, destaques e card de acesso.',
    route: '/login',
    scope: 'auth-page',
    adminOnly: true,
    zones: [
      {
        key: 'intro',
        label: 'Introdução',
        description: 'Bloco editorial de boas-vindas e destaques.',
        scope: 'auth-page',
        supportsChildren: true,
        supportsReorder: true,
        supportsVisibilityToggle: true,
      },
      {
        key: 'auth',
        label: 'Autenticação',
        description: 'Card principal de login e cadastro.',
        scope: 'auth-page',
        supportsChildren: false,
        supportsReorder: false,
        supportsVisibilityToggle: false,
      },
    ],
  },
  app: {
    key: 'app',
    label: sitePageLabels.app,
    description:
      'Camada visual interna da plataforma com sidebar, header e módulos prioritários.',
    route: '/admin/page-builder',
    scope: 'internal-page',
    adminOnly: true,
    zones: [
      {
        key: 'sidebar',
        label: 'Sidebar',
        description: 'Marca, grupos de navegação e itens do menu.',
        scope: 'layout',
        supportsChildren: true,
        supportsReorder: true,
        supportsVisibilityToggle: true,
      },
      {
        key: 'header',
        label: 'Header',
        description: 'Busca, atalho e ações de contexto do app.',
        scope: 'layout',
        supportsChildren: false,
        supportsReorder: false,
        supportsVisibilityToggle: false,
      },
      {
        key: 'appointments',
        label: 'Agendamentos',
        description: 'Hero, listas e calendário do módulo de agenda.',
        scope: 'internal-page',
        supportsChildren: true,
        supportsReorder: false,
        supportsVisibilityToggle: true,
      },
      {
        key: 'aiPlan',
        label: 'Plano de IA',
        description:
          'Hero editorial, contexto vivo e empty state da orquestração personalizada.',
        scope: 'internal-page',
        supportsChildren: true,
        supportsReorder: false,
        supportsVisibilityToggle: true,
      },
      {
        key: 'monitoring',
        label: 'Monitoramento',
        description: 'Painel em tempo real, leitura e alertas locais.',
        scope: 'internal-page',
        supportsChildren: true,
        supportsReorder: false,
        supportsVisibilityToggle: true,
      },
      {
        key: 'chat',
        label: 'Chat IA',
        description:
          'Conversa guiada, sugestões rápidas e transparência das integrações.',
        scope: 'internal-page',
        supportsChildren: true,
        supportsReorder: false,
        supportsVisibilityToggle: true,
      },
      {
        key: 'connect',
        label: 'Dispositivos',
        description:
          'Conexão bluetooth, compatibilidade do navegador e estado operacional do wearable.',
        scope: 'internal-page',
        supportsChildren: true,
        supportsReorder: false,
        supportsVisibilityToggle: true,
      },
      {
        key: 'profile',
        label: 'Perfil',
        description: 'Textos-base e contexto pessoal do perfil.',
        scope: 'internal-page',
        supportsChildren: false,
        supportsReorder: false,
        supportsVisibilityToggle: true,
      },
    ],
  },
};

export const lyraCustomazeEditableSurfaces = sitePageKeys.map(
  (pageKey) => lyraCustomazeEditableSurfaceMap[pageKey]
);

export function getSitePageLabel(pageKey: SitePageKey) {
  return sitePageLabels[pageKey];
}

export function getEditableSurface(pageKey: SitePageKey) {
  return lyraCustomazeEditableSurfaceMap[pageKey];
}
