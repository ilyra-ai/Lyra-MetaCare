import { z } from 'zod';

import { getDefaultPageConfig } from './defaults';

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

const pageConfigSchemaByKey = {
  landing: landingPageConfigSchema,
  login: loginPageConfigSchema,
  app: internalAppPageConfigSchema,
} as const;

// Os valores padrão vivem em ./defaults (sem Zod), para que o cliente os use
// sem baixar o validador; continuam exportados por aqui para o servidor.
export { getDefaultPageConfig };

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
