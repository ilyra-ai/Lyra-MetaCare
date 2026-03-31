import type { ReactNode } from 'react';
import type { Config, Data } from '@puckeditor/core';

export const lyraPuckDocumentKeys = [
  'landing-home',
  'login-experience',
  'app-shell',
] as const;

export type LyraPuckDocumentKey = (typeof lyraPuckDocumentKeys)[number];

export const defaultLyraPuckDocumentKey: LyraPuckDocumentKey = 'landing-home';

export type LyraPuckSurfaceKey = 'landing' | 'login' | 'app-shell';
export type LyraPuckThemeVariant = 'aurora' | 'serene' | 'shell';

export type LyraHeroBlockProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
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

export type LyraHeadingBlockProps = {
  children: string;
  level: LyraHeadingLevel;
  align: LyraTextAlign;
  tone: LyraHeadingTone;
};

export type LyraBodyTextBlockProps = {
  content: string;
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
  eyebrow: string;
  value: string;
  unit: string;
  description: string;
  trendLabel: string;
  trendDirection: LyraTrendDirection;
  badgeLabel: string;
  icon: LyraDecorativeIcon;
};

export type LyraFeatureCardBlockProps = {
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
  answer: string;
  eyebrow: string;
};

export type LyraSectionContainerBlockProps = {
  eyebrow: string;
  title: string;
  description: string;
  align: LyraTextAlign;
  surface: LyraSurfaceVariant;
  content?: ReactNode;
};

export type LyraStackContainerBlockProps = {
  title: string;
  description: string;
  direction: LyraStackDirection;
  gap: LyraStackGap;
  surface: LyraStackSurface;
  content?: ReactNode;
};

export type LyraPuckRootProps = {
  title: string;
  surfaceKey: LyraPuckSurfaceKey;
  surfaceTitle: string;
  surfaceDescription: string;
  themeVariant: LyraPuckThemeVariant;
  visibilityRules: string;
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
  surfaceKey: LyraPuckSurfaceKey;
}> = [
  {
    key: 'landing-home',
    label: 'Landing Home',
    description:
      'Superfície pública principal da Lyra para narrativa, marketing e aquisição.',
    route: '/admin/puck?documentKey=landing-home',
    surfaceKey: 'landing',
  },
  {
    key: 'login-experience',
    label: 'Experiência de Login',
    description:
      'Superfície de autenticação com contexto editorial, confiança e conversão.',
    route: '/admin/puck?documentKey=login-experience',
    surfaceKey: 'login',
  },
  {
    key: 'app-shell',
    label: 'App Shell',
    description:
      'Superfície estrutural do app autenticado, com contexto de navegação e leitura operacional.',
    route: '/admin/puck?documentKey=app-shell',
    surfaceKey: 'app-shell',
  },
];

export function isLyraPuckDocumentKey(
  value: string
): value is LyraPuckDocumentKey {
  return (lyraPuckDocumentKeys as readonly string[]).includes(value);
}
