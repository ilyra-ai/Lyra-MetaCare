import type { LucideIcon } from 'lucide-react';
import {
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
    description: 'VisÃ£o central da energia, sono, astro e insights de IA.',
    icon: LayoutDashboard,
    section: 'Principal',
    shortcut: 'G D',
  },
  {
    href: '/plan',
    label: 'Plano de IA',
    description:
      'Protocolos personalizados de foco, ritmo, nutriÃ§Ã£o e recuperaÃ§Ã£o.',
    icon: Sparkles,
    section: 'Principal',
    shortcut: 'G P',
  },
  {
    href: '/goals',
    label: 'Metas',
    description:
      'EvoluÃ§Ã£o diÃ¡ria com progresso, streaks e prioridades suaves.',
    icon: Target,
    section: 'Principal',
    shortcut: 'G M',
  },
  {
    href: '/appointments',
    label: 'Agendamentos',
    description:
      'Agenda de encontros, profissionais e organizaÃ§Ã£o do seu fluxo.',
    icon: CalendarDays,
    section: 'Fluxo Guiado',
    shortcut: 'G A',
  },
  {
    href: '/monitoring',
    label: 'Monitoramento',
    description: 'Leituras em tempo real, tendÃªncias e estados do momento.',
    icon: Radio,
    section: 'Fluxo Guiado',
    shortcut: 'G R',
  },
  {
    href: '/chat',
    label: 'Chat IA',
    description:
      'Conversa inteligente com contexto biomÃ©trico, emocional e astral.',
    icon: BrainCircuit,
    section: 'Fluxo Guiado',
    shortcut: 'G C',
  },
  {
    href: '/connect',
    label: 'Dispositivos',
    description: 'ConexÃ£o e sincronizaÃ§Ã£o com wearables e integraÃ§Ãµes.',
    icon: Smartphone,
    section: 'Pessoal',
  },
  {
    href: '/profile',
    label: 'Perfil',
    description: 'Dados pessoais, hÃ¡bitos, preferÃªncias e avatar.',
    icon: UserRound,
    section: 'Pessoal',
  },
  {
    href: '/admin/dashboard',
    label: 'VisÃ£o Geral Admin',
    description: 'MÃ©tricas de negÃ³cio, saÃºde da plataforma e alertas.',
    icon: Compass,
    section: 'AdministraÃ§Ã£o',
    adminOnly: true,
  },
  {
    href: '/admin/users',
    label: 'UsuÃ¡rios',
    description: 'GestÃ£o de contas, perfis e permissÃµes.',
    icon: UsersRound,
    section: 'AdministraÃ§Ã£o',
    adminOnly: true,
  },
  {
    href: '/admin/plans',
    label: 'Planos',
    description: 'Matriz comercial, capacidades e precificaÃ§Ã£o.',
    icon: Gem,
    section: 'AdministraÃ§Ã£o',
    adminOnly: true,
  },
  {
    href: '/admin/data-health',
    label: 'SaÃºde dos Dados',
    description: 'Integridade, latÃªncia e confiabilidade dos dados.',
    icon: HeartPulse,
    section: 'AdministraÃ§Ã£o',
    adminOnly: true,
  },
  {
    href: '/admin/content',
    label: 'ConteÃºdo',
    description:
      'Curadoria operacional de hÃ¡bitos, mensagens e recomendaÃ§Ãµes.',
    icon: ClipboardList,
    section: 'AdministraÃ§Ã£o',
    adminOnly: true,
  },
  {
    href: '/admin/ai-config',
    label: 'ConfiguraÃ§Ã£o de IA',
    description: 'Pesos, missÃ£o, parÃ¢metros e seguranÃ§a operacional da IA.',
    icon: ShieldCheck,
    section: 'AdministraÃ§Ã£o',
    adminOnly: true,
  },
  {
    href: '/admin/reports',
    label: 'RelatÃ³rios',
    description: 'Leituras analÃ­ticas e exportaÃ§Ã£o executiva.',
    icon: BarChart3,
    section: 'AdministraÃ§Ã£o',
    adminOnly: true,
  },
  {
    href: '/admin/page-builder',
    label: 'Construtor UI',
    description: 'GestÃ£o de design visual e blocos da landing page e login.',
    icon: LayoutDashboard,
    section: 'AdministraÃ§Ã£o',
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
        'ExperiÃªncia premium de bem-estar com dados, IA e sabedoria ancestral.',
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
    segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  );
}
