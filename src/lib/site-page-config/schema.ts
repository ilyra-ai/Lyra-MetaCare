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

export const landingPageConfigSchema = z.object({
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
export type SitePageKey = 'landing' | 'login';
export type SitePageConfigMap = {
  landing: LandingPageConfig;
  login: LoginPageConfig;
};

const defaultLandingPageConfig: LandingPageConfig = {
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

const defaultPageConfigByKey = {
  landing: defaultLandingPageConfig,
  login: defaultLoginPageConfig,
} satisfies SitePageConfigMap;

const pageConfigSchemaByKey = {
  landing: landingPageConfigSchema,
  login: loginPageConfigSchema,
};

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
  return pageConfigSchemaByKey[pageKey].safeParse(input);
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
