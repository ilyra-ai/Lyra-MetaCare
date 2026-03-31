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
    props: {},
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
        type: 'LyraStackContainerBlock',
        props: {
          id: 'lyra-stack-container-metricas',
          title: 'Primeiro agrupamento de cards',
          description:
            'Use o stack para agrupar blocos lado a lado ou em coluna, preservando espaçamento e leitura visual.',
          direction: 'horizontal',
          gap: 'md',
          surface: 'transparent',
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
    'lyra-stack-container-metricas:content': [
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
  },
};

const initialDataByDocumentKey: Record<LyraPuckDocumentKey, LyraPuckData> = {
  'landing-home': defaultLandingHomeData,
};

export function getInitialPuckData(
  documentKey: LyraPuckDocumentKey
): LyraPuckData {
  return cloneData(initialDataByDocumentKey[documentKey]);
}
