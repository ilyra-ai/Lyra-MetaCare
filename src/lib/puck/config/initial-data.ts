import type { LyraPuckData, LyraPuckDocumentKey } from '@/lib/puck/types';

function cloneData(data: LyraPuckData): LyraPuckData {
  return JSON.parse(JSON.stringify(data)) as LyraPuckData;
}

const defaultLandingHomeData: LyraPuckData = {
  content: [
    {
      type: 'LyraHeroBlock',
      props: {
        id: 'lyra-hero-block-landing-home',
        eyebrow: 'Puck inicial da Lyra',
        title: 'Editor visual real, claro e pronto para evoluir.',
        description:
          'Este primeiro documento prova a integração do Puck com a Lyra em modo administrativo, com preview renderizado por Render e persistência real em MySQL.',
        ctaLabel: 'Abrir experiência pública',
        ctaHref: '/login',
        note: 'Base inicial do Lyra Customaze UI UX com Puck.',
      },
    },
    {
      type: 'LyraSectionContainerBlock',
      props: {
        id: 'lyra-section-container-editorial',
        eyebrow: 'Catálogo inicial validado',
        title:
          'Blocos reais para estruturar textos, ação, métricas e narrativa.',
        description:
          'A etapa 02 cria um conjunto inicial de componentes úteis para a Lyra, já alinhados ao visual claro, editorial e premium da plataforma.',
        align: 'left',
        surface: 'aurora',
      },
    },
  ],
  root: {
    props: {
      title: 'Landing Home validada task 03',
      surfaceKey: 'landing',
      surfaceTitle: 'Landing pública da Lyra',
      surfaceDescription:
        'Superfície aberta para descoberta da proposta de valor, narrativa editorial e conversão suave.',
      themeVariant: 'aurora',
      visibilityRules: 'Pública\nMarketing\nAquisição',
    },
  },
  zones: {
    'lyra-section-container-editorial:content': [
      {
        type: 'LyraHeadingBlock',
        props: {
          id: 'lyra-heading-block-editorial',
          children:
            'Conteúdo controlado por campos claros e prontos para expansão.',
          level: 'h2',
          align: 'left',
          tone: 'default',
        },
      },
      {
        type: 'LyraBodyTextBlock',
        props: {
          id: 'lyra-body-text-block-editorial',
          content:
            'Esses componentes já permitem montar uma landing mais viva, uma seção explicativa e agrupamentos de blocos dentro do próprio editor visual.',
          align: 'left',
          size: 'md',
          tone: 'muted',
        },
      },
      {
        type: 'LyraFixedColumnsBlock',
        props: {
          id: 'lyra-fixed-columns-landing',
          eyebrow: 'Layout fixo com leitura guiada',
          title:
            'Colunas reais para combinar narrativa principal e apoio visual.',
          description:
            'Este bloco nasce com duas zonas independentes e serve como prova real da task 04 dentro da landing pública.',
          ratio: '2-1',
          gap: 'lg',
          verticalAlign: 'stretch',
          surface: 'surface',
        },
      },
      {
        type: 'LyraCTAButtonBlock',
        props: {
          id: 'lyra-cta-button-editorial',
          label: 'Acessar login',
          href: '/login',
          variant: 'accent',
          size: 'lg',
          align: 'left',
          supportingText:
            'Publicação real, preview real e persistência real já conectadas ao módulo administrativo.',
        },
      },
      {
        type: 'LyraFluidGridBlock',
        props: {
          id: 'lyra-fluid-grid-landing',
          eyebrow: 'Grade fluida premium',
          title:
            'Mosaico com tiles inline, spans reais e reorganização por grid.',
          description:
            'A grade usa slot com suporte nativo a display grid e aceita apenas tiles inline preparados para spans reais.',
          layoutMode: 'grid',
          columnsDesktop: '3',
          columnsTablet: '2',
          gap: 'md',
          surface: 'glass',
        },
      },
      {
        type: 'LyraFaqItemBlock',
        props: {
          id: 'lyra-faq-item-editorial',
          eyebrow: 'Governança do editor',
          question: 'O que já é editável nesta fase do Puck?',
          answer:
            'Títulos, textos, CTAs, cards editoriais, cards de métrica, FAQ e contêineres com slot. Isso forma a base concreta para categorias, rich text e layouts mais avançados das próximas tasks.',
        },
      },
    ],
    'lyra-fixed-columns-landing:leftColumn': [
      {
        type: 'LyraHeadingBlock',
        props: {
          id: 'lyra-heading-columns-landing',
          children:
            'Uma coluna principal para a história e outra para prova de valor.',
          level: 'h3',
          align: 'left',
          tone: 'default',
        },
      },
      {
        type: 'LyraBodyTextBlock',
        props: {
          id: 'lyra-body-columns-landing',
          content:
            'As colunas possuem zonas independentes, aceitam drag-and-drop nativo e preservam a hierarquia editorial sem gambiarras estruturais.',
          align: 'left',
          size: 'md',
          tone: 'muted',
        },
      },
    ],
    'lyra-fixed-columns-landing:rightColumn': [
      {
        type: 'LyraMetricCardBlock',
        props: {
          id: 'lyra-metric-card-hrv',
          eyebrow: 'Respiração e ritmo',
          value: '84',
          unit: 'ms',
          description:
            'Exemplo de métrica premium com valor principal, badge e tendência explícita.',
          trendLabel: 'Estabilidade superior à média da semana',
          trendDirection: 'up',
          badgeLabel: 'Harmonia elevada',
          icon: 'heart',
        },
      },
      {
        type: 'LyraFeatureCardBlock',
        props: {
          id: 'lyra-feature-card-ai',
          eyebrow: 'Camada estratégica',
          title:
            'Organize áreas com narrativa, métricas e CTA no mesmo canvas.',
          description:
            'O card de feature já nasce pronto para destacar valor de negócio, benefício funcional e direcionamento.',
          icon: 'cpu',
          tone: 'cosmic',
          ctaLabel: 'Ver dashboard',
          ctaHref: '/dashboard',
        },
      },
    ],
    'lyra-fluid-grid-landing:content': [
      {
        type: 'LyraGridTileBlock',
        props: {
          id: 'lyra-grid-tile-landing-01',
          eyebrow: 'Tile hero',
          title: 'Destaque amplo com span horizontal real.',
          description:
            'Este item usa inline + dragRef e ocupa duas colunas para demonstrar a remoção do wrapper do Puck.',
          badgeLabel: 'Span 2x1',
          tone: 'cosmic',
          spanCol: '2',
          spanRow: '1',
        },
      },
      {
        type: 'LyraGridTileBlock',
        props: {
          id: 'lyra-grid-tile-landing-02',
          eyebrow: 'Tile lateral',
          title: 'Apoio compacto e modular.',
          description:
            'Ideal para tags, reforços de prova social, benefícios rápidos e microcontextos.',
          badgeLabel: 'Modular',
          tone: 'teal',
          spanCol: '1',
          spanRow: '1',
        },
      },
      {
        type: 'LyraGridTileBlock',
        props: {
          id: 'lyra-grid-tile-landing-03',
          eyebrow: 'Tile vertical',
          title: 'Ritmo editorial com ocupação em duas linhas.',
          description:
            'O span vertical mostra que o tile inline responde a grid-row sem wrapper extra atrapalhando o layout.',
          badgeLabel: 'Span 1x2',
          tone: 'coral',
          spanCol: '1',
          spanRow: '2',
        },
      },
    ],
  },
};

