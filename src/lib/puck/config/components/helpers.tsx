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
  LyraDecorativeIcon,
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

export function obterApresentacaoTrend(direcao: LyraTrendDirection) {
  return trendPresentation[direcao] ?? trendPresentation.neutral;
}

export function juntarClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return cn(classes);
}
