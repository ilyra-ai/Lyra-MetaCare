import type { ReactNode } from 'react';
import type { Data } from '@puckeditor/core';

export const lyraPuckDocumentKeys = ['landing-home'] as const;

export type LyraPuckDocumentKey = (typeof lyraPuckDocumentKeys)[number];

export const defaultLyraPuckDocumentKey: LyraPuckDocumentKey = 'landing-home';

export type LyraHeroBlockProps = {
  id: string;
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
  children?: ReactNode;
};

export type LyraStackContainerBlockProps = {
  title: string;
  description: string;
  direction: LyraStackDirection;
  gap: LyraStackGap;
  surface: LyraStackSurface;
  children?: ReactNode;
};

export type LyraPuckData = Data;

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
}> = [
  {
    key: 'landing-home',
    label: 'Landing Home',
    description:
      'Primeiro documento oficial do Puck para a Lyra, usado para validar o editor visual com persistência real.',
    route: '/admin/puck',
  },
];

export function isLyraPuckDocumentKey(
  value: string
): value is LyraPuckDocumentKey {
  return (lyraPuckDocumentKeys as readonly string[]).includes(value);
}
