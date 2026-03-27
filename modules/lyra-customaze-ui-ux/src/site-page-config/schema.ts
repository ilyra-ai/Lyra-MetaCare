import { z } from 'zod';

const builderIconKeySchema = z.enum([
  'sparkles',
  'moonStar',
  'bot',
  'brain',
  'heartPulse',
  'calendar',
  'star',
  'shield',
  'gem',
  'waves',
  'sun',
  'messageCircle',
  'zap',
]);

const toneKeySchema = z.enum(['primary', 'accent', 'cosmic', 'golden', 'soft']);

const landingSectionKeySchema = z.enum([
  'features',
  'metrics',
  'flow',
  'plans',
  'faq',
  'finalCta',
]);

const contentItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: builderIconKeySchema,
  tone: toneKeySchema,
});

const landingMetricItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  source: z.enum([
    'planCount',
    'featureCount',
    'categoryCount',
    'checkoutCount',
    'custom',
  ]),
  customValue: z.string().default(''),
  note: z.string().default(''),
  tone: toneKeySchema,
});

const landingStepItemSchema = z.object({
  id: z.string().min(1),
  step: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: builderIconKeySchema,
});

const faqItemSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
});

const loginHighlightItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: builderIconKeySchema,
  tone: toneKeySchema,
});

const typographyScaleSchema = z.number().min(0.8).max(1.4);

const landingTypographySchema = z.object({
  heroTitle: typographyScaleSchema,
  heroBody: typographyScaleSchema,
  sectionTitle: typographyScaleSchema,
  sectionBody: typographyScaleSchema,
  cardTitle: typographyScaleSchema,
  cardBody: typographyScaleSchema,
  buttonLabel: typographyScaleSchema,
});

const loginTypographySchema = z.object({
  introTitle: typographyScaleSchema,
  introBody: typographyScaleSchema,
  highlightTitle: typographyScaleSchema,
  highlightBody: typographyScaleSchema,
  authTitle: typographyScaleSchema,
  authBody: typographyScaleSchema,
  fieldLabel: typographyScaleSchema,
  buttonLabel: typographyScaleSchema,
  footerText: typographyScaleSchema,
});

const elementScaleSchema = z.number().min(0.8).max(1.4);

const landingSizingSchema = z.object({
  heroCard: elementScaleSchema,
  featureCard: elementScaleSchema,
  planCard: elementScaleSchema,
  iconScale: elementScaleSchema,
  buttonScale: elementScaleSchema,
});

const loginSizingSchema = z.object({
  introCard: elementScaleSchema,
  authCard: elementScaleSchema,
  iconScale: elementScaleSchema,
  buttonScale: elementScaleSchema,
});

const appNavigationItemSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  visible: z.boolean(),
});

const appTypographySchema = z.object({
  pageTitle: typographyScaleSchema,
  pageBody: typographyScaleSchema,
  cardTitle: typographyScaleSchema,
  cardBody: typographyScaleSchema,
  buttonLabel: typographyScaleSchema,
  navLabel: typographyScaleSchema,
});

const appSizingSchema = z.object({
  sidebarWidth: z.number().min(240).max(360),
  cardScale: elementScaleSchema,
  iconScale: elementScaleSchema,
  tableScale: elementScaleSchema,
  buttonScale: elementScaleSchema,
});

