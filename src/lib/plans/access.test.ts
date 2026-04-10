import { describe, expect, it } from 'vitest';

import {
  getPlanFeature,
  getQuotaUsagePercentage,
  isPlanFeatureEnabled,
} from '@/lib/plans/access';
import {
  AccountSubscriptionSummary,
  PlanFeatureAccess,
} from '@/types/subscription';

const baseFeature: PlanFeatureAccess = {
  key: 'ai_chat_messages',
  name: 'Mensagens IA',
  description: 'Mensagens mensais com IA.',
  category: 'IA',
  featureType: 'quota',
  meterKind: 'usage_counter',
  unit: 'mensagens',
  enabled: true,
  quotaValue: 100,
  resetInterval: 'monthly',
  usedValue: 25,
  remainingValue: 75,
  sortOrder: 1,
};

function buildSubscription(
  features: PlanFeatureAccess[]
): AccountSubscriptionSummary {
  return {
    subscriptionId: 'sub_1',
    status: 'active',
    billingInterval: 'monthly',
    source: 'internal',
    startsAt: '2026-03-13 00:00:00',
    currentPeriodStart: '2026-03-13 00:00:00',
    currentPeriodEnd: '2026-04-13 00:00:00',
    cancelAtPeriodEnd: false,
    plan: {
      id: 'plan_free',
      key: 'free',
      name: 'Free',
      tagline: 'Entrada',
      description: 'Plano de entrada',
      monthlyPrice: 0,
      annualPrice: 0,
      currencyCode: 'BRL',
      highlightText: null,
      accentFrom: '#111111',
      accentTo: '#222222',
      displayOrder: 0,
      isActive: true,
      isPublic: true,
      externalProductId: null,
      externalMonthlyPriceId: null,
      externalAnnualPriceId: null,
    },
    features,
  };
}

describe('plan access helpers', () => {
  it('retorna a feature correta dentro da assinatura', () => {
    const subscription = buildSubscription([baseFeature]);

    expect(getPlanFeature(subscription, 'ai_chat_messages')).toEqual(
      baseFeature
    );
  });

  it('retorna false quando a feature nao existe ou esta desabilitada', () => {
    const disabledFeature = { ...baseFeature, enabled: false };
    const subscription = buildSubscription([disabledFeature]);

    expect(isPlanFeatureEnabled(subscription, 'ai_chat_messages')).toBe(false);
    expect(isPlanFeatureEnabled(subscription, 'ai_scores')).toBe(false);
  });

  it('calcula o percentual de consumo com limite superior de 100', () => {
    expect(getQuotaUsagePercentage(baseFeature)).toBe(25);
    expect(
      getQuotaUsagePercentage({
        ...baseFeature,
        usedValue: 140,
        remainingValue: 0,
      })
    ).toBe(100);
  });

  it('retorna null quando nao ha quota numerica ou consumo carregado', () => {
    expect(
      getQuotaUsagePercentage({
        ...baseFeature,
        quotaValue: null,
        usedValue: null,
        remainingValue: null,
      })
    ).toBeNull();
  });
});
