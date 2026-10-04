import type { Config } from '@puckeditor/core';

import { lyraBodyTextBlockConfig } from '@/lib/puck/config/components/body-text';
import { lyraCTAButtonBlockConfig } from '@/lib/puck/config/components/cta-button';
import { lyraFaqItemBlockConfig } from '@/lib/puck/config/components/faq-item';
import { lyraFeatureCardBlockConfig } from '@/lib/puck/config/components/feature-card';
import { lyraFixedColumnsBlockConfig } from '@/lib/puck/config/components/fixed-columns';
import { lyraFluidGridBlockConfig } from '@/lib/puck/config/components/fluid-grid';
import { lyraGridTileBlockConfig } from '@/lib/puck/config/components/grid-tile';
import { lyraHeadingBlockConfig } from '@/lib/puck/config/components/heading';
import { lyraHeroBlockConfig } from '@/lib/puck/config/components/hero';
import { lyraMetricCardBlockConfig } from '@/lib/puck/config/components/metric-card';
import { lyraSectionContainerBlockConfig } from '@/lib/puck/config/components/section-container';
import { lyraStackContainerBlockConfig } from '@/lib/puck/config/components/stack-container';
import { VedicDashboardBlock } from '@/lib/puck/config/components/VedicDashboardBlock';

export const lyraPuckComponents = {
  LyraHeroBlock: lyraHeroBlockConfig,
  LyraHeadingBlock: lyraHeadingBlockConfig,
  LyraBodyTextBlock: lyraBodyTextBlockConfig,
  LyraCTAButtonBlock: lyraCTAButtonBlockConfig,
  LyraMetricCardBlock: lyraMetricCardBlockConfig,
  LyraFeatureCardBlock: lyraFeatureCardBlockConfig,
  LyraFaqItemBlock: lyraFaqItemBlockConfig,
  LyraSectionContainerBlock: lyraSectionContainerBlockConfig,
  LyraStackContainerBlock: lyraStackContainerBlockConfig,
  LyraFixedColumnsBlock: lyraFixedColumnsBlockConfig,
  LyraFluidGridBlock: lyraFluidGridBlockConfig,
  LyraGridTileBlock: lyraGridTileBlockConfig,
  VedicDashboardBlock,
} satisfies NonNullable<Config['components']>;
