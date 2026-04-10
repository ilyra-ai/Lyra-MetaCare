import { afterEach, describe, expect, it, vi } from 'vitest';

import { limparCacheDinamicoLyra } from '@/lib/puck/dynamic/cache';
import {
  resolverCamposHeroLyra,
  resolverCamposMetricCardLyra,
  resolverCamposRootLyra,
} from '@/lib/puck/fields/dynamic';

describe('campos dinâmicos do Puck da Lyra', () => {
  afterEach(() => {
    limparCacheDinamicoLyra();
    vi.unstubAllGlobals();
  });

  it('oculta o link manual do hero quando o CTA usa uma tela pública da Lyra', () => {
    const fields = resolverCamposHeroLyra({
      dynamicSource: 'session-profile',
      ctaMode: 'surface-route',
      ctaLabel: 'Abrir experiência pública',
      ctaHref: '/login',
      ctaDocumentKey: 'login-experience',
    });

    expect(fields.eyebrow?.visible).toBe(false);
    expect(fields.title?.visible).toBe(false);
    expect(fields.description?.visible).toBe(false);
    expect(fields.ctaHref?.visible).toBe(false);
    expect(fields.ctaDocumentKey?.visible).toBe(true);
  });

  it('esconde os campos manuais do card de métrica quando a fonte vem da assinatura', () => {
    const fields = resolverCamposMetricCardLyra({
      dynamicSource: 'subscription-summary',
      trendDirection: 'up',
    });

    expect(fields.eyebrow?.visible).toBe(false);
    expect(fields.value?.visible).toBe(false);
    expect(fields.unit?.visible).toBe(false);
    expect(fields.trendDirection?.visible).toBe(false);
    expect(fields.icon?.visible).toBe(false);
  });

  it('ajusta o ícone permitido do card de métrica conforme a tendência manual', () => {
    const fields = resolverCamposMetricCardLyra({
      dynamicSource: 'manual',
      trendDirection: 'down',
    });

    expect(fields.icon?.type).toBe('select');

    if (fields.icon?.type !== 'select') {
      throw new Error('Campo de ícone não foi resolvido como select.');
    }

    expect(fields.icon.options.map((item) => item.value)).toEqual([
      'shield',
      'calendar',
      'activity',
      'message',
    ]);
  });

  it('expõe campos de root contextuais para a surface de app shell', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).includes('/api/auth/session')) {
          return new Response(
            JSON.stringify({
              session: {
                user: {
                  id: 'admin-id',
                  email: 'admin@admin.com',
                  role: 'admin',
                  user_metadata: {
                    full_name: 'Admin Principal',
                    first_name: 'Admin',
                    last_name: 'Principal',
                  },
                },
              },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        throw new Error(`fetch inesperado em teste: ${String(input)}`);
      })
    );

    const fields = await resolverCamposRootLyra({
      dynamicSource: 'session-context',
      surfaceKey: 'app-shell',
    });

    expect(fields.surfaceTitle?.label).toBe('Título da shell autenticado');
    expect(fields.themeVariant?.type).toBe('select');

    if (fields.themeVariant?.type !== 'select') {
      throw new Error('Campo themeVariant não foi resolvido como select.');
    }

    expect(fields.themeVariant.label).toBe('Tema do shell autenticado');
    expect(fields.themeVariant.options.map((item) => item.value)).toEqual([
      'shell',
      'serene',
    ]);
    expect(fields.visibilityRules?.label).toBe(
      'Regras de visibilidade do shell'
    );
    expect(fields.resolvedContextSummary?.visible).toBe(true);
    expect(fields.resolvedContextSummary?.label).toBe(
      'Resumo dinâmico para Admin'
    );
  });
});
