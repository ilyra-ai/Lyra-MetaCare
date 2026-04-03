import type { Config, Data, RichText } from '@puckeditor/core';

export const lyraPuckDocumentKeys = [
  'landing-home',
  'login-experience',
  'app-shell',
] as const;

export type LyraPuckDocumentKey = (typeof lyraPuckDocumentKeys)[number];

export const defaultLyraPuckDocumentKey: LyraPuckDocumentKey = 'landing-home';

export type LyraPuckSurfaceKey = 'landing' | 'login' | 'app-shell';
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
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline'
  | 'ghost';
export type LyraButtonSize = 'sm' | 'default' | 'lg' | 'xl';
export type LyraTrendDirection = 'up' | 'down' | 'neutral';
export type LyraHeroCtaMode = 'manual-url' | 'surface-route';
export type LyraHeroDynamicSource =
  | 'manual'
  | 'session-profile'
  | 'subscription-context';
export type LyraMetricDynamicSource = 'manual' | 'subscription-summary';
export type LyraRootDynamicSource = 'manual' | 'session-context';
export type LyraDecorativeIcon =
  | 'sparkles'
  | 'heart'
  | 'cpu'
  | 'calendar'
  | 'shield'
  | 'message'
  | 'activity';
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
];

export function isLyraPuckDocumentKey(
  value: string
): value is LyraPuckDocumentKey {
  return (lyraPuckDocumentKeys as readonly string[]).includes(value);
}

export function obterDocumentoPuckLyra(documentKey: LyraPuckDocumentKey) {
  return lyraPuckDocuments.find((item) => item.key === documentKey) ?? null;
}
