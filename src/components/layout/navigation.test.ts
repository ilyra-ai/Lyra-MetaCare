import { describe, expect, it } from 'vitest';

import type { AppPageConfig } from '@/lib/site-page-config/schema';
import { getDefaultPageConfig } from '@/lib/site-page-config/defaults';

import { getVisibleNavigation } from './navigation';

describe('navegação com configuração salva', () => {
  it('página nova fora da configuração entra depois da sua antecessora', () => {
    const config: AppPageConfig = getDefaultPageConfig('app');
    expect(config.sidebar.items.map((i) => i.href).slice(0, 2)).toEqual([
      '/',
      '/dia',
    ]);
    const semMeuDia: AppPageConfig = {
      ...config,
      sidebar: {
        ...config.sidebar,
        items: config.sidebar.items.filter((item) => item.href !== '/dia'),
      },
    };
    const hrefs = getVisibleNavigation(false, semMeuDia).map((i) => i.href);
    expect(hrefs.slice(0, 4)).toEqual(['/', '/dia', '/respiracao', '/plan']);
    expect(hrefs.filter((h) => h === '/dia')).toHaveLength(1);
    expect(hrefs.some((h) => h.startsWith('/admin'))).toBe(false);
  });

  it('configuração salva antes da Respiração ganha a página depois do Meu dia', () => {
    const config: AppPageConfig = getDefaultPageConfig('app');
    const antiga: AppPageConfig = {
      ...config,
      sidebar: {
        ...config.sidebar,
        items: config.sidebar.items.filter(
          (item) => item.href !== '/respiracao'
        ),
      },
    };
    const itens = getVisibleNavigation(false, antiga);
    expect(itens.map((i) => i.href).slice(0, 4)).toEqual([
      '/',
      '/dia',
      '/respiracao',
      '/plan',
    ]);
    expect(itens.find((i) => i.href === '/respiracao')?.label).toBe(
      'Respiração'
    );
  });
});
