import {
  Activity,
  Droplet,
  Dumbbell,
  Footprints,
  Heart,
  type LucideIcon,
  Moon,
  Rss,
  ShieldCheck,
  Sun,
  TrendingUp,
  Utensils,
  Weight,
  Zap,
} from 'lucide-react';

/**
 * Opções compartilhadas entre o onboarding e o perfil: os dois formulários
 * gravam os mesmos campos de `profiles` e precisam oferecer exatamente as
 * mesmas escolhas (antes a lista de metas só existia no onboarding, e o
 * perfil não permitia revê-las).
 */

export interface MetaDoPerfil {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const METAS_DO_PERFIL: readonly MetaDoPerfil[] = [
  { id: 'lose_weight', label: 'Perder Peso', icon: Weight },
  { id: 'gain_muscle', label: 'Ganhar Músculo', icon: Dumbbell },
  { id: 'improve_endurance', label: 'Melhorar Resistência', icon: Footprints },
  { id: 'reduce_stress', label: 'Reduzir Estresse Crônico', icon: Heart },
  { id: 'eat_healthier', label: 'Comer de Forma Saudável', icon: Utensils },
  { id: 'optimize_hrv', label: 'Otimizar HRV (Resiliência)', icon: Zap },
  {
    id: 'improve_readiness',
    label: 'Melhorar Score de Prontidão',
    icon: ShieldCheck,
  },
  {
    id: 'regulate_sleep_duration',
    label: 'Regular Duração do Sono',
    icon: Moon,
  },
  {
    id: 'improve_sleep_efficiency',
    label: 'Aumentar a Eficiência do Sono',
    icon: Sun,
  },
  {
    id: 'reduce_social_jetlag',
    label: 'Reduzir o Social Jetlag (Regularidade)',
    icon: Rss,
  },
  { id: 'increase_vo2max', label: 'Aumentar VO₂max', icon: TrendingUp },
  {
    id: 'meet_activity_guidelines',
    label: 'Cumprir Diretrizes de Atividade',
    icon: Activity,
  },
  {
    id: 'optimize_protein',
    label: 'Otimizar Ingestão de Proteínas',
    icon: Utensils,
  },
  {
    id: 'manage_blood_glucose',
    label: 'Gerenciar Picos de Glicose',
    icon: Droplet,
  },
];

/** Identificadores válidos de meta (para validar o que vem do formulário). */
export const IDS_DE_METAS: readonly string[] = METAS_DO_PERFIL.map(
  (meta) => meta.id
);

/** Escala do nível de atividade usada no onboarding e no perfil. */
export const NIVEL_DE_ATIVIDADE = {
  minimo: 1,
  maximo: 5,
  padrao: 3,
  rotuloMinimo: 'Sedentário (1)',
  rotuloMaximo: 'Muito Ativo (5)',
} as const;