const defaultLoginExperienceData: LyraPuckData = {
  content: [
    {
      type: 'LyraHeroBlock',
      props: {
        id: 'lyra-hero-block-login-experience',
        eyebrow: 'Acesso seguro e acolhedor',
        title: 'Entre na sua experiência Lyra com calma, clareza e contexto.',
        description:
          'A superfície de login agora possui root próprio para controlar metadados, tom visual e regras de visibilidade no editor.',
        ctaLabel: 'Entrar agora',
        ctaHref: '/login',
        note: 'Root configuration aplicada sobre a experiência de autenticação.',
      },
    },
    {
      type: 'LyraSectionContainerBlock',
      props: {
        id: 'lyra-section-container-login',
        eyebrow: 'Superfície autenticável',
        title: 'Contexto estrutural separado dos blocos internos.',
        description:
          'O root do login guarda título, descrição da superfície, tema e governança de exibição sem misturar isso ao conteúdo editorial.',
        align: 'left',
        surface: 'glass',
      },
    },
  ],
  root: {
    props: {
      title: 'Login Lyra validado task 03',
      surfaceKey: 'login',
      surfaceTitle: 'Experiência de login',
      surfaceDescription:
        'Superfície de autenticação com contexto acolhedor, linguagem clara e foco em confiança operacional.',
      themeVariant: 'serene',
      visibilityRules: 'Pública\nAutenticação\nAcesso controlado',
    },
  },
  zones: {
    'lyra-section-container-login:content': [
      {
        type: 'LyraHeadingBlock',
        props: {
          id: 'lyra-heading-block-login',
          children: 'Uma raiz própria para a jornada de entrada.',
          level: 'h2',
          align: 'left',
          tone: 'teal',
        },
      },
      {
        type: 'LyraBodyTextBlock',
        props: {
          id: 'lyra-body-text-block-login',
          content:
            'Nesta etapa, a superfície de login passa a ter identidade estrutural independente, mantendo os componentes internos reutilizáveis.',
          align: 'left',
          size: 'md',
          tone: 'muted',
        },
      },
      {
        type: 'LyraCTAButtonBlock',
        props: {
          id: 'lyra-cta-button-login',
          label: 'Abrir login real',
          href: '/login',
          variant: 'primary',
          size: 'lg',
          align: 'left',
          supportingText:
            'Use este CTA para validar a superfície pública de autenticação.',
        },
      },
    ],
  },
};

