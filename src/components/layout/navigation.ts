import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BrainCircuit,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Compass,
  Gem,
  HeartPulse,
  LayoutDashboard,
  Layers3,
  Radio,
  Receipt,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sunrise,
  Target,
  UserRound,
  UsersRound,
  Wind,
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
    description: 'Seu dia em um olhar: energia, sono e o céu de hoje.',
    icon: LayoutDashboard,
    section: 'Principal',
    sectionKey: 'principal',
    shortcut: 'G D',
  },
  {
    href: '/dia',
    label: 'Meu dia',
    description:
      'Como será o seu dia, período a período, pelo seu mapa e pelos seus sinais.',
    icon: Sunrise,
    section: 'Principal',
    sectionKey: 'principal',
    shortcut: 'G H',
  },
  {
    href: '/semana',
    label: 'Sua semana',
    description:
      'A semana que passou e a que vem pelo seu mapa, com prontidão, sono, prática, reflexões e metas.',
    icon: CalendarRange,
    section: 'Principal',
    sectionKey: 'principal',
  },
  {
    href: '/respiracao',
    label: 'Respiração',
    description:
      'Respiração guiada (4-7-8, quadrada e alternada) com o ritmo real; os minutos entram na sua meditação.',
    icon: Wind,
    section: 'Principal',
    sectionKey: 'principal',
  },
  {
    href: '/plan',
    label: 'Plano de IA',
    description: 'Ações de foco, ritmo, alimentação e recuperação para hoje.',
    icon: Sparkles,
    section: 'Principal',
    sectionKey: 'principal',
    shortcut: 'G P',
  },
  {
    href: '/goals',
    label: 'Metas',
    description: 'Seu progresso, sequências de dias e prioridades.',
    icon: Target,
    section: 'Principal',
    sectionKey: 'principal',
    shortcut: 'G M',
  },
  {
    href: '/appointments',
    label: 'Agendamentos',
    description: 'Consultas, profissionais de referência e próximos horários.',
    icon: CalendarDays,
    section: 'Fluxo guiado',
    sectionKey: 'guidedFlow',
    shortcut: 'G A',
  },
  {
    href: '/monitoring',
    label: 'Monitoramento',
    description: 'Seus sinais em tempo real, com alertas e leitura por voz.',
    icon: Radio,
    section: 'Fluxo guiado',
    sectionKey: 'guidedFlow',
    shortcut: 'G R',
  },
  {
    href: '/chat',
    label: 'Chat IA',
    description:
      'Converse com a Lyra sobre o seu dia, o seu sono e o seu mapa.',
    icon: BrainCircuit,
    section: 'Fluxo guiado',
    sectionKey: 'guidedFlow',
    shortcut: 'G C',
  },
  {
    href: '/connect',
    label: 'Dispositivos',
    description: 'Relógios, cintas cardíacas e outras fontes de dados.',
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
    href: '/admin/fiscal',
    label: 'Registros fiscais',
    description:
      'Faturas pagas guardadas por obrigação legal (somente leitura).',
    icon: Receipt,
    section: 'Administração',
    sectionKey: 'admin',
    adminOnly: true,
  },
  {
    href: '/admin/page-builder',
    label: 'Construtor UI',
    description: 'Textos, tamanhos e seções da landing, do login e do app.',
    icon: LayoutDashboard,
    section: 'Administração',
    sectionKey: 'admin',
    adminOnly: true,
  },
  {
    href: '/admin/puck',
    label: 'Editor Puck',
    description:
      'Blocos visuais das páginas, com rascunho, publicação e histórico.',
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

  // Páginas novas que ainda não estão na configuração salva pelo
  // administrador entram logo depois da página que as antecede na navegação
  // padrão (ex.: "Meu dia" depois do Dashboard), e não no fim da lista.
  const result: NavigationDefinition[] = [...configuredItems];
  navigationItems.forEach((item, index) => {
    if (configuredHrefs.has(item.href)) return;
    const missing = {
      ...item,
      section: getSectionLabel(item.sectionKey, appConfig) ?? item.section,
      visible: true,
    };
    const previousHref = navigationItems
      .slice(0, index)
      .reverse()
      .find((candidate) =>
        result.some((existing) => existing.href === candidate.href)
      )?.href;
    const position = previousHref
      ? result.findIndex((existing) => existing.href === previousHref) + 1
      : result.length;
    result.splice(position, 0, missing);
  });

  return result;
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
