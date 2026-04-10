import type { LyraPuckDocumentKey } from '@/lib/puck/types';

type LyraPuckCategoryName =
  | 'fundamentos'
  | 'narrativa'
  | 'conversao'
  | 'estrutura'
  | 'dados'
  | 'other';

type LyraPuckCategories = Record<
  LyraPuckCategoryName,
  {
    title?: string;
    components?: string[];
    defaultExpanded?: boolean;
    visible?: boolean;
  }
>;

export function obterCategoriasPuckLyra(
  documentKey: LyraPuckDocumentKey
): LyraPuckCategories {
  const isLanding = documentKey === 'landing-home';
  const isLogin = documentKey === 'login-experience';
  const isAppShell = documentKey === 'app-shell';

  return {
    fundamentos: {
      title: 'Fundamentos editoriais',
      components: ['LyraHeadingBlock', 'LyraBodyTextBlock'],
      defaultExpanded: true,
    },
    narrativa: {
      title: 'Narrativa e contexto',
      components: ['LyraHeroBlock', 'LyraFeatureCardBlock', 'LyraFaqItemBlock'],
      defaultExpanded: isLanding,
      visible: !isAppShell,
    },
    conversao: {
      title: 'Ação e conversão',
      components: ['LyraCTAButtonBlock'],
      defaultExpanded: isLanding || isLogin,
    },
    estrutura: {
      title: 'Estrutura e layout',
      components: [
        'LyraSectionContainerBlock',
        'LyraStackContainerBlock',
        'LyraFixedColumnsBlock',
        'LyraFluidGridBlock',
      ],
      defaultExpanded: true,
    },
    dados: {
      title: 'Métricas e mosaicos',
      components: ['LyraMetricCardBlock', 'LyraGridTileBlock'],
      defaultExpanded: isAppShell,
    },
    other: {
      title: 'Outros blocos',
      defaultExpanded: false,
    },
  };
}
