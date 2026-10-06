import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  Brain,
  Calendar,
  Gem,
  HeartPulse,
  MessageCircle,
  MoonStar,
  Shield,
  Sparkles,
  Star,
  Sun,
  Waves,
  Zap,
} from 'lucide-react';

import type { BuilderIconKey, ToneKey } from './schema';

export const builderIconOptions: Array<{
  value: BuilderIconKey;
  label: string;
}> = [
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'moonStar', label: 'MoonStar' },
  { value: 'bot', label: 'Bot' },
  { value: 'brain', label: 'Brain' },
  { value: 'heartPulse', label: 'HeartPulse' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'star', label: 'Star' },
  { value: 'shield', label: 'Shield' },
  { value: 'gem', label: 'Gem' },
  { value: 'waves', label: 'Waves' },
  { value: 'sun', label: 'Sun' },
  { value: 'messageCircle', label: 'MessageCircle' },
  { value: 'zap', label: 'Zap' },
];

export const toneOptions: Array<{
  value: ToneKey;
  label: string;
}> = [
  { value: 'primary', label: 'Primary' },
  { value: 'accent', label: 'Accent' },
  { value: 'cosmic', label: 'Cosmic' },
  { value: 'golden', label: 'Golden' },
  { value: 'soft', label: 'Soft' },
];

const builderIconMap: Record<BuilderIconKey, LucideIcon> = {
  sparkles: Sparkles,
  moonStar: MoonStar,
  bot: Bot,
  brain: Brain,
  heartPulse: HeartPulse,
  calendar: Calendar,
  star: Star,
  shield: Shield,
  gem: Gem,
  waves: Waves,
  sun: Sun,
  messageCircle: MessageCircle,
  zap: Zap,
};

export function getBuilderIcon(iconKey: BuilderIconKey) {
  return builderIconMap[iconKey];
}

export function getToneSurfaceClass(tone: ToneKey) {
  switch (tone) {
    case 'primary':
      return 'from-primary/16 via-primary/6 to-white text-primary';
    case 'accent':
      return 'from-accent/16 via-accent/6 to-white text-accent';
    case 'cosmic':
      return 'from-cosmic/16 via-cosmic/6 to-white text-cosmic';
    case 'golden':
      return 'from-golden/18 via-golden/6 to-white text-golden';
    case 'soft':
      return 'from-muted via-white to-white text-foreground';
  }
}

export function getToneBadgeClass(tone: ToneKey) {
  switch (tone) {
    case 'primary':
      return 'border-primary/20 bg-primary/10 text-primary';
    case 'accent':
      return 'border-accent/20 bg-accent/10 text-accent';
    case 'cosmic':
      return 'border-cosmic/20 bg-cosmic/10 text-cosmic';
    case 'golden':
      return 'border-golden/20 bg-golden/10 text-golden';
    case 'soft':
      return 'border-border bg-white/85 text-foreground';
  }
}

export function getToneNumberClass(tone: ToneKey) {
  switch (tone) {
    case 'primary':
      return 'text-primary';
    case 'accent':
      return 'text-accent';
    case 'cosmic':
      return 'text-cosmic';
    case 'golden':
      return 'text-golden';
    case 'soft':
      return 'text-foreground';
  }
}
