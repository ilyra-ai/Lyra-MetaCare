import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  ClipboardList,
  Compass,
  Gem,
  HeartPulse,
  LayoutDashboard,
  Radio,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
} from 'lucide-react';

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  section: string;
  adminOnly?: boolean;
  shortcut?: string;
};

export const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    description: 'Visão central da saúde, sono, astro e insights de IA.',
    icon: LayoutDashboard,
    section: 'Principal',
    shortcut: 'G D',
  },
  {
    href: '/plan',
    label: 'Plano de IA',
    description: 'Protocolos personalizados de treino, sono, nutrição e foco.',
    icon: Sparkles,
    section: 'Principal',
    shortcut: 'G P',
  },
  {
    href: '/goals',
    label: 'Metas',
    description: 'Evolução diária com progresso, streaks e prioridades.',
    icon: Target,
    section: 'Principal',
    shortcut: 'G M',
  },
  {
    href: '/appointments',
    label: 'Agendamentos',
    description: 'Agenda de consultas, profissionais e horários.',
    icon: CalendarDays,
    section: 'Clínica',
    shortcut: 'G A',
  },
  {
    href: '/monitoring',
    label: 'Monitoramento',
    description: 'Leituras em tempo real, tendências e alertas.',
    icon: Radio,
    section: 'Clínica',
    shortcut: 'G R',
  },
  {
    href: '/chat',
    label: 'Chat IA',
    description: 'Conversação inteligente com contexto biométrico e astral.',
    icon: BrainCircuit,
    section: 'Clínica',
    shortcut: 'G C',
  },
  {
    href: '/connect',
    label: 'Dispositivos',
    description: 'Conexão e sincronização com wearables e integrações.',
    icon: Smartphone,
    section: 'Pessoal',
  },
  {
    href: '/profile',
    label: 'Perfil',
    description: 'Dados pessoais, hábitos, preferências e avatar.',
    icon: UserRound,
    section: 'Pessoal',
  },
  {
    href: '/admin/dashboard',
    label: 'Visão Geral Admin',
    description: 'Métricas de negócio, saúde da plataforma e alertas.',
    icon: Compass,
    section: 'Administração',
    adminOnly: true,
  },
  {
    href: '/admin/users',
    label: 'Usuários',
    description: 'Gestão de contas, perfis e permissões.',
    icon: UsersRound,
    section: 'Administração',
    adminOnly: true,
  },
  {
    href: '/admin/plans',
    label: 'Planos',
    description: 'Matriz comercial, capacidades e precificação.',
    icon: Gem,
    section: 'Administração',
    adminOnly: true,
  },
  {
    href: '/admin/data-health',
    label: 'Saúde dos Dados',
    description: 'Integridade, latência e confiabilidade dos dados.',
    icon: HeartPulse,
    section: 'Administração',
    adminOnly: true,
  },
  {
    href: '/admin/content',
    label: 'Conteúdo',
    description: 'Curadoria operacional de hábitos, mensagens e recomendações.',
    icon: ClipboardList,
    section: 'Administração',
    adminOnly: true,
  },
  {
    href: '/admin/ai-config',
    label: 'Configuração de IA',
    description: 'Pesos, missão, parâmetros e segurança operacional da IA.',
    icon: ShieldCheck,
    section: 'Administração',
    adminOnly: true,
  },
  {
    href: '/admin/reports',
    label: 'Relatórios',
    description: 'Leituras analíticas e exportação executiva.',
    icon: BarChart3,
    section: 'Administração',
    adminOnly: true,
  },
];

export const pageMetaByPath = Object.fromEntries(
  navigationItems.map((item) => [
    item.href,
    {
      title: item.label,
      description: item.description,
      icon: item.icon,
    },
  ])
) as Record<
  string,
  {
    title: string;
    description: string;
    icon: LucideIcon;
  }
>;

export function getVisibleNavigation(isAdmin: boolean) {
  return navigationItems.filter((item) => !item.adminOnly || isAdmin);
}

export function groupNavigation(items: NavigationItem[]) {
  return items.reduce<Record<string, NavigationItem[]>>((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }

    acc[item.section].push(item);
    return acc;
  }, {});
}

export function getPageMeta(pathname: string) {
  return (
    pageMetaByPath[pathname] ?? {
      title: 'Lyra MetaCare',
      description:
        'Experiência premium de saúde preventiva com dados, IA e sabedoria ancestral.',
      icon: Settings2,
    }
  );
}

export function buildBreadcrumb(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return ['Dashboard'];
  }

  return segments.map((segment) =>
    segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}
