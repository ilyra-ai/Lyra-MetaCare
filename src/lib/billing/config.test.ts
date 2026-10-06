import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getBillingBaseUrl,
  getStripeEnvironmentStatus,
  resolveStripePriceId,
} from '@/lib/billing/config';
import { SubscriptionPlanSummary } from '@/types/subscription';

const ORIGINAL_ENV = { ...process.env };

function resetBillingEnv() {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.APP_BASE_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_PRICE_META_MONTHLY;
  delete process.env.STRIPE_PRICE_META_ANNUAL;
}

function buildPlan(
  overrides: Partial<SubscriptionPlanSummary> = {}
): SubscriptionPlanSummary {
  return {
    id: 'plan_meta',
    key: 'meta',
    name: 'Meta',
    tagline: 'Plano Meta',
    description: 'Descricao',
    monthlyPrice: 99,
    annualPrice: 999,
    currencyCode: 'BRL',
    highlightText: null,
    accentFrom: '#111111',
    accentTo: '#222222',
    displayOrder: 1,
    isActive: true,
    isPublic: true,
    externalProductId: null,
    externalMonthlyPriceId: null,
    externalAnnualPriceId: null,
    ...overrides,
  };
}

afterEach(() => {
  resetBillingEnv();
});

describe('billing config', () => {
  it('aponta as chaves ausentes quando o ambiente nao esta configurado', () => {
    const status = getStripeEnvironmentStatus();

    expect(status.configured).toBe(false);
    expect(status.portalEnabled).toBe(false);
    expect(status.missingKeys).toEqual([
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'APP_BASE_URL ou NEXT_PUBLIC_APP_URL',
    ]);
  });

  it('usa APP_BASE_URL como origem prioritaria', () => {
    process.env.APP_BASE_URL = 'https://app.lyra.test';
    process.env.NEXT_PUBLIC_APP_URL = 'https://public.lyra.test';

    expect(getBillingBaseUrl('https://fallback.lyra.test')).toBe(
      'https://app.lyra.test'
    );
  });

  it('aceita fallbackOrigin quando as urls nao estao em env', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';

    const status = getStripeEnvironmentStatus('https://fallback.lyra.test');

    expect(status.configured).toBe(true);
    expect(status.missingKeys).toEqual([]);
  });

  it('em produção nao usa a origem da requisicao (Host forjavel)', () => {
    vi.stubEnv('NODE_ENV', 'production');
    try {
      expect(getBillingBaseUrl('https://evil.example')).toBeNull();
      expect(
        getStripeEnvironmentStatus('https://evil.example').missingKeys
      ).toContain('APP_BASE_URL ou NEXT_PUBLIC_APP_URL');
      process.env.APP_BASE_URL = 'https://app.lyra.test';
      expect(getBillingBaseUrl('https://evil.example')).toBe(
        'https://app.lyra.test'
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('prioriza price ids persistidos no plano antes de variaveis de ambiente', () => {
    process.env.STRIPE_PRICE_META_MONTHLY = 'price_env_monthly';
    process.env.STRIPE_PRICE_META_ANNUAL = 'price_env_annual';

    const plan = buildPlan({
      externalMonthlyPriceId: 'price_db_monthly',
      externalAnnualPriceId: 'price_db_annual',
    });

    expect(resolveStripePriceId(plan, 'monthly')).toBe('price_db_monthly');
    expect(resolveStripePriceId(plan, 'annual')).toBe('price_db_annual');
  });

  it('usa variaveis de ambiente quando o plano ainda nao possui ids externos persistidos', () => {
    process.env.STRIPE_PRICE_META_MONTHLY = 'price_env_monthly';
    process.env.STRIPE_PRICE_META_ANNUAL = 'price_env_annual';

    const plan = buildPlan();

    expect(resolveStripePriceId(plan, 'monthly')).toBe('price_env_monthly');
    expect(resolveStripePriceId(plan, 'annual')).toBe('price_env_annual');
  });
});
