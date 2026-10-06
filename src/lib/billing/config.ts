import type Stripe from 'stripe';

import { PlanKey, SubscriptionPlanSummary } from '@/types/subscription';

import { BillingEnvironmentStatus } from '@/types/subscription';

const STRIPE_PROVIDER = 'stripe' as const;
// Versão de API fixada pelo stripe-node 23 (ver CHANGELOG do pacote). O
// endpoint de webhook no Dashboard da Stripe deve usar a mesma versão para que
// os objetos recebidos tenham o formato tipado pela SDK.
const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2026-09-30.endive';

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

/**
 * Origem usada nos retornos da Stripe (success, cancel e portal).
 * A origem da requisição (derivada do cabeçalho Host, controlado pelo
 * cliente) só serve de alternativa fora de produção; em produção a URL vem
 * obrigatoriamente de APP_BASE_URL ou NEXT_PUBLIC_APP_URL, para que um Host
 * forjado não redirecione o cliente para outro domínio após o pagamento.
 */
export function getBillingBaseUrl(fallbackOrigin?: string) {
  const origemDaRequisicao =
    process.env.NODE_ENV === 'production' ? undefined : fallbackOrigin;
  return (
    readOptionalEnv('APP_BASE_URL') ||
    readOptionalEnv('NEXT_PUBLIC_APP_URL') ||
    origemDaRequisicao ||
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
