import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  CalendarClock,
  Cpu,
  HeartPulse,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type {
  LyraColumnsRatio,
  LyraColumnsVerticalAlign,
  LyraDecorativeIcon,
  LyraGridTileTone,
  LyraHeadingTone,
  LyraStackGap,
  LyraStackSurface,
  LyraSurfaceVariant,
  LyraTextAlign,
  LyraTrendDirection,
} from '@/lib/puck/types';

const iconRegistry: Record<LyraDecorativeIcon, LucideIcon> = {
  sparkles: Sparkles,
  heart: HeartPulse,
  cpu: Cpu,
  calendar: CalendarClock,
  shield: ShieldCheck,
  message: MessageCircleHeart,
  activity: Activity,
};

const headingToneClasses: Record<LyraHeadingTone, string> = {
  default: 'text-foreground',
  cosmic: 'text-cosmic',
  teal: 'text-primary',
  coral: 'text-accent',
};

const textAlignClasses: Record<LyraTextAlign, string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

const sectionSurfaceClasses: Record<LyraSurfaceVariant, string> = {
  glass: 'surface-panel',
  surface: 'surface-soft',
  cosmic:
    'surface-soft border-cosmic/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(237,233,254,0.72))]',
  aurora:
    'surface-panel aurora-border bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(237,233,254,0.62),rgba(224,231,255,0.5))]',
};

const stackSurfaceClasses: Record<LyraStackSurface, string> = {
  transparent: 'border-none bg-transparent shadow-none',
  soft: 'surface-soft',
  glass: 'surface-panel',
};

const stackGapClasses: Record<LyraStackGap, string> = {
  sm: 'gap-3',
  md: 'gap-5',
  lg: 'gap-7',
  xl: 'gap-10',
};

const trendPresentation: Record<
  LyraTrendDirection,
  { texto: string; classe: string; Icone: LucideIcon }
> = {
  up: {
    texto: 'Tendência de alta',
    classe: 'text-success',
    Icone: TrendingUp,
  },
  down: {
    texto: 'Tendência de queda',
    classe: 'text-destructive',
    Icone: TrendingDown,
  },
  neutral: {
    texto: 'Tendência estável',
    classe: 'text-muted-foreground',
    Icone: Activity,
  },
};

const columnRatioClasses: Record<LyraColumnsRatio, string> = {
  '1-1': 'grid-cols-1 lg:grid-cols-2',
  '2-1': 'grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]',
  '1-2': 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]',
};

const columnAlignClasses: Record<LyraColumnsVerticalAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  stretch: 'items-stretch',
};

const tileToneClasses: Record<LyraGridTileTone, string> = {
  default: 'surface-soft border-border/70 text-foreground',
  cosmic:
    'border-cosmic/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(237,233,254,0.78))] text-foreground shadow-[0_20px_44px_-26px_rgba(139,92,246,0.42)]',
  teal: 'border-primary/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,253,250,0.78))] text-foreground shadow-[0_20px_44px_-26px_rgba(49,155,142,0.38)]',
  coral:
    'border-accent/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,237,231,0.76))] text-foreground shadow-[0_20px_44px_-26px_rgba(240,101,67,0.34)]',
};

export function obterIconeDecorativo(icone: LyraDecorativeIcon): LucideIcon {
  return iconRegistry[icone] ?? Sparkles;
}

export function obterClasseTomHeading(tom: LyraHeadingTone) {
  return headingToneClasses[tom] ?? headingToneClasses.default;
}

export function obterClasseAlinhamento(alinhamento: LyraTextAlign) {
  return textAlignClasses[alinhamento] ?? textAlignClasses.left;
}

export function obterClasseSurfaceSection(superficie: LyraSurfaceVariant) {
  return sectionSurfaceClasses[superficie] ?? sectionSurfaceClasses.surface;
}

export function obterClasseSurfaceStack(superficie: LyraStackSurface) {
  return stackSurfaceClasses[superficie] ?? stackSurfaceClasses.transparent;
}

export function obterClasseGapStack(gap: LyraStackGap) {
  return stackGapClasses[gap] ?? stackGapClasses.md;
}

export function obterClasseRatioColunas(ratio: LyraColumnsRatio) {
  return columnRatioClasses[ratio] ?? columnRatioClasses['1-1'];
}

export function obterClasseAlinhamentoColunas(
  alinhamento: LyraColumnsVerticalAlign
) {
  return columnAlignClasses[alinhamento] ?? columnAlignClasses.start;
}

export function obterClasseTomTile(tom: LyraGridTileTone) {
  return tileToneClasses[tom] ?? tileToneClasses.default;
}

export function obterApresentacaoTrend(direcao: LyraTrendDirection) {
  return trendPresentation[direcao] ?? trendPresentation.neutral;
}

export function juntarClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return cn(classes);
}
