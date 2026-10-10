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