const appPageConfigSchema = z.object({
  typography: appTypographySchema,
  sizing: appSizingSchema,
  sidebar: z.object({
    brandTitle: z.string().min(1),
    brandEyebrow: z.string().min(1),
    statusEyebrow: z.string().min(1),
    statusTitle: z.string().min(1),
    preferencesTitle: z.string().min(1),
    preferencesDescription: z.string().min(1),
    sectionLabels: z.object({
      principal: z.string().min(1),
      guidedFlow: z.string().min(1),
      personal: z.string().min(1),
      admin: z.string().min(1),
    }),
    items: z.array(appNavigationItemSchema).min(1),
  }),
  header: z.object({
    commandPlaceholder: z.string().min(1),
    commandShortcutLabel: z.string().min(1),
    assistantLabel: z.string().min(1),
    profileMenuLabel: z.string().min(1),
  }),
  dashboard: z.object({
    heroEyebrow: z.string().min(1),
    heroDescription: z.string().min(1),
    harmonyEyebrow: z.string().min(1),
    harmonyNote: z.string().min(1),
    pulseBadge: z.string().min(1),
    pulseTitle: z.string().min(1),
    pulseDescription: z.string().min(1),
    syncButtonLabel: z.string().min(1),
    syncStatusLoading: z.string().min(1),
    syncStatusPartial: z.string().min(1),
    syncStatusReady: z.string().min(1),
    astroBadge: z.string().min(1),
    astroCardFallbackTitle: z.string().min(1),
    astroCardFallbackDescription: z.string().min(1),
    astroInsightLabel: z.string().min(1),
    astroInsightFallback: z.string().min(1),
    sleepBadge: z.string().min(1),
    sleepDescription: z.string().min(1),
    sleepEmptyDescription: z.string().min(1),
    sleepGoalLabel: z.string().min(1),
    deepSleepLabel: z.string().min(1),
    remSleepLabel: z.string().min(1),
    sleepInsightFallback: z.string().min(1),
    weeklyBadge: z.string().min(1),
    weeklyTitle: z.string().min(1),
    weeklyDescription: z.string().min(1),
    aiUnlockedLabel: z.string().min(1),
    aiUnlockedYes: z.string().min(1),
    aiUnlockedNo: z.string().min(1),
    currentReadinessLabel: z.string().min(1),
    longevityLabel: z.string().min(1),
    liveContextLabel: z.string().min(1),
    liveContextFallback: z.string().min(1),
    pillarsTitle: z.string().min(1),
    pillarsDescription: z.string().min(1),
    emptyMetricsTitle: z.string().min(1),
    emptyMetricsDescription: z.string().min(1),
  }),
  appointments: z.object({
    heroBadge: z.string().min(1),
    heroTitle: z.string().min(1),
    heroDescription: z.string().min(1),
    listTitle: z.string().min(1),
    listDescription: z.string().min(1),
    professionalsTitle: z.string().min(1),
    professionalsDescription: z.string().min(1),
    calendarTitle: z.string().min(1),
    calendarDescription: z.string().min(1),
    showUpcomingList: z.boolean(),
    showProfessionalsList: z.boolean(),
    showCalendar: z.boolean(),
  }),
  aiPlan: z.object({
    pageEyebrow: z.string().min(1),
    pageTitle: z.string().min(1),
    pageDescription: z.string().min(1),
    heroBadge: z.string().min(1),
    heroEmptyTitle: z.string().min(1),
    heroReadyTitle: z.string().min(1),
    heroEmptyDescription: z.string().min(1),
    generateButtonLabel: z.string().min(1),
    regenerateButtonLabel: z.string().min(1),
    generatingButtonLabel: z.string().min(1),
    syncingButtonLabel: z.string().min(1),
    pillarsCountLabel: z.string().min(1),
    recommendationsLabel: z.string().min(1),
    signalsLabel: z.string().min(1),
    liveContextBadge: z.string().min(1),
    liveContextTitleFallback: z.string().min(1),
    liveContextDescriptionFallback: z.string().min(1),
    persistenceTitle: z.string().min(1),
    persistenceDescription: z.string().min(1),
    emptyLocalAiTitle: z.string().min(1),
    emptyLocalAiDescription: z.string().min(1),
    emptyAstroTitle: z.string().min(1),
    emptyAstroDescription: z.string().min(1),
    emptyPersistenceTitle: z.string().min(1),
    emptyPersistenceDescription: z.string().min(1),
  }),
  monitoring: z.object({
    pageEyebrow: z.string().min(1),
    pageTitle: z.string().min(1),
    pageDescription: z.string().min(1),
    heroBadge: z.string().min(1),
    heroTitle: z.string().min(1),
    heroDescription: z.string().min(1),
    infoTitle: z.string().min(1),
    infoDescription: z.string().min(1),
    controlsTitle: z.string().min(1),
    controlsDescription: z.string().min(1),
    alertsTitle: z.string().min(1),
    alertsDescription: z.string().min(1),
    showEventFeed: z.boolean(),
    showVoiceButton: z.boolean(),
    showAlertsButton: z.boolean(),
  }),
  chat: z.object({
    pageEyebrow: z.string().min(1),
    pageTitle: z.string().min(1),
    pageDescription: z.string().min(1),
    assistantTitle: z.string().min(1),
    assistantStatusLabel: z.string().min(1),
    assistantStatusNote: z.string().min(1),
    integrationsButtonLabel: z.string().min(1),
    integrationsTitle: z.string().min(1),
    integrationsDescription: z.string().min(1),
    welcomeMessage: z.string().min(1),
    quickRepliesTitle: z.string().min(1),
    quickRepliesDescription: z.string().min(1),
    inputPlaceholder: z.string().min(1),
    emptyStateHint: z.string().min(1),
    quickReplies: z.array(z.string().min(1)).min(1),
    showIntegrations: z.boolean(),
    showQuickReplies: z.boolean(),
  }),
  connect: z.object({
    pageEyebrow: z.string().min(1),
    pageTitle: z.string().min(1),
    pageDescription: z.string().min(1),
    cardTitle: z.string().min(1),
    cardDescription: z.string().min(1),
    idleTitle: z.string().min(1),
    idleDescription: z.string().min(1),
    unsupportedTitle: z.string().min(1),
    unsupportedDescription: z.string().min(1),
    connectButtonLabel: z.string().min(1),
    connectingTitle: z.string().min(1),
    connectingDescription: z.string().min(1),
    connectingButtonLabel: z.string().min(1),
    connectedTitle: z.string().min(1),
    connectedDescription: z.string().min(1),
    connectedAlertTitle: z.string().min(1),
    connectedAlertDescription: z.string().min(1),
    disconnectButtonLabel: z.string().min(1),
    errorTitle: z.string().min(1),
    errorDescription: z.string().min(1),
    retryButtonLabel: z.string().min(1),
  }),
  profile: z.object({
    pageEyebrow: z.string().min(1),
    pageTitle: z.string().min(1),
    pageDescription: z.string().min(1),
  }),
});

