import type {
  AppPageConfig,
  LandingPageConfig,
  LoginPageConfig,
  SitePageConfigMap,
  SitePageKey,
} from './schema';

/**
 * Configurações padrão das páginas (landing, login e app), sem dependência
 * de runtime do Zod: os tipos vêm de `./schema` apenas como tipos (apagados
 * na compilação). Assim os componentes do cliente obtêm os valores iniciais
 * sem baixar o Zod; a validação continua no servidor (`./schema` e
 * `src/lib/site-page-config/service.ts`).
 *
 * Os textos são para a pessoa que usa o app (tarefa 53): sem nomes de
 * tabelas, funções ou detalhes de implementação. As descrições do menu
 * espelham as de `src/components/layout/navigation.ts`.
 */

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
    fullLoginLabel: 'Começar',
  },
  hero: {
    badgeText: 'Bem-estar, longevidade e autoconhecimento',
    title: 'Seu corpo, sua rotina e o seu céu',
    accentTitle: 'em um só lugar, com orientação clara para cada dia.',
    description:
      'A Lyra MetaCare reúne sono, energia e ritmo com a astrologia védica do seu mapa para sugerir o que fazer hoje, em linguagem simples. Não substitui avaliação profissional de saúde.',
    primaryCtaLabel: 'Começar agora',
    primaryCtaHref: '/login',
    secondaryCtaLabel: 'Ver planos',
    secondaryCtaHref: '#planos',
    quickAuthBadge: 'Já tem conta?',
    quickAuthTitle: 'Entre por aqui',
    quickAuthDescription: 'Use o seu email e a sua senha para abrir o seu dia.',
    quickAuthSubmitLabel: 'Entrar',
    quickAuthSecondaryLabel: 'Criar conta',
    previewBadge: 'O que você recebe',
    previewTitle: 'Um guia diário feito para você',
    previewDescription:
      'Toda manhã a Lyra cruza os seus dados com o céu do seu mapa e mostra o essencial.',
    previewItems: [
      {
        id: 'landing-preview-1',
        title: 'Seu dia em poucas linhas',
        description: 'Os melhores horários e o clima do dia.',
        icon: 'moonStar',
        tone: 'cosmic',
      },
      {
        id: 'landing-preview-2',
        title: 'A Lyra para conversar',
        description: 'Tire dúvidas sobre sono, energia e rotina.',
        icon: 'brain',
        tone: 'primary',
      },
      {
        id: 'landing-preview-3',
        title: 'Um plano que acompanha você',
        description: 'Metas e hábitos ajustados ao seu ritmo.',
        icon: 'sparkles',
        tone: 'accent',
      },
    ],
  },
  features: {
    visible: true,
    badgeText: 'Recursos',
    title: 'O que ajuda você a cuidar de si, sem complicação.',
    description:
      'Dados do corpo, rotina e autoconhecimento conversando entre si para sugerir os próximos passos.',
    items: [
      {
        id: 'landing-feature-1',
        title: 'Leitura do dia',
        description:
          'O céu do seu mapa traduzido em conselhos práticos para hoje.',
        icon: 'moonStar',
        tone: 'cosmic',
      },
      {
        id: 'landing-feature-2',
        title: 'Sinais do corpo com contexto',
        description:
          'Sono, energia e batimentos lidos juntos, e não cada um isolado.',
        icon: 'heartPulse',
        tone: 'accent',
      },
      {
        id: 'landing-feature-3',
        title: 'A Lyra como guia',
        description:
          'Uma conversa que conhece o seu dia e responde com cuidado.',
        icon: 'brain',
        tone: 'primary',
      },
    ],
  },
  metrics: {
    visible: true,
    badgeText: 'A Lyra em números',
    title: 'O que os nossos planos oferecem hoje',
    description: 'Números lidos do catálogo de planos publicado.',
    items: [
      {
        id: 'landing-metric-1',
        label: 'planos publicados',
        source: 'planCount',
        customValue: '',
        note: 'Disponíveis para assinatura.',
        tone: 'primary',
      },
      {
        id: 'landing-metric-2',
        label: 'recursos incluídos',
        source: 'featureCount',
        customValue: '',
        note: 'Somando todos os planos.',
        tone: 'accent',
      },
      {
        id: 'landing-metric-3',
        label: 'áreas de cuidado',
        source: 'categoryCount',
        customValue: '',
        note: 'Grupos de recursos dos planos.',
        tone: 'cosmic',
      },
      {
        id: 'landing-metric-4',
        label: 'planos com assinatura online',
        source: 'checkoutCount',
        customValue: '',
        note: 'Prontos para assinar pelo site.',
        tone: 'golden',
      },
    ],
  },
  flow: {
    visible: true,
    badgeText: 'Como funciona',
    title: 'Três passos para começar',
    description: 'Leva poucos minutos, e você pode mudar tudo depois.',
    items: [
      {
        id: 'landing-step-1',
        step: '01',
        title: 'Crie sua conta',
        description:
          'Informe data, hora e cidade de nascimento para montar o seu mapa.',
        icon: 'sparkles',
      },
      {
        id: 'landing-step-2',
        step: '02',
        title: 'Conte como você está',
        description:
          'Registre como dormiu e se sentiu, ou conecte um dispositivo compatível.',
        icon: 'heartPulse',
      },
      {
        id: 'landing-step-3',
        step: '03',
        title: 'Receba o seu dia',
        description:
          'Todo dia a Lyra mostra o que favorece você, com plano, metas e conversa.',
        icon: 'bot',
      },
    ],
  },
  plans: {
    visible: true,
    badgeText: 'Planos',
    title: 'Escolha o plano que combina com você',
    description: 'Valores e recursos atualizados direto do nosso catálogo.',
    ctaLabel: 'Começar com este plano',
  },
  faq: {
    visible: true,
    badgeText: 'Dúvidas frequentes',
    title: 'Perguntas antes de começar',
    description: 'Respostas curtas para o que mais nos perguntam.',
    items: [
      {
        id: 'landing-faq-1',
        question: 'A Lyra substitui um profissional de saúde?',
        answer:
          'Não. A Lyra é uma plataforma de bem-estar e autoconhecimento. As orientações não substituem avaliação profissional de saúde.',
      },
      {
        id: 'landing-faq-2',
        question: 'Preciso de um relógio ou de uma cinta?',
        answer:
          'Não. Você pode registrar como se sentiu no dia. Um dispositivo compatível deixa as leituras mais completas.',
      },
      {
        id: 'landing-faq-3',
        question: 'O que acontece com os meus dados?',
        answer:
          'Eles são usados para gerar as suas leituras. Você pode baixar uma cópia ou excluir a sua conta quando quiser, pelo seu perfil.',
      },
    ],
  },
  finalCta: {
    visible: true,
    badgeText: 'Comece hoje',
    title: 'O seu próximo dia pode começar mais claro.',
    description:
      'Crie sua conta e receba a primeira leitura do seu dia em poucos minutos.',
    primaryLabel: 'Criar minha conta',
    primaryHref: '/login',
    secondaryLabel: 'Ver recursos',
    secondaryHref: '#recursos',
  },
  footer: {
    brandLine: 'lyra metacare',
    note: 'Bem-estar, longevidade e autoconhecimento. Não substitui avaliação profissional de saúde.',
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
    badgeText: 'Lyra MetaCare',
    title: 'Que bom te ver por aqui.',
    accentTitle: 'A leitura do seu dia está esperando por você.',
    description:
      'Entre para ver os melhores horários de hoje, o seu plano e o que o céu do seu mapa sugere.',
    noteEyebrow: 'Sua privacidade',
    noteText:
      'Seus dados de saúde são seus. Você pode baixar uma cópia ou excluir a sua conta quando quiser.',
    highlights: [
      {
        id: 'login-highlight-1',
        title: 'Seu dia em poucas linhas',
        description: 'O céu e os seus dados explicados em linguagem simples.',
        icon: 'sun',
        tone: 'primary',
      },
      {
        id: 'login-highlight-2',
        title: 'A Lyra sempre por perto',
        description: 'Converse sobre sono, energia e rotina a qualquer hora.',
        icon: 'bot',
        tone: 'cosmic',
      },
      {
        id: 'login-highlight-3',
        title: 'Um plano que se ajusta',
        description: 'Metas e hábitos que acompanham o seu ritmo.',
        icon: 'zap',
        tone: 'accent',
      },
    ],
  },
  auth: {
    badgeText: 'Acesso seguro',
    brandText: 'lyra',
    title: 'Entre ou crie a sua conta.',
    description: 'Leva menos de um minuto.',
    loginTabLabel: 'Entrar',
    registerTabLabel: 'Criar conta',
    emailLabel: 'Email',
    passwordLabel: 'Senha',
    firstNameLabel: 'Nome',
    lastNameLabel: 'Sobrenome',
    loginButtonLabel: 'Entrar na Lyra',
    registerButtonLabel: 'Criar minha conta',
    footerEyebrow: 'Lembrete',
    footerText:
      'A Lyra oferece orientação de bem-estar e autoconhecimento e não substitui avaliação profissional de saúde.',
    backToLandingLabel: 'Voltar para a página inicial',
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
    sidebarWidth: 248,
    cardScale: 1,
    iconScale: 1,
    tableScale: 1,
    buttonScale: 1,
  },
  sidebar: {
    brandTitle: 'lyra',
    brandEyebrow: 'metacare',
    statusEyebrow: 'Estado do dia',
    // Texto neutro: o padrão não pode afirmar um estado de saúde sem dados.
    statusTitle: 'Acompanhe seus sinais e os próximos passos do dia.',
    preferencesTitle: 'Preferências e acesso',
    preferencesDescription: 'Ajuste perfil, hábitos e configurações.',
    sectionLabels: {
      principal: 'Principal',
      guidedFlow: 'Fluxo guiado',
      personal: 'Pessoal',
      admin: 'Administração',
    },
    items: [
      {
        href: '/',
        label: 'Dashboard',
        description: 'Seu dia em um olhar: energia, sono e o céu de hoje.',
        visible: true,
      },
      {
        href: '/dia',
        label: 'Meu dia',
        description:
          'Como será o seu dia, período a período, pelo seu mapa e pelos seus sinais.',
        visible: true,
      },
      {
        href: '/semana',
        label: 'Sua semana',
        description:
          'A semana que passou e a que vem pelo seu mapa, com prontidão, sono, prática, reflexões e metas.',
        visible: true,
      },
      {
        href: '/respiracao',
        label: 'Respiração',
        description:
          'Respiração guiada (4-7-8, quadrada e alternada) com o ritmo real; os minutos entram na sua meditação.',
        visible: true,
      },
      {
        href: '/plan',
        label: 'Plano de IA',
        description:
          'Ações de foco, ritmo, alimentação e recuperação para hoje.',
        visible: true,
      },
      {
        href: '/goals',
        label: 'Metas',
        description: 'Seu progresso, sequências de dias e prioridades.',
        visible: true,
      },
      {
        href: '/appointments',
        label: 'Agendamentos',
        description:
          'Consultas, profissionais de referência e próximos horários.',
        visible: true,
      },
      {
        href: '/monitoring',
        label: 'Monitoramento',
        description:
          'Seus sinais em tempo real, com alertas e leitura por voz.',
        visible: true,
      },
      {
        href: '/chat',
        label: 'Chat IA',
        description:
          'Converse com a Lyra sobre o seu dia, o seu sono e o seu mapa.',
        visible: true,
      },
      {
        href: '/connect',
        label: 'Dispositivos',
        description: 'Relógios, cintas cardíacas e outras fontes de dados.',
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
        description: 'Textos, tamanhos e seções da landing, do login e do app.',
        visible: true,
      },
      {
        href: '/admin/puck',
        label: 'Editor Puck',
        description:
          'Blocos visuais das páginas, com rascunho, publicação e histórico.',
        visible: true,
      },
    ],
  },
  header: {
    commandPlaceholder: 'Buscar páginas e ações',
    commandShortcutLabel: 'Ctrl K',
    assistantLabel: 'Chat IA',
    profileMenuLabel: 'Meu perfil',
  },
  dashboard: {
    heroEyebrow: 'Seu bem-estar hoje',
    heroDescription:
      'Sono, energia, ritmo e o céu do seu mapa reunidos em uma leitura clara do seu dia.',
    harmonyEyebrow: 'Harmonia atual',
    harmonyNote: 'Seus sinais de hoje em relação ao céu do momento.',
    pulseBadge: 'Pulso do dia',
    pulseTitle: 'Como o seu corpo está hoje',
    pulseDescription:
      'O que merece a sua energia agora, a partir dos seus sinais e do céu do dia.',
    syncButtonLabel: 'Reavaliar agora',
    syncStatusLoading: 'Atualizando',
    syncStatusPartial: 'Parcial',
    syncStatusReady: 'Em sintonia',
    astroBadge: 'Céu do momento',
    astroCardFallbackTitle: 'Céu do momento',
    astroCardFallbackDescription:
      'O céu de hoje aparece aqui assim que o cálculo terminar.',
    astroInsightLabel: 'Para você hoje',
    astroInsightFallback:
      'Assim que o cálculo terminar, aqui aparece um resumo prático do céu para o seu corpo e a sua rotina.',
    sleepBadge: 'Sono restaurador',
    sleepDescription: 'O quanto o seu descanso sustentou a energia de hoje.',
    sleepEmptyDescription:
      'Registre como dormiu ou conecte um dispositivo para ver esta leitura.',
    sleepGoalLabel: 'Meta sugerida',
    deepSleepLabel: 'Sono profundo',
    remSleepLabel: 'Sono REM',
    sleepInsightFallback:
      'Aqui você vê a duração e a profundidade do seu sono, com uma sugestão de ritmo para hoje.',
    weeklyBadge: 'Trajetória semanal',
    weeklyTitle: 'Como sua prontidão desenhou a semana',
    weeklyDescription:
      'Uma curva simples para ver ritmo, recuperação e constância.',
    aiUnlockedLabel: 'IA liberada',
    aiUnlockedYes: 'sim',
    aiUnlockedNo: 'não',
    currentReadinessLabel: 'Prontidão atual',
    longevityLabel: 'Score de longevidade',
    liveContextLabel: 'Céu de agora',
    liveContextFallback:
      'O céu de agora aparece aqui assim que o cálculo terminar.',
    pillarsTitle: 'Pilares profundos da sua saúde',
    pillarsDescription:
      'As métricas mais detalhadas do seu dia, organizadas em blocos fáceis de ler.',
    emptyMetricsTitle: 'As métricas do dia ainda não chegaram',
    emptyMetricsDescription:
      'Registre como foi o seu dia ou conecte um dispositivo para ver as leituras detalhadas aqui.',
  },
  appointments: {
    heroBadge: 'Agenda',
    heroTitle: 'Organize encontros, profissionais e próximos horários',
    heroDescription:
      'Concentre consultas, pessoas de referência e calendário em um só lugar.',
    listTitle: 'Próximas consultas',
    listDescription:
      'Acompanhe horários confirmados, o motivo do encontro e as suas observações.',
    professionalsTitle: 'Profissionais salvos',
    professionalsDescription:
      'Cadastre, edite e mantenha sua rede de acompanhamento organizada.',
    calendarTitle: 'Calendário da agenda',
    calendarDescription:
      'Veja seus compromissos por dia e distribua a rotina com mais leveza.',
    showUpcomingList: true,
    showProfessionalsList: true,
    showCalendar: true,
  },
  aiPlan: {
    pageEyebrow: 'Plano do dia',
    pageTitle: 'Seu plano de IA',
    pageDescription:
      'Ações de foco, ritmo, alimentação e recuperação ajustadas aos seus sinais e ao céu de hoje.',
    heroBadge: 'Feito para o seu dia',
    heroEmptyTitle: 'Vamos montar o seu próximo passo.',
    heroReadyTitle: 'Seu plano do dia está pronto.',
    heroEmptyDescription:
      'O plano usa os sinais que você registrou e o céu de hoje para sugerir ações práticas, e fica salvo na sua conta.',
    generateButtonLabel: 'Gerar meu plano',
    regenerateButtonLabel: 'Atualizar plano',
    generatingButtonLabel: 'Montando o plano',
    syncingButtonLabel: 'Lendo seus sinais',
    pillarsCountLabel: 'Pilares ativos',
    recommendationsLabel: 'Recomendações',
    signalsLabel: 'Sinais disponíveis',
    liveContextBadge: 'Céu de hoje',
    liveContextTitleFallback: 'Céu do momento',
    liveContextDescriptionFallback: 'O céu de hoje aparece aqui ao atualizar.',
    persistenceTitle: 'Salvo na sua conta',
    persistenceDescription:
      'O plano fica guardado e você pode voltar a ele quando quiser.',
    emptyLocalAiTitle: 'Feito com os seus dados',
    emptyLocalAiDescription:
      'A Lyra usa apenas o que você registrou, sem números inventados.',
    emptyAstroTitle: 'O céu do seu mapa',
    emptyAstroDescription:
      'O céu de hoje em relação ao seu mapa ajuda a escolher o melhor momento para cada ação.',
    emptyPersistenceTitle: 'Sempre à mão',
    emptyPersistenceDescription:
      'Depois de gerado, o plano fica salvo e pode ser aberto de novo a qualquer momento.',
  },
  monitoring: {
    pageEyebrow: 'Tempo real',
    pageTitle: 'Seus sinais agora',
    pageDescription:
      'Acompanhe batimentos e variações em tempo real, com alertas e leitura por voz.',
    heroBadge: 'Sinais ao vivo',
    heroTitle: 'Seus sinais estão chegando agora.',
    heroDescription:
      'Conecte um dispositivo para ver os seus sinais em tempo real.',
    infoTitle: 'Como funciona',
    infoDescription:
      'A Lyra lê o dispositivo conectado e avisa quando algum sinal sai da faixa definida.',
    controlsTitle: 'Controles em tempo real',
    controlsDescription:
      'Ligue a leitura por voz e os alertas durante esta sessão.',
    alertsTitle: 'Alertas',
    alertsDescription:
      'Os avisos só aparecem quando um sinal passa dos limites definidos.',
    showEventFeed: true,
    showVoiceButton: true,
    showAlertsButton: true,
  },
  chat: {
    pageEyebrow: 'converse com a Lyra',
    pageTitle: 'Como posso te ajudar hoje?',
    pageDescription:
      'O chat cruza os seus sinais do dia, o seu perfil, o seu mapa e o céu de hoje para responder com contexto real.',
    assistantTitle: 'Lyra',
    assistantStatusLabel: 'online',
    assistantStatusNote: 'responde com os seus dados de hoje',
    integrationsButtonLabel: 'Como a Lyra responde',
    integrationsTitle: 'O que a Lyra usa para responder',
    integrationsDescription:
      'Tudo vem dos seus registros e dos motores da Lyra; nada é inventado.',
    welcomeMessage:
      'Olá, eu sou a Lyra. Posso te ajudar com sono, energia, o seu dia, o seu mapa e os próximos passos, com base nos seus dados reais.',
    quickRepliesTitle: 'Para começar',
    quickRepliesDescription: 'Escolha uma pergunta pronta ou escreva a sua.',
    inputPlaceholder: 'Escreva ou fale com a Lyra...',
    emptyStateHint:
      'A Lyra pode errar. Orientações de bem-estar e autoconhecimento: não substituem avaliação profissional de saúde.',
    quickReplies: [
      'Como vai ser o meu dia?',
      'Como posso dormir melhor hoje?',
      'Me mostra um resumo do meu ritmo recente.',
      'O que o céu de hoje diz para mim?',
    ],
    showIntegrations: true,
    showQuickReplies: true,
  },
  connect: {
    pageEyebrow: 'Dispositivos',
    pageTitle: 'Conecte o seu relógio ou a sua cinta',
    pageDescription:
      'Conecte um dispositivo por Bluetooth para acompanhar batimentos e variabilidade em tempo real.',
    cardTitle: 'Conexão por Bluetooth',
    cardDescription:
      'Funciona com cintas cardíacas e relógios compatíveis com o navegador.',
    idleTitle: 'Pronto para conectar o seu dispositivo',
    idleDescription:
      'Conecte sua cinta cardíaca ou relógio por Bluetooth para ver os seus sinais em tempo real.',
    unsupportedTitle: 'Bluetooth indisponível neste navegador',
    unsupportedDescription:
      'Abra a Lyra no Chrome ou no Edge, em uma conexão segura (HTTPS), para usar o Bluetooth.',
    connectButtonLabel: 'Conectar dispositivo Bluetooth',
    connectingTitle: 'Aguardando a escolha do dispositivo',
    connectingDescription: 'Escolha o seu dispositivo na janela do navegador.',
    connectingButtonLabel: 'Conectando...',
    connectedTitle: 'Conexão estabelecida com sucesso',
    connectedDescription: 'Dispositivo conectado',
    connectedAlertTitle: 'Recebendo dados em tempo real',
    connectedAlertDescription:
      'Assim que os dados chegarem, a página de monitoramento mostra as leituras.',
    disconnectButtonLabel: 'Desconectar dispositivo',
    errorTitle: 'Erro ao conectar o dispositivo',
    errorDescription:
      'Não foi possível concluir a conexão Bluetooth. Verifique o dispositivo, o pareamento e tente novamente.',
    retryButtonLabel: 'Tentar novamente',
  },
  profile: {
    pageEyebrow: 'Perfil',
    pageTitle: 'Seu perfil, hábitos e contexto em um só lugar',
    pageDescription:
      'Atualize dados pessoais, nascimento, hábitos e histórico.',
  },
};

const defaultPageConfigByKey = {
  landing: defaultLandingPageConfig,
  login: defaultLoginPageConfig,
  app: defaultAppPageConfig,
} satisfies SitePageConfigMap;

function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getDefaultPageConfig<TKey extends SitePageKey>(
  pageKey: TKey
): SitePageConfigMap[TKey] {
  return cloneConfig(defaultPageConfigByKey[pageKey]);
}
