import type { Config, Data, RichText } from '@puckeditor/core';

export const lyraPuckDocumentKeys = [
  'landing-home',
  'login-experience',
  'app-shell',
  'onboarding',
  'profile',
  'appointments',
  'monitoring',
  'chat',
  'connect',
  'goals',
  'instruments',
  'billing-success',
  'billing-cancel',
  'admin-dashboard',
  'admin-users',
  'admin-plans',
  'admin-reports',
  'admin-data-health',
  'admin-content',
  'admin-ai-config',
  'admin-page-builder',
  'dashboard',
] as const;

export type LyraPuckDocumentKey = (typeof lyraPuckDocumentKeys)[number];

export const defaultLyraPuckDocumentKey: LyraPuckDocumentKey = 'landing-home';

export type LyraPuckSurfaceKey =
  | 'landing'
  | 'login'
  | 'app-shell'
  | 'admin-panel'
  | 'patient-portal'
  | 'billing';
export type LyraPuckThemeVariant = 'aurora' | 'serene' | 'shell';
export type LyraPuckSlotItem = {
  type: string;
  props: Record<string, unknown>;
};
export type LyraPuckSlotItems = LyraPuckSlotItem[];

export type LyraHeroBlockProps = {
  dynamicSource?: LyraHeroDynamicSource;
  eyebrow: string;
  title: string;
  description: string;
  ctaMode: LyraHeroCtaMode;
  ctaLabel: string;
  ctaHref: string;
  ctaDocumentKey: LyraPuckDocumentKey;
  note: string;
};

export type LyraTextAlign = 'left' | 'center' | 'right';
export type LyraHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';
export type LyraHeadingTone = 'default' | 'cosmic' | 'teal' | 'coral';
export type LyraBodyTextSize = 'sm' | 'md' | 'lg';
export type LyraBodyTextTone = 'default' | 'muted' | 'cosmic';
export type LyraButtonVariant =
  'primary' | 'accent' | 'secondary' | 'outline' | 'ghost';
export type LyraButtonSize = 'sm' | 'default' | 'lg' | 'xl';
export type LyraTrendDirection = 'up' | 'down' | 'neutral';
export type LyraHeroCtaMode = 'manual-url' | 'surface-route';
export type LyraHeroDynamicSource =
  'manual' | 'session-profile' | 'subscription-context';
export type LyraMetricDynamicSource = 'manual' | 'subscription-summary';
export type LyraRootDynamicSource = 'manual' | 'session-context';
export type LyraDecorativeIcon =
  'sparkles' | 'heart' | 'cpu' | 'calendar' | 'shield' | 'message' | 'activity';
export type LyraSurfaceVariant = 'glass' | 'surface' | 'cosmic' | 'aurora';
export type LyraStackDirection = 'vertical' | 'horizontal';
export type LyraStackGap = 'sm' | 'md' | 'lg' | 'xl';
export type LyraStackSurface = 'transparent' | 'soft' | 'glass';
export type LyraColumnsRatio = '1-1' | '2-1' | '1-2';
export type LyraColumnsVerticalAlign = 'start' | 'center' | 'stretch';
export type LyraGridMode = 'grid' | 'flex';
export type LyraGridColumns = '1' | '2' | '3' | '4';
export type LyraGridTileTone = 'default' | 'cosmic' | 'teal' | 'coral';
export type LyraGridSpan = '1' | '2' | '3';

export type LyraHeadingBlockProps = {
  children: string;
  level: LyraHeadingLevel;
  align: LyraTextAlign;
  tone: LyraHeadingTone;
};

export type LyraBodyTextBlockProps = {
  content: RichText;
  align: LyraTextAlign;
  size: LyraBodyTextSize;
  tone: LyraBodyTextTone;
};

export type LyraCTAButtonBlockProps = {
  label: string;
  href: string;
  variant: LyraButtonVariant;
  size: LyraButtonSize;
  align: LyraTextAlign;
  supportingText: string;
};

export type LyraMetricCardBlockProps = {
  dynamicSource?: LyraMetricDynamicSource;
  eyebrow: string;
  value: string;
  unit: string;
  description: string;
  trendLabel: string;
  trendDirection: LyraTrendDirection;
  badgeLabel: string;
  icon: LyraDecorativeIcon;
};

