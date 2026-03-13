import type Stripe from 'stripe';

import { PlanKey, SubscriptionPlanSummary } from '@/types/subscription';

import { BillingEnvironmentStatus } from '@/types/subscription';

const STRIPE_PROVIDER = 'stripe' as const;
const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2026-02-25.clover';

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

export function getStripeApiVersion(): Stripe.LatestApiVersion {
  return STRIPE_API_VERSION;
}

export function getStripeSecretKey() {
  return readOptionalEnv('STRIPE_SECRET_KEY');
}

export function getStripeWebhookSecret() {
  return readOptionalEnv('STRIPE_WEBHOOK_SECRET');
}

export function getBillingBaseUrl(fallbackOrigin?: string) {
  return (
    readOptionalEnv('APP_BASE_URL') ||
    readOptionalEnv('NEXT_PUBLIC_APP_URL') ||
    fallbackOrigin ||
    null
  );
}

export function getStripeEnvironmentStatus(
  fallbackOrigin?: string
): BillingEnvironmentStatus {
  const missingKeys: string[] = [];

  if (!getStripeSecretKey()) {
    missingKeys.push('STRIPE_SECRET_KEY');
  }

  if (!getStripeWebhookSecret()) {
    missingKeys.push('STRIPE_WEBHOOK_SECRET');
  }

  if (!getBillingBaseUrl(fallbackOrigin)) {
    missingKeys.push('APP_BASE_URL ou NEXT_PUBLIC_APP_URL');
  }

  return {
    provider: STRIPE_PROVIDER,
    configured: missingKeys.length === 0,
    portalEnabled: missingKeys.length === 0,
    missingKeys,
  };
}

function getStripeEnvPriceId(planKey: PlanKey, interval: 'monthly' | 'annual') {
  return readOptionalEnv(
    `STRIPE_PRICE_${planKey.toUpperCase()}_${interval.toUpperCase()}`
  );
}

export function resolveStripePriceId(
  plan: Pick<
    SubscriptionPlanSummary,
    'key' | 'externalMonthlyPriceId' | 'externalAnnualPriceId'
  >,
  billingInterval: 'monthly' | 'annual'
) {
  if (billingInterval === 'annual') {
    return (
      plan.externalAnnualPriceId ||
      getStripeEnvPriceId(plan.key, 'annual') ||
      null
    );
  }

  return (
    plan.externalMonthlyPriceId ||
    getStripeEnvPriceId(plan.key, 'monthly') ||
    null
  );
}

export function getStripeProviderName() {
  return STRIPE_PROVIDER;
}
