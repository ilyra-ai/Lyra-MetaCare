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
  ],
  root: {
    props: {},
  },
  zones: {},
};

const initialDataByDocumentKey: Record<LyraPuckDocumentKey, LyraPuckData> = {
  'landing-home': defaultLandingHomeData,
};

export function getInitialPuckData(
  documentKey: LyraPuckDocumentKey
): LyraPuckData {
  return cloneData(initialDataByDocumentKey[documentKey]);
}
