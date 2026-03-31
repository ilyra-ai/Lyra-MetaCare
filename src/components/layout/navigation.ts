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
  Layers3,
  Radio,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
} from 'lucide-react';

import type { AppPageConfig } from '@/lib/site-page-config/schema';

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  section: string;
  adminOnly?: boolean;
  shortcut?: string;
};

type NavigationSectionKey = 'principal' | 'guidedFlow' | 'personal' | 'admin';

type NavigationDefinition = NavigationItem & {
  sectionKey: NavigationSectionKey;
  visible?: boolean;
};

export const navigationItems: NavigationDefinition[] = [
  {
    href: '/',
    label: 'Dashboard',
    description: 'Visão central da energia, sono, astro e insights de IA.',
    icon: LayoutDashboard,
    section: 'Principal',
    sectionKey: 'principal',
    shortcut: 'G D',
  },
  {
    href: '/plan',
    label: 'Plano de IA',
    description:
      'Protocolos personalizados de foco, ritmo, nutrição e recuperação.',
    icon: Sparkles,
    section: 'Principal',
    sectionKey: 'principal',
    shortcut: 'G P',
  },
  {
    href: '/goals',
    label: 'Metas',
    description: 'Evolução diária com progresso, streaks e prioridades suaves.',
    icon: Target,
    section: 'Principal',
    sectionKey: 'principal',
    shortcut: 'G M',
  },
  {
    href: '/appointments',
    label: 'Agendamentos',
    description:
      'Agenda de encontros, profissionais e organização do seu fluxo.',
    icon: CalendarDays,
    section: 'Fluxo Guiado',
    sectionKey: 'guidedFlow',
    shortcut: 'G A',
  },
  {
    href: '/monitoring',
    label: 'Monitoramento',
    description: 'Leituras em tempo real, tendências e estados do momento.',
    icon: Radio,
    section: 'Fluxo Guiado',
    sectionKey: 'guidedFlow',
    shortcut: 'G R',
  },
  {
    href: '/chat',
    label: 'Chat IA',
    description:
      'Conversa inteligente com contexto biométrico, emocional e astral.',
    icon: BrainCircuit,
    section: 'Fluxo Guiado',
    sectionKey: 'guidedFlow',
    shortcut: 'G C',
  },
  {
    href: '/connect',
    label: 'Dispositivos',
    description: 'Conexão e sincronização com wearables e integrações.',
    icon: Smartphone,
    section: 'Pessoal',
    sectionKey: 'personal',
  },
  {
    href: '/profile',
    label: 'Perfil',
    description: 'Dados pessoais, hábitos, preferências e avatar.',
    icon: UserRound,
    section: 'Pessoal',
    sectionKey: 'personal',
  },
  {
    href: '/admin/dashboard',
    label: 'Visão Geral Admin',
    description: 'Métricas de negócio, saúde da plataforma e alertas.',
    icon: Compass,
    section: 'Administração',
    sectionKey: 'admin',
    adminOnly: true,
  },
  {
    href: '/admin/users',
    label: 'Usuários',
    description: 'Gestão de contas, perfis e permissões.',
    icon: UsersRound,
    section: 'Administração',
    sectionKey: 'admin',
    adminOnly: true,
  },
  {
    href: '/admin/plans',
    label: 'Planos',
    description: 'Matriz comercial, capacidades e precificação.',
    icon: Gem,
    section: 'Administração',
    sectionKey: 'admin',
    adminOnly: true,
  },
  {
    href: '/admin/data-health',
    label: 'Saúde dos Dados',
    description: 'Integridade, latência e confiabilidade dos dados.',
    icon: HeartPulse,
    section: 'Administração',
    sectionKey: 'admin',
    adminOnly: true,
  },
  {
    href: '/admin/content',
    label: 'Conteúdo',
    description: 'Curadoria operacional de hábitos, mensagens e recomendações.',
    icon: ClipboardList,
    section: 'Administração',
    sectionKey: 'admin',
    adminOnly: true,
  },
  {
    href: '/admin/ai-config',
    label: 'Configuração de IA',
    description: 'Pesos, missão, parâmetros e segurança operacional da IA.',
    icon: ShieldCheck,
    section: 'Administração',
    sectionKey: 'admin',
    adminOnly: true,
  },
  {
    href: '/admin/reports',
    label: 'Relatórios',
    description: 'Leituras analíticas e exportação executiva.',
    icon: BarChart3,
    section: 'Administração',
    sectionKey: 'admin',
    adminOnly: true,
  },
  {
    href: '/admin/page-builder',
    label: 'Construtor UI',
    description: 'Gestão de design visual e blocos da landing page e login.',
    icon: LayoutDashboard,
    section: 'Administração',
    sectionKey: 'admin',
    adminOnly: true,
  },
  {
    href: '/admin/puck',
    label: 'Editor Puck',
    description:
      'Primeira base do editor visual drag-and-drop da Lyra com persistência real.',
    icon: Layers3,
    section: 'Administração',
    sectionKey: 'admin',
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

function getSectionLabel(
  sectionKey: NavigationSectionKey,
  appConfig?: AppPageConfig
) {
  if (!appConfig) {
    return navigationItems.find((item) => item.sectionKey === sectionKey)
      ?.section;
  }

  return {
    principal: appConfig.sidebar.sectionLabels.principal,
    guidedFlow: appConfig.sidebar.sectionLabels.guidedFlow,
    personal: appConfig.sidebar.sectionLabels.personal,
    admin: appConfig.sidebar.sectionLabels.admin,
  }[sectionKey];
}

function buildConfiguredNavigation(appConfig?: AppPageConfig) {
  if (!appConfig) {
    return navigationItems;
  }

  const baseItemsByHref = new Map(
    navigationItems.map((item) => [item.href, item] as const)
  );
  const configuredHrefs = new Set(
    appConfig.sidebar.items.map((item) => item.href)
  );

  const configuredItems = appConfig.sidebar.items.map((item) => {
    const baseItem = baseItemsByHref.get(item.href);
    const sectionKey = baseItem?.sectionKey ?? 'principal';

    return {
      href: item.href,
      label: item.label,
      description: item.description,
      icon: baseItem?.icon ?? Sparkles,
      section: getSectionLabel(sectionKey, appConfig) ?? 'Principal',
      sectionKey,
      adminOnly: baseItem?.adminOnly ?? item.href.startsWith('/admin'),
      shortcut: baseItem?.shortcut,
      visible: item.visible,
    } satisfies NavigationDefinition;
  });

  const missingBaseItems = navigationItems
    .filter((item) => !configuredHrefs.has(item.href))
    .map((item) => ({
      ...item,
      section: getSectionLabel(item.sectionKey, appConfig) ?? item.section,
      visible: true,
    }));

  return [...configuredItems, ...missingBaseItems];
}

export function getVisibleNavigation(
  isAdmin: boolean,
  appConfig?: AppPageConfig
) {
  return buildConfiguredNavigation(appConfig).filter(
    (item) => item.visible !== false && (!item.adminOnly || isAdmin)
  );
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

export function getPageMeta(pathname: string, appConfig?: AppPageConfig) {
  const configuredItem = appConfig
    ? getVisibleNavigation(true, appConfig).find(
        (item) => item.href === pathname
      )
    : null;

  if (configuredItem) {
    return {
      title: configuredItem.label,
      description: configuredItem.description,
      icon: configuredItem.icon,
    };
  }

  return (
    pageMetaByPath[pathname] ?? {
      title: 'Lyra MetaCare',
      description:
        'Experiência premium de bem-estar com dados, IA e sabedoria ancestral.',
      icon: Settings2,
    }
  );
}

export function buildBreadcrumb(pathname: string, appConfig?: AppPageConfig) {
  const configuredItem = appConfig
    ? getVisibleNavigation(true, appConfig).find(
        (item) => item.href === pathname
      )
    : null;

  if (configuredItem) {
    return [configuredItem.section, configuredItem.label];
  }

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return ['Dashboard'];
  }

  return segments.map((segment) =>
    segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  );
}