export type LyraExternalPlanData = {
  id: string;
  key: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  currencyCode: string;
  highlightText: string | null;
};

export type LyraFeatureCardBlockProps = {
  externalPlan?: LyraExternalPlanData;
  eyebrow: string;
  title: string;
  description: string;
  icon: LyraDecorativeIcon;
  tone: LyraHeadingTone;
  ctaLabel: string;
  ctaHref: string;
};

export type LyraFaqItemBlockProps = {
  question: string;
  answer: RichText;
  eyebrow: string;
};

export type LyraSectionContainerBlockProps = {
  eyebrow: string;
  title: string;
  description: string;
  align: LyraTextAlign;
  surface: LyraSurfaceVariant;
  content?: LyraPuckSlotItems;
};

export type LyraStackContainerBlockProps = {
  title: string;
  description: string;
  direction: LyraStackDirection;
  gap: LyraStackGap;
  surface: LyraStackSurface;
  content?: LyraPuckSlotItems;
};

export type LyraFixedColumnsBlockProps = {
  eyebrow: string;
  title: string;
  description: string;
  ratio: LyraColumnsRatio;
  gap: LyraStackGap;
  verticalAlign: LyraColumnsVerticalAlign;
  surface: LyraSurfaceVariant;
  leftColumn?: LyraPuckSlotItems;
  rightColumn?: LyraPuckSlotItems;
};

export type LyraFluidGridBlockProps = {
  eyebrow: string;
  title: string;
  description: string;
  layoutMode: LyraGridMode;
  columnsDesktop: LyraGridColumns;
  columnsTablet: LyraGridColumns;
  gap: LyraStackGap;
  surface: LyraSurfaceVariant;
  content?: LyraPuckSlotItems;
};

export type LyraGridTileBlockProps = {
  eyebrow: string;
  title: string;
  description: string;
  badgeLabel: string;
  tone: LyraGridTileTone;
  spanCol: LyraGridSpan;
  spanRow: LyraGridSpan;
};

export type LyraPuckRootProps = {
  title: string;
  dynamicSource?: LyraRootDynamicSource;
  surfaceKey: LyraPuckSurfaceKey;
  surfaceTitle: string;
  surfaceDescription: string;
  themeVariant: LyraPuckThemeVariant;
  visibilityRules: string;
  resolvedContextSummary?: string;
};

export type LyraPuckComponentProps = {
  LyraHeroBlock: LyraHeroBlockProps;
  LyraHeadingBlock: LyraHeadingBlockProps;
  LyraBodyTextBlock: LyraBodyTextBlockProps;
  LyraCTAButtonBlock: LyraCTAButtonBlockProps;
  LyraMetricCardBlock: LyraMetricCardBlockProps;
  LyraFeatureCardBlock: LyraFeatureCardBlockProps;
  LyraFaqItemBlock: LyraFaqItemBlockProps;
  LyraSectionContainerBlock: LyraSectionContainerBlockProps;
  LyraStackContainerBlock: LyraStackContainerBlockProps;
  LyraFixedColumnsBlock: LyraFixedColumnsBlockProps;
  LyraFluidGridBlock: LyraFluidGridBlockProps;
  LyraGridTileBlock: LyraGridTileBlockProps;
};

export type LyraPuckData = Data<
  Record<string, Record<string, unknown>>,
  LyraPuckRootProps
>;
export type LyraPuckConfig = Config;

export type LyraPuckDocumentMeta = {
  documentKey: LyraPuckDocumentKey;
  createdAt: string | null;
  updatedAt: string | null;
  updatedByUserId: string | null;
};

export type LyraPuckDocumentRecord = LyraPuckDocumentMeta & {
  draftData: LyraPuckData;
  publishedData: LyraPuckData;
};

