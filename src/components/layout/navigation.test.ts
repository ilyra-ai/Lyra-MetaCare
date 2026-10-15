import { describe, expect, it } from 'vitest';

import type { AppPageConfig } from '@/lib/site-page-config/schema';
import { getDefaultPageConfig } from '@/lib/site-page-config/defaults';

import { getVisibleNavigation } from './navigation';

const INICIO_DA_NAVEGACAO = ['/', '/dia', '/semana', '/respiracao', '/plan'];

function semAsPaginas(hrefs: string[]): AppPageConfig {
  const config: AppPageConfig = getDefaultPageConfig('app');
  return {
    ...config,
    sidebar: {
      ...config.sidebar,
      items: config.sidebar.items.filter((item) => !hrefs.includes(item.href)),
    },
  };
}

describe('navegação com configuração salva', () => {
  it('a configuração padrão começa por Dashboard, Meu dia, Sua semana e Respiração', () => {
    const config: AppPageConfig = getDefaultPageConfig('app');
    expect(config.sidebar.items.map((i) => i.href).slice(0, 5)).toEqual(
      INICIO_DA_NAVEGACAO
    );
  });

  it('página nova fora da configuração entra depois da sua antecessora', () => {
    const hrefs = getVisibleNavigation(false, semAsPaginas(['/dia'])).map(
      (i) => i.href
    );
    expect(hrefs.slice(0, 5)).toEqual(INICIO_DA_NAVEGACAO);
    expect(hrefs.filter((h) => h === '/dia')).toHaveLength(1);
    expect(hrefs.some((h) => h.startsWith('/admin'))).toBe(false);
  });

  it('configuração salva antes da tarefa 44 ganha Sua semana e Respiração depois do Meu dia', () => {
    const itens = getVisibleNavigation(
      false,
      semAsPaginas(['/semana', '/respiracao'])
    );
    expect(itens.map((i) => i.href).slice(0, 5)).toEqual(INICIO_DA_NAVEGACAO);
    expect(itens.find((i) => i.href === '/semana')?.label).toBe('Sua semana');
    expect(itens.find((i) => i.href === '/respiracao')?.label).toBe(
      'Respiração'
    );
  });
});