const defaultAppShellData: LyraPuckData = {
  content: [
    {
      type: 'LyraSectionContainerBlock',
      props: {
        id: 'lyra-section-container-app-shell',
        eyebrow: 'App shell da Lyra',
        title: 'A raiz do app shell agora descreve o contexto operacional.',
        description:
          'O shell autenticado recebe governança própria, útil para experiências internas, módulos e futuras regras de papel.',
        align: 'left',
        surface: 'surface',
      },
    },
  ],
  root: {
    props: {
      title: 'App Shell validado task 03',
      surfaceKey: 'app-shell',
      surfaceTitle: 'App shell autenticado',
      surfaceDescription:
        'Superfície estrutural do app autenticado, pensada para navegação, contexto de módulo e leitura operacional.',
      themeVariant: 'shell',
      visibilityRules:
        'Privada\nUsuário autenticado\nAdministrador quando necessário',
    },
  },
  zones: {
    'lyra-section-container-app-shell:content': [
      {
        type: 'LyraHeadingBlock',
        props: {
          id: 'lyra-heading-block-app-shell',
          children: 'Navegação, contexto e governança em uma raiz dedicada.',
          level: 'h2',
          align: 'left',
          tone: 'default',
        },
      },
      {
        type: 'LyraBodyTextBlock',
        props: {
          id: 'lyra-body-text-block-app-shell',
          content:
            'Esse documento serve para editar e publicar metadados do app autenticado sem misturar a estrutura da superfície com o conteúdo dos blocos internos.',
          align: 'left',
          size: 'md',
          tone: 'muted',
        },
      },
      {
        type: 'LyraFixedColumnsBlock',
        props: {
          id: 'lyra-fixed-columns-app-shell',
          eyebrow: 'Shell com zonas controladas',
          title: 'Área operacional organizada em duas colunas reais.',
          description:
            'O app shell agora também prova a task 04 com colunas fixas independentes para contexto e indicadores operacionais.',
          ratio: '1-2',
          gap: 'md',
          verticalAlign: 'stretch',
          surface: 'glass',
        },
      },
    ],
    'lyra-fixed-columns-app-shell:leftColumn': [
      {
        type: 'LyraHeadingBlock',
        props: {
          id: 'lyra-heading-block-shell-columns',
          children: 'Coluna de contexto, regras e narrativa operacional.',
          level: 'h3',
          align: 'left',
          tone: 'teal',
        },
      },
      {
        type: 'LyraBodyTextBlock',
        props: {
          id: 'lyra-body-block-shell-columns',
          content:
            'Este lado do shell é útil para contexto, documentação viva, onboarding interno e regras de leitura por papel.',
          align: 'left',
          size: 'md',
          tone: 'muted',
        },
      },
    ],
    'lyra-fixed-columns-app-shell:rightColumn': [
      {
        type: 'LyraMetricCardBlock',
        props: {
          id: 'lyra-metric-card-shell',
          eyebrow: 'Módulos ativos',
          value: '09',
          unit: '',
          description:
            'Exemplo de leitura operacional dentro do shell autenticado.',
          trendLabel: 'Estrutura íntegra para novas etapas',
          trendDirection: 'up',
          badgeLabel: 'Base viva',
          icon: 'activity',
        },
      },
      {
        type: 'LyraFeatureCardBlock',
        props: {
          id: 'lyra-feature-card-shell',
          eyebrow: 'Governança estrutural',
          title: 'Superfície com root próprio e filhos preservados.',
          description:
            'Esse bloco comprova que o root envolve a experiência sem quebrar os componentes já renderizados no canvas.',
          icon: 'shield',
          tone: 'teal',
          ctaLabel: 'Abrir dashboard',
          ctaHref: '/',
        },
      },
    ],
  },
};

const initialDataByDocumentKey: Record<LyraPuckDocumentKey, LyraPuckData> = {
  'landing-home': defaultLandingHomeData,
  'login-experience': defaultLoginExperienceData,
  'app-shell': defaultAppShellData,
};

export function getInitialPuckData(
  documentKey: LyraPuckDocumentKey
): LyraPuckData {
  return cloneData(initialDataByDocumentKey[documentKey]);
}
