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

/*
 * Os valores de tom (`cosmic`, `teal`, `coral`) fazem parte dos documentos
 * publicados e não podem mudar. No visual Lyra Clean o `accent` passou a ser
 * violeta (reservado ao conteúdo astral/IA) e não existe mais token coral, por
 * isso o tom "coral" é renderizado com o dourado quente acessível (`golden`).
 */
const headingToneClasses: Record<LyraHeadingTone, string> = {
  default: 'text-foreground',
  cosmic: 'text-cosmic-strong',
  teal: 'text-primary',
  coral: 'text-golden',
};

const textAlignClasses: Record<LyraTextAlign, string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

/*
 * As chaves abaixo são valores persistidos nos documentos do Puck e foram
 * mantidas; apenas a renderização mudou para superfícies chapadas com borda.
 * A borda (`border`) vem do bloco que consome estas classes.
 */
const sectionSurfaceClasses: Record<LyraSurfaceVariant, string> = {
  glass: 'border-border bg-card',
  surface: 'border-border bg-card',
  cosmic: 'border-cosmic/20 bg-cosmic-light',
  aurora: 'border-cosmic/30 bg-card',
};

const stackSurfaceClasses: Record<LyraStackSurface, string> = {
  transparent: 'border-none bg-transparent shadow-none',
  soft: 'border border-border bg-background',
  glass: 'border border-border bg-card',
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
  default: 'border-border bg-card text-foreground',
  cosmic: 'border-cosmic/20 bg-cosmic-light text-foreground',
  teal: 'border-primary/20 bg-sidebar-accent text-foreground',
  coral: 'border-golden/20 bg-golden-light text-foreground',
};

/**
 * Renderiza o ícone decorativo escolhido no editor. Os componentes vêm do
 * registro estático do módulo (nenhum componente é criado durante a
 * renderização, o que preservaria/resetaria estado a cada render).
 */
export function IconeDecorativo({
  icone,
  className,
}: {
  icone: LyraDecorativeIcon;
  className?: string;
}) {
  const Icone = iconRegistry[icone] ?? Sparkles;
  return <Icone className={className} aria-hidden="true" />;
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