export const landingPageConfigSchema = z.object({
  typography: landingTypographySchema,
  sizing: landingSizingSchema,
  header: z.object({
    loginLabel: z.string().min(1),
    fullLoginLabel: z.string().min(1),
  }),
  hero: z.object({
    badgeText: z.string().min(1),
    title: z.string().min(1),
    accentTitle: z.string().min(1),
    description: z.string().min(1),
    primaryCtaLabel: z.string().min(1),
    primaryCtaHref: z.string().min(1),
    secondaryCtaLabel: z.string().min(1),
    secondaryCtaHref: z.string().min(1),
    quickAuthBadge: z.string().min(1),
    quickAuthTitle: z.string().min(1),
    quickAuthDescription: z.string().min(1),
    quickAuthSubmitLabel: z.string().min(1),
    quickAuthSecondaryLabel: z.string().min(1),
    previewBadge: z.string().min(1),
    previewTitle: z.string().min(1),
    previewDescription: z.string().min(1),
    previewItems: z.array(contentItemSchema),
  }),
  features: z.object({
    visible: z.boolean(),
    badgeText: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(contentItemSchema),
  }),
  metrics: z.object({
    visible: z.boolean(),
    badgeText: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(landingMetricItemSchema),
  }),
  flow: z.object({
    visible: z.boolean(),
    badgeText: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(landingStepItemSchema),
  }),
  plans: z.object({
    visible: z.boolean(),
    badgeText: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  faq: z.object({
    visible: z.boolean(),
    badgeText: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(faqItemSchema),
  }),
  finalCta: z.object({
    visible: z.boolean(),
    badgeText: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    primaryLabel: z.string().min(1),
    primaryHref: z.string().min(1),
    secondaryLabel: z.string().min(1),
    secondaryHref: z.string().min(1),
  }),
  footer: z.object({
    brandLine: z.string().min(1),
    note: z.string().min(1),
  }),
  sectionOrder: z.array(landingSectionKeySchema).min(1),
});

export const loginPageConfigSchema = z.object({
  typography: loginTypographySchema,
  sizing: loginSizingSchema,
  intro: z.object({
    visible: z.boolean(),
    badgeText: z.string().min(1),
    title: z.string().min(1),
    accentTitle: z.string().min(1),
    description: z.string().min(1),
    noteEyebrow: z.string().min(1),
    noteText: z.string().min(1),
    highlights: z.array(loginHighlightItemSchema),
  }),
  auth: z.object({
    badgeText: z.string().min(1),
    brandText: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    loginTabLabel: z.string().min(1),
    registerTabLabel: z.string().min(1),
    emailLabel: z.string().min(1),
    passwordLabel: z.string().min(1),
    firstNameLabel: z.string().min(1),
    lastNameLabel: z.string().min(1),
    loginButtonLabel: z.string().min(1),
    registerButtonLabel: z.string().min(1),
    footerEyebrow: z.string().min(1),
    footerText: z.string().min(1),
    backToLandingLabel: z.string().min(1),
  }),
});

export const internalAppPageConfigSchema = appPageConfigSchema;

export type BuilderIconKey = z.infer<typeof builderIconKeySchema>;
export type ToneKey = z.infer<typeof toneKeySchema>;
export type LandingSectionKey = z.infer<typeof landingSectionKeySchema>;
export type ContentItem = z.infer<typeof contentItemSchema>;
export type LandingMetricItem = z.infer<typeof landingMetricItemSchema>;
export type LandingStepItem = z.infer<typeof landingStepItemSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type LoginHighlightItem = z.infer<typeof loginHighlightItemSchema>;
export type LandingPageConfig = z.infer<typeof landingPageConfigSchema>;
export type LoginPageConfig = z.infer<typeof loginPageConfigSchema>;
export type LandingTypographyConfig = z.infer<typeof landingTypographySchema>;
export type LoginTypographyConfig = z.infer<typeof loginTypographySchema>;
export type LandingSizingConfig = z.infer<typeof landingSizingSchema>;
export type LoginSizingConfig = z.infer<typeof loginSizingSchema>;
export type AppNavigationItemConfig = z.infer<typeof appNavigationItemSchema>;
export type AppPageConfig = z.infer<typeof appPageConfigSchema>;
export type AppTypographyConfig = z.infer<typeof appTypographySchema>;
export type AppSizingConfig = z.infer<typeof appSizingSchema>;
export const sitePageKeys = ['landing', 'login', 'app'] as const;
export type SitePageKey = (typeof sitePageKeys)[number];
export type SitePageConfigMap = {
  landing: LandingPageConfig;
  login: LoginPageConfig;
  app: AppPageConfig;
};

export function isSitePageKey(value: string): value is SitePageKey {
  return (sitePageKeys as readonly string[]).includes(value);
}

const defaultLandingPageConfig: LandingPageConfig = {
  typography: {
    heroTitle: 1,
    heroBody: 1,
    sectionTitle: 1,
    sectionBody: 1,
    cardTitle: 1,
    cardBody: 1,
    buttonLabel: 1,
  },
  sizing: {
    heroCard: 1,
    featureCard: 1,
    planCard: 1,
    iconScale: 1,
    buttonScale: 1,
  },
  header: {
    loginLabel: 'Entrar',
    fullLoginLabel: 'Tela completa',
  },
  hero: {
    badgeText: 'uma experiencia clara, gentil e muito mais editavel',
    title: 'Seu bem-estar ganha uma casa',
    accentTitle: 'mais linda, harmoniosa e inteligente.',
    description:
      'A Lyra MetaCare une astrologia vedica, IA e sinais da sua rotina numa interface clara, doce e premium, feita para acolher sem cansar.',
    primaryCtaLabel: 'Entrar na experiencia completa',
    primaryCtaHref: '/login',
    secondaryCtaLabel: 'Ver catalogo publicado',
    secondaryCtaHref: '#planos',
    quickAuthBadge: 'entrada rapida',
    quickAuthTitle: 'Entrar direto pela landing',
    quickAuthDescription:
      'Uma entrada suave e organizada para quem ja quer cair direto na propria orbita.',
    quickAuthSubmitLabel: 'Entrar agora',
    quickAuthSecondaryLabel: 'Abrir tela completa',
    previewBadge: 'preview vivo',
    previewTitle: 'Blocos leves, lindos e editaveis',
    previewDescription:
      'O novo painel administrativo vai permitir mexer em textos, cards, etapas, FAQ e hierarquia visual sem tocar no codigo.',
    previewItems: [
      {
        id: 'landing-preview-1',
        title: 'Astrologia moderna',
        description: 'Simbolismo claro, luminoso e atualizado.',
        icon: 'moonStar',
        tone: 'cosmic',
      },
      {
        id: 'landing-preview-2',
        title: 'IA acolhedora',
        description: 'Tecnologia com presenca e sem peso visual.',
        icon: 'brain',
        tone: 'primary',
      },
      {
        id: 'landing-preview-3',
        title: 'Fluxo editavel',
        description: 'Cards, chamadas e secoes sob seu controle.',
        icon: 'sparkles',
        tone: 'accent',
      },
    ],
  },
  features: {
    visible: true,
    badgeText: 'Recursos em destaque',
    title: 'Menos peso visual, mais clareza, mais ternura e mais intencao.',
    description:
      'A landing passa a respirar melhor, com secoes mais simples e um ritmo visual mais bonito de acompanhar.',
    items: [
      {
        id: 'landing-feature-1',
        title: 'IA com presenca gentil',
        description:
          'A tecnologia organiza sua jornada com leveza, sem roubar o protagonismo da experiencia.',
        icon: 'brain',
        tone: 'primary',
      },
      {
        id: 'landing-feature-2',
        title: 'Astrologia moderna e luminosa',
        description:
          'Ciclos e simbolismos aparecem com visual claro, sofisticado e atual.',
        icon: 'moonStar',
        tone: 'cosmic',
      },
      {
        id: 'landing-feature-3',
        title: 'Sinais do corpo com contexto',
        description:
          'Sono, energia e ritmo passam a conversar dentro de uma hierarquia mais acolhedora.',
        icon: 'heartPulse',
        tone: 'accent',
      },
    ],
  },
  metrics: {
    visible: true,
    badgeText: 'Metricas publicas',
    title: 'Os numeros da vitrine continuam reais e sincronizados.',
    description:
      'Esta faixa usa os dados publicados dos planos para mostrar a saude comercial da experiencia sem inventar prova social.',
    items: [
      {
        id: 'landing-metric-1',
        label: 'planos publicados',
        source: 'planCount',
        customValue: '',
        note: 'Lidos do catalogo publico.',
        tone: 'primary',
      },
      {
        id: 'landing-metric-2',
        label: 'capacidades ativas',
        source: 'featureCount',
        customValue: '',
        note: 'Somatorio real das features habilitadas.',
        tone: 'accent',
      },
      {
        id: 'landing-metric-3',
        label: 'categorias funcionais',
        source: 'categoryCount',
        customValue: '',
        note: 'Categorias extraidas dos planos reais.',
        tone: 'cosmic',
      },
      {
        id: 'landing-metric-4',
        label: 'checkout conectado',
        source: 'checkoutCount',
        customValue: '',
        note: 'Planos com integracao comercial pronta.',
        tone: 'golden',
      },
    ],
  },
  flow: {
    visible: true,
    badgeText: 'Como a jornada se abre',
    title: 'Tudo foi pensado para parecer natural, bonito e facil de editar.',
    description:
      'O fluxo abaixo tambem fica totalmente configuravel, com cards, ordens e textos sob gestao administrativa.',
    items: [
      {
        id: 'landing-step-1',
        step: '01',
        title: 'Abra sua orbita',
        description:
          'Seu cadastro cria um espaco pessoal para sinais, preferencias e contexto simbolico.',
        icon: 'sparkles',
      },
      {
        id: 'landing-step-2',
        step: '02',
        title: 'Conecte seu contexto',
        description:
          'Rotina, sinais e preferencias alimentam uma leitura mais delicada e coerente.',
        icon: 'heartPulse',
      },
      {
        id: 'landing-step-3',
        step: '03',
        title: 'Receba orientacao com IA',
        description:
          'Chat, planos e proximos passos ganham clareza sem excesso visual.',
        icon: 'bot',
      },
    ],
  },
  plans: {
    visible: true,
    badgeText: 'Catalogo publico sincronizado',
    title: 'Planos reais do produto com uma vitrine mais linda e organizada.',
    description:
      'O bloco de planos continua conectado ao MySQL e pode ser reposicionado sem perder a fonte real.',
    ctaLabel: 'Entrar e continuar',
  },
  faq: {
    visible: true,
    badgeText: 'FAQ',
    title: 'Perguntas importantes antes de entrar.',
    description:
      'A ideia aqui e manter a landing bonita, sincera e util desde o primeiro contato.',
    items: [
      {
        id: 'landing-faq-1',
        question: 'A landing usa dados reais do produto?',
        answer:
          'Sim. O catalogo abaixo e carregado por rota publica ligada ao MySQL desta instancia.',
      },
      {
        id: 'landing-faq-2',
        question: 'Existe login direto pela landing?',
        answer: 'Sim. O card inicial permite entrada real sem sair da landing.',
      },
      {
        id: 'landing-faq-3',
        question: 'O admin vai poder editar tudo depois?',
        answer:
          'Sim. O novo editor administrativo salva rascunho, publica e permite ajuste fino via formularios e JSON validado.',
      },
    ],
  },
  finalCta: {
    visible: true,
    badgeText: 'Orbita final',
    title: 'Uma landing mais amiga, linda, organizada e pronta para receber.',
    description:
      'O foco agora e beleza com sentido: mais harmonia, mais contexto e uma primeira impressao que abraca em vez de confundir.',
    primaryLabel: 'Abrir Lyra agora',
    primaryHref: '/login',
    secondaryLabel: 'Explorar a experiencia',
    secondaryHref: '#recursos',
  },
  footer: {
    brandLine: 'lyra metacare',
    note: 'Feito com leveza, intencao e tecnologia pela iLyra AI.',
  },
  sectionOrder: ['features', 'metrics', 'flow', 'plans', 'faq', 'finalCta'],
};

const defaultLoginPageConfig: LoginPageConfig = {
  typography: {
    introTitle: 1,
    introBody: 1,
    highlightTitle: 1,
    highlightBody: 1,
    authTitle: 1,
    authBody: 1,
    fieldLabel: 1,
    buttonLabel: 1,
    footerText: 1,
  },
  sizing: {
    introCard: 1,
    authCard: 1,
    iconScale: 1,
    buttonScale: 1,
  },
  intro: {
    visible: true,
    badgeText: 'uma entrada mais doce, clara e acolhedora',
    title: 'Que bom te ver por aqui.',
    accentTitle: 'Sua orbita Lyra esta pronta para receber voce.',
    description:
      'Esta tela foi redesenhada para parecer mais harmoniosa, organizada e carinhosa: menos dureza visual, mais respiro e mais vontade de entrar.',
    noteEyebrow: 'Lyra MetaCare',
    noteText:
      'Um espaco para unir simbolismo, tecnologia e bem-estar em uma experiencia mais bonita e facil de habitar.',
    highlights: [
      {
        id: 'login-highlight-1',
        title: 'Atmosfera clara',
        description:
          'O tema se mantem luminoso, sereno e gostoso de olhar por muito tempo.',
        icon: 'sun',
        tone: 'primary',
      },
      {
        id: 'login-highlight-2',
        title: 'IA com delicadeza',
        description:
          'Tecnologia presente para orientar sem transformar a tela em algo frio.',
        icon: 'bot',
        tone: 'cosmic',
      },
      {
        id: 'login-highlight-3',
        title: 'Fluxo organizado',
        description:
          'Entrar, criar conta e seguir com menos atrito e mais clareza.',
        icon: 'zap',
        tone: 'accent',
      },
    ],
  },
  auth: {
    badgeText: 'auth vivo',
    brandText: 'lyra',
    title: 'Entre ou crie sua conta com calma.',
    description:
      'Tudo aqui foi reorganizado para ficar mais fluido, mais fofo e mais convidativo, sem perder o rigor do fluxo real de autenticacao.',
    loginTabLabel: 'Entrar',
    registerTabLabel: 'Criar conta',
    emailLabel: 'Email',
    passwordLabel: 'Senha',
    firstNameLabel: 'Nome',
    lastNameLabel: 'Sobrenome',
    loginButtonLabel: 'Entrar na Lyra',
    registerButtonLabel: 'Criar minha conta',
    footerEyebrow: 'entrada organizada',
    footerText:
      'Sem atalhos vazios, sem botao sem funcao e sem ruido visual desnecessario. Apenas o fluxo real, com mais beleza e acolhimento.',
    backToLandingLabel: 'Voltar para a landing',
  },
};

const defaultAppPageConfig: AppPageConfig = {
  typography: {
    pageTitle: 1,
    pageBody: 1,
    cardTitle: 1,
    cardBody: 1,
    buttonLabel: 1,
    navLabel: 1,
  },
  sizing: {
    sidebarWidth: 288,
    cardScale: 1,
    iconScale: 1,
    tableScale: 1,
    buttonScale: 1,
  },
  sidebar: {
    brandTitle: 'lyra',
    brandEyebrow: 'metacare 2026',
    statusEyebrow: 'Estado do dia',
    statusTitle: 'Janela de foco, leveza e recuperação alta',
    preferencesTitle: 'Preferências e acesso',
    preferencesDescription:
      'Ajuste perfil, hábitos e configurações do ambiente.',
    sectionLabels: {
      principal: 'Principal',
      guidedFlow: 'Fluxo Guiado',
      personal: 'Pessoal',
      admin: 'Administração',
    },
    items: [
      {
        href: '/',
        label: 'Dashboard',
        description: 'Visão central da energia, sono, astro e insights de IA.',
        visible: true,
      },
      {
        href: '/plan',
        label: 'Plano de IA',
        description:
          'Protocolos personalizados de foco, ritmo, nutrição e recuperação.',
        visible: true,
      },
      {
        href: '/goals',
        label: 'Metas',
        description:
          'Evolução diária com progresso, streaks e prioridades suaves.',
        visible: true,
      },
      {
        href: '/appointments',
        label: 'Agendamentos',
        description:
          'Agenda de encontros, profissionais e organização do seu fluxo.',
        visible: true,
      },
      {
        href: '/monitoring',
        label: 'Monitoramento',
        description: 'Leituras em tempo real, tendências e estados do momento.',
        visible: true,
      },
      {
        href: '/chat',
        label: 'Chat IA',
        description:
          'Conversa inteligente com contexto biométrico, emocional e astral.',
        visible: true,
      },
      {
        href: '/connect',
        label: 'Dispositivos',
        description: 'Conexão e sincronização com wearables e integrações.',
        visible: true,
      },
      {
        href: '/profile',
        label: 'Perfil',
        description: 'Dados pessoais, hábitos, preferências e avatar.',
        visible: true,
      },
      {
        href: '/admin/dashboard',
        label: 'Visão Geral Admin',
        description: 'Métricas de negócio, saúde da plataforma e alertas.',
        visible: true,
      },
      {
        href: '/admin/users',
        label: 'Usuários',
        description: 'Gestão de contas, perfis e permissões.',
        visible: true,
      },
      {
        href: '/admin/plans',
        label: 'Planos',
        description: 'Matriz comercial, capacidades e precificação.',
        visible: true,
      },
      {
        href: '/admin/data-health',
        label: 'Saúde dos Dados',
        description: 'Integridade, latência e confiabilidade dos dados.',
        visible: true,
      },
      {
        href: '/admin/content',
        label: 'Conteúdo',
        description:
          'Curadoria operacional de hábitos, mensagens e recomendações.',
        visible: true,
      },
      {
        href: '/admin/ai-config',
        label: 'Configuração de IA',
        description: 'Pesos, missão, parâmetros e segurança operacional da IA.',
        visible: true,
      },
      {
        href: '/admin/reports',
        label: 'Relatórios',
        description: 'Leituras analíticas e exportação executiva.',
        visible: true,
      },
      {
        href: '/admin/page-builder',
        label: 'Construtor UI',
        description: 'Gestão do design visual do app, da landing e do login.',
        visible: true,
      },
    ],
  },
  header: {
    commandPlaceholder: 'Buscar páginas, fluxos e ações',
    commandShortcutLabel: 'Ctrl K',
    assistantLabel: 'Chat IA',
    profileMenuLabel: 'Meu perfil',
  },
  dashboard: {
    heroEyebrow: 'Santuário digital de bem-estar',
    heroDescription:
      'Sua leitura do dia reúne biometria, sono, energia, astrologia védica e protocolos orientados por IA em uma visão premium, clara e acionável.',
    harmonyEyebrow: 'Harmonia atual',
    harmonyNote: 'Janela de recuperação alta nas últimas 24 horas',
    pulseBadge: 'Pulso do dia',
    pulseTitle: 'Sua cadência corporal está em foco.',
    pulseDescription:
      'Uma leitura clara do que merece sua energia agora, unindo biometria, IA e atmosfera cósmica sem ruído visual.',
    syncButtonLabel: 'Reavaliar agora',
    syncStatusLoading: 'Sincronizando',
    syncStatusPartial: 'Parcial',
    syncStatusReady: 'Em sintonia',
    astroBadge: 'Céu do momento',
    astroCardFallbackTitle: 'Céu do momento',
    astroCardFallbackDescription:
      'O contexto astrológico do momento será mostrado assim que a orquestração local terminar.',
    astroInsightLabel: 'Leitura gentil',
    astroInsightFallback:
      'Assim que o cálculo astrológico terminar, esta área mostra um resumo prático do céu para seu corpo e sua rotina.',
    sleepBadge: 'Sono restaurador',
    sleepDescription:
      'Uma visão delicada do quanto seu descanso sustentou a energia de hoje.',
    sleepEmptyDescription:
      'Conecte uma fonte real de sono para destravar esta leitura.',
    sleepGoalLabel: 'Meta sugerida',
    deepSleepLabel: 'Sono profundo',
    remSleepLabel: 'Sono REM',
    sleepInsightFallback:
      'O painel de sono cruza duração, profundidade e o momento astrológico atual para sugerir um ritmo mais doce.',
    weeklyBadge: 'Trajetória semanal',
    weeklyTitle: 'Como sua prontidão desenhou a semana',
    weeklyDescription:
      'Uma curva simples para enxergar ritmo, recuperação e constância sem poluição visual.',
    aiUnlockedLabel: 'IA liberada',
    aiUnlockedYes: 'sim',
    aiUnlockedNo: 'não',
    currentReadinessLabel: 'Prontidão atual',
    longevityLabel: 'Score de longevidade',
    liveContextLabel: 'Contexto vivo',
    liveContextFallback:
      'O céu do momento será sincronizado aqui assim que a orquestração local terminar.',
    pillarsTitle: 'Pilares profundos da sua saúde',
    pillarsDescription:
      'Esta camada organiza métricas mais técnicas em blocos legíveis, mantendo profundidade sem transformar a tela em ruído.',
    emptyMetricsTitle: 'As métricas do dia ainda não chegaram',
    emptyMetricsDescription:
      'Assim que uma fonte real alimentar `daily_metrics`, este bloco passa a exibir leituras detalhadas sem nenhum preenchimento artificial.',
  },
  appointments: {
    heroBadge: 'agenda viva',
    heroTitle: 'Organize encontros, profissionais e próximos horários',
    heroDescription:
      'Concentre consultas, pessoas de referência e calendário em um fluxo claro e fácil de ajustar.',
    listTitle: 'Próximas consultas',
    listDescription:
      'Acompanhe horários confirmados, contexto do encontro e observações registradas.',
    professionalsTitle: 'Profissionais salvos',
    professionalsDescription:
      'Cadastre, edite e mantenha sua rede de acompanhamento organizada.',
    calendarTitle: 'Calendário da agenda',
    calendarDescription:
      'Visualize seus compromissos por dia e distribua a rotina com mais leveza.',
    showUpcomingList: true,
    showProfessionalsList: true,
    showCalendar: true,
  },
  aiPlan: {
    pageEyebrow: 'orquestracao guiada',
    pageTitle: 'Seu plano de IA',
    pageDescription:
      'Protocolos personalizados de foco, ritmo, nutrição e recuperação, com cruzamento real entre astrologia, biometria e persistência local.',
    heroBadge: 'Orquestração local com astrologia + IA',
    heroEmptyTitle:
      'Vamos desenhar seu próximo passo com elegância e contexto real.',
    heroReadyTitle: 'Seu plano do dia está pronto.',
    heroEmptyDescription:
      'Esta experiência cruza os sinais realmente disponíveis no dispositivo e no banco com o céu atual, gerando um protocolo utilizável e persistido na sua base principal.',
    generateButtonLabel: 'Gerar plano real',
    regenerateButtonLabel: 'Regenerar plano',
    generatingButtonLabel: 'Orquestrando agora',
    syncingButtonLabel: 'Sincronizando sinais',
    pillarsCountLabel: 'Pilares ativos',
    recommendationsLabel: 'Recomendações reais',
    signalsLabel: 'Sinais disponíveis',
    liveContextBadge: 'Contexto vivo',
    liveContextTitleFallback: 'Céu do momento',
    liveContextDescriptionFallback:
      'O contexto astrológico será consolidado localmente ao sincronizar.',
    persistenceTitle: 'Persistência',
    persistenceDescription:
      'O plano é salvo de forma real em `ai_plans` no MySQL desta instância.',
    emptyLocalAiTitle: 'IA local e determinística',
    emptyLocalAiDescription:
      'A geração usa a função local `generate-ai-plan`, sem mock visual e sem plano fictício.',
    emptyAstroTitle: 'Astrologia viva',
    emptyAstroDescription:
      'O céu do momento vem do motor astrológico local e influencia a síntese do protocolo.',
    emptyPersistenceTitle: 'Persistência real',
    emptyPersistenceDescription:
      'Assim que você gerar, o resultado fica salvo e pode ser lido novamente sem simulação.',
  },
  monitoring: {
    pageEyebrow: 'telemetria contínua',
    pageTitle: 'Painel vivo com presença, ritmo e leitura local',
    pageDescription:
      'Acompanhe sinais em tempo real com alertas, voz e histórico recente em uma superfície mais clara e útil.',
    heroBadge: 'fluxo biométrico',
    heroTitle: 'Seus sinais chegam ao painel com contexto imediato',
    heroDescription:
      'A cada pacote recebido, a interface reage, atualiza gráficos e mantém o momento sob leitura local.',
    infoTitle: 'Leitura operacional da Lyra',
    infoDescription:
      'O módulo acompanha o canal local de wearable e organiza alertas e síntese de voz em tempo real.',
    controlsTitle: 'Controles em tempo real',
    controlsDescription:
      'Acione leitura por voz, acompanhe alertas locais e ajuste o comportamento da sessão.',
    alertsTitle: 'Alertas locais',
    alertsDescription:
      'Notificações e sinais de atenção disparam apenas quando os biomarcadores cruzam os limites definidos.',
    showEventFeed: true,
    showVoiceButton: true,
    showAlertsButton: true,
  },
  chat: {
    pageEyebrow: 'conversa contextual',
    pageTitle: 'Converse com a Lyra de um jeito claro, gentil e realmente útil',
    pageDescription:
      'O chat cruza biometria, agenda, contexto do perfil e sinais recentes para responder com mais profundidade, sem perder leveza visual.',
    assistantTitle: 'Assistente Lyra',
    assistantStatusLabel: 'online',
    assistantStatusNote: 'responde em segundos com contexto vivo',
    integrationsButtonLabel: 'Tecnologias vivas',
    integrationsTitle: 'Camadas que sustentam a conversa',
    integrationsDescription:
      'Este painel mostra a base real que alimenta o assistente, para que a conversa continue transparente e ancorada em dados do projeto.',
    welcomeMessage:
      'Olá. Eu sou a Lyra e posso te ajudar com sono, energia, agenda, contexto astral e próximos passos com base nos dados reais disponíveis agora.',
    quickRepliesTitle: 'Sugestões iniciais',
    quickRepliesDescription:
      'Use uma pergunta pronta para começar rápido ou escreva algo totalmente seu.',
    inputPlaceholder: 'Digite ou grave sua mensagem para a Lyra...',
    emptyStateHint:
      'Quando a conversa começa, esta área prioriza clareza, foco e acolhimento sem poluição visual.',
    quickReplies: [
      'Como posso dormir melhor hoje?',
      'Me mostra um resumo do meu ritmo recente.',
      'Quero organizar meus próximos agendamentos.',
    ],
    showIntegrations: true,
    showQuickReplies: true,
  },
  connect: {
    pageEyebrow: 'conexao de sinais reais',
    pageTitle:
      'Conecte wearables e leituras locais com uma experiência mais clara',
    pageDescription:
      'Este módulo organiza a entrada de sinais bluetooth de forma elegante, explicando estado, compatibilidade e próximos passos sem ruído visual.',
    cardTitle: 'Conexão real por Bluetooth',
    cardDescription:
      'Integre sua cinta cardíaca BLE, relógio compatível ou outro wearable apoiado pelo navegador atual.',
    idleTitle: 'Pronto para conectar seu dispositivo',
    idleDescription:
      'Conecte sua cinta cardíaca ou relógio via Bluetooth para destravar métricas reais no monitoramento.',
    unsupportedTitle: 'Bluetooth indisponível neste navegador',
    unsupportedDescription:
      'Use um navegador compatível baseado em Chromium em localhost ou HTTPS para liberar a conexão Web Bluetooth.',
    connectButtonLabel: 'Conectar dispositivo Bluetooth',
    connectingTitle: 'Aguardando a escolha do dispositivo',
    connectingDescription:
      'Selecione seu wearable no prompt do navegador para iniciar a leitura local.',
    connectingButtonLabel: 'Conectando...',
    connectedTitle: 'Conexão estabelecida com sucesso',
    connectedDescription: 'Dispositivo conectado',
    connectedAlertTitle: 'Recebendo dados em tempo real',
    connectedAlertDescription:
      'Assim que os eventos chegarem, o painel de monitoramento passa a refletir as leituras disponíveis.',
    disconnectButtonLabel: 'Desconectar dispositivo',
    errorTitle: 'Erro ao conectar o dispositivo',
    errorDescription:
      'Nao foi possível concluir a conexão Bluetooth. Verifique o dispositivo, o pareamento e tente novamente.',
    retryButtonLabel: 'Tentar novamente',
  },
  profile: {
    pageEyebrow: 'identidade pessoal',
    pageTitle: 'Seu perfil, hábitos e contexto em um só lugar',
    pageDescription:
      'Atualize dados pessoais, nascimento, hábitos e histórico com uma experiência mais organizada e acolhedora.',
  },
};

const defaultPageConfigByKey = {
  landing: defaultLandingPageConfig,
  login: defaultLoginPageConfig,
  app: defaultAppPageConfig,
} satisfies SitePageConfigMap;

const pageConfigSchemaByKey = {
  landing: landingPageConfigSchema,
  login: loginPageConfigSchema,
  app: internalAppPageConfigSchema,
} as const;

function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getDefaultPageConfig<TKey extends SitePageKey>(
  pageKey: TKey
): SitePageConfigMap[TKey] {
  return cloneConfig(defaultPageConfigByKey[pageKey]);
}

export function validatePageConfig<TKey extends SitePageKey>(
  pageKey: TKey,
  input: unknown
) {
  const schema = pageConfigSchemaByKey[pageKey] as unknown as z.ZodType<
    SitePageConfigMap[TKey]
  >;

  return schema.safeParse(input);
}

export function parsePageConfig<TKey extends SitePageKey>(
  pageKey: TKey,
  input: unknown
): SitePageConfigMap[TKey] {
  const result = validatePageConfig(pageKey, input);
  if (!result.success) {
    return getDefaultPageConfig(pageKey);
  }
  return result.data as SitePageConfigMap[TKey];
}