export const lyraPuckDocuments: Array<{
  key: LyraPuckDocumentKey;
  label: string;
  description: string;
  route: string;
  publicRoute: string;
  publicLabel: string;
  surfaceKey: LyraPuckSurfaceKey;
}> = [
  {
    key: 'landing-home',
    label: 'Landing Home',
    description:
      'Superfície pública principal da Lyra para narrativa, marketing e aquisição.',
    route: '/admin/puck?documentKey=landing-home',
    publicRoute: '/',
    publicLabel: 'Landing pública',
    surfaceKey: 'landing',
  },
  {
    key: 'login-experience',
    label: 'Experiência de Login',
    description:
      'Superfície de autenticação com contexto editorial, confiança e conversão.',
    route: '/admin/puck?documentKey=login-experience',
    publicRoute: '/login',
    publicLabel: 'Tela de login',
    surfaceKey: 'login',
  },
  {
    key: 'app-shell',
    label: 'App Shell',
    description:
      'Superfície estrutural do app autenticado, com contexto de navegação e leitura operacional.',
    route: '/admin/puck?documentKey=app-shell',
    publicRoute: '/plan',
    publicLabel: 'Aplicativo autenticado',
    surfaceKey: 'app-shell',
  },
  {
    key: 'onboarding',
    label: 'Onboarding & Intake',
    description:
      'Interface de primeiros passos e aquisição de dados do usuário recém-registrado.',
    route: '/admin/puck?documentKey=onboarding',
    publicRoute: '/onboarding',
    publicLabel: 'Tela de Onboarding',
    surfaceKey: 'patient-portal',
  },
  {
    key: 'profile',
    label: 'Perfil do Paciente',
    description: 'Ambiente privado e configurações sensíveis/biométricas.',
    route: '/admin/puck?documentKey=profile',
    publicRoute: '/profile',
    publicLabel: 'Página de Perfil',
    surfaceKey: 'patient-portal',
  },
  {
    key: 'appointments',
    label: 'Agenda e Consultas',
    description:
      'Painel visual de check-ins clínicos, agendamentos e calendário do longo-prazo.',
    route: '/admin/puck?documentKey=appointments',
    publicRoute: '/appointments',
    publicLabel: 'Página de Agenda',
    surfaceKey: 'patient-portal',
  },
  {
    key: 'monitoring',
    label: 'Monitoramento (Dashboards)',
    description:
      'Visitas analíticas com rastreio de biometria e painéis sensoriais de evolução.',
    route: '/admin/puck?documentKey=monitoring',
    publicRoute: '/monitoring',
    publicLabel: 'Página de Métricas',
    surfaceKey: 'patient-portal',
  },
  {
    key: 'dashboard',
    label: 'Dashboard Védico e Quântico',
    description:
      'Espaço principal para análise integral do paciente com Lyra MetaCare.',
    route: '/admin/puck?documentKey=dashboard',
    publicRoute: '/dashboard',
    publicLabel: 'Página de Dashboard Principal',
    surfaceKey: 'patient-portal',
  },
  {
    key: 'chat',
    label: 'Assistente Clínico (Chat)',
    description:
      'Visual principal de inteligência imersiva e assistente de IA conversacional.',
    route: '/admin/puck?documentKey=chat',
    publicRoute: '/chat',
    publicLabel: 'Assistente de Chat',
    surfaceKey: 'patient-portal',
  },
  {
    key: 'connect',
    label: 'Integrações (Connect Devices)',
    description: 'Autorizações de wearables e gestão de fontes externas.',
    route: '/admin/puck?documentKey=connect',
    publicRoute: '/connect',
    publicLabel: 'Página de Integração',
    surfaceKey: 'patient-portal',
  },
  {
    key: 'goals',
    label: 'Alvos e Objetivos (Goals)',
    description: 'Plano acionável e gamificação dos marcos terapêuticos.',
    route: '/admin/puck?documentKey=goals',
    publicRoute: '/goals',
    publicLabel: 'Gestão de Objetivos',
    surfaceKey: 'patient-portal',
  },
  {
    key: 'instruments',
    label: 'Inventários de Saúde',
    description: 'Ponto de coleta padronizada para exames de feedback clínico.',
    route: '/admin/puck?documentKey=instruments',
    publicRoute: '/instruments',
    publicLabel: 'Coleta de Dados',
    surfaceKey: 'patient-portal',
  },
  {
    key: 'billing-success',
    label: 'Sucesso Transacional (Billing)',
    description: 'Confirmação alegre em conversões ou aprovações monetárias.',
    route: '/admin/puck?documentKey=billing-success',
    publicRoute: '/billing/success',
    publicLabel: 'Sucesso de Faturamento',
    surfaceKey: 'billing',
  },
  {
    key: 'billing-cancel',
    label: 'Retenção Financeira (Billing Cancel)',
    description: 'Captura de retenção após recusa ou cancelamento sistêmico.',
    route: '/admin/puck?documentKey=billing-cancel',
    publicRoute: '/billing/cancel',
    publicLabel: 'Abandono Financeiro',
    surfaceKey: 'billing',
  },
  {
    key: 'admin-dashboard',
    label: 'Admin: Dashboard Matriz',
    description:
      'O cockpit gerencial com relatórios cruciais da corporação no Backoffice.',
    route: '/admin/puck?documentKey=admin-dashboard',
    publicRoute: '/admin/dashboard',
    publicLabel: 'Dashboard B2B',
    surfaceKey: 'admin-panel',
  },
  {
    key: 'admin-users',
    label: 'Admin: Gestão Clínica de Usuários',
    description:
      'Interface gerencial para os fluxos da base de clientes em massa.',
    route: '/admin/puck?documentKey=admin-users',
    publicRoute: '/admin/users',
    publicLabel: 'Gerenciador Humano B2B',
    surfaceKey: 'admin-panel',
  },
  {
    key: 'admin-plans',
    label: 'Admin: Planos e Comércio',
    description:
      'Construtor de catálogos e gestão de pagamentos por assinatura.',
    route: '/admin/puck?documentKey=admin-plans',
    publicRoute: '/admin/plans',
    publicLabel: 'Commerce Engine',
    surfaceKey: 'admin-panel',
  },
  {
    key: 'admin-reports',
    label: 'Admin: Inteligência de Relatórios',
    description:
      'Modelagem dos logs e saídas contábeis ou de sucesso do sistema.',
    route: '/admin/puck?documentKey=admin-reports',
    publicRoute: '/admin/reports',
    publicLabel: 'Governança Auditorial',
    surfaceKey: 'admin-panel',
  },
  {
    key: 'admin-data-health',
    label: 'Admin: Saúde dos Dados API',
    description: 'Console investigativo do banco de dados no nível macro.',
    route: '/admin/puck?documentKey=admin-data-health',
    publicRoute: '/admin/data-health',
    publicLabel: 'Integridade B2B',
    surfaceKey: 'admin-panel',
  },
  {
    key: 'admin-content',
    label: 'Admin: CMS e Políticas',
    description:
      'Página voltada ao carregamento legal e informacional institucional.',
    route: '/admin/puck?documentKey=admin-content',
    publicRoute: '/admin/content',
    publicLabel: 'CMS Base Legal',
    surfaceKey: 'admin-panel',
  },
  {
    key: 'admin-ai-config',
    label: 'Admin: Motores de IA',
    description:
      'Afinamento sensível nas equações neurais e parâmetros base da IA local.',
    route: '/admin/puck?documentKey=admin-ai-config',
    publicRoute: '/admin/ai-config',
    publicLabel: 'Motor de Engenheiros',
    surfaceKey: 'admin-panel',
  },
  {
    key: 'admin-page-builder',
    label: 'Admin: Builder Genérico',
    description: 'Construtor nativo atrelado a componentes de hardcode react.',
    route: '/admin/puck?documentKey=admin-page-builder',
    publicRoute: '/admin/page-builder',
    publicLabel: 'Construtores',
    surfaceKey: 'admin-panel',
  },
];

export function isLyraPuckDocumentKey(
  value: string
): value is LyraPuckDocumentKey {
  return (lyraPuckDocumentKeys as readonly string[]).includes(value);
}

export function obterDocumentoPuckLyra(documentKey: LyraPuckDocumentKey) {
  return lyraPuckDocuments.find((item) => item.key === documentKey) ?? null;
}
