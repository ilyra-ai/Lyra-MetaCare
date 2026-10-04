import Stripe from 'stripe';

import { HttpError } from '@/lib/http-error';
import { getStripeApiVersion, getStripeSecretKey } from '@/lib/billing/config';

// Cache do cliente no escopo global (sobrevive ao hot reload em
// desenvolvimento); o acesso é sempre feito pelo tipo abaixo.
type GlobalStripeState = typeof globalThis & {
  __lyraStripeClient?: Stripe;
};

function createStripeClient() {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    throw new HttpError(
      'Billing externo não configurado: STRIPE_SECRET_KEY ausente.',
      503
    );
  }

  return new Stripe(secretKey, {
    apiVersion: getStripeApiVersion(),
    typescript: true,
  });
}

const globalStripeState = globalThis as GlobalStripeState;

export function getStripeClient() {
  if (globalStripeState.__lyraStripeClient) {
    return globalStripeState.__lyraStripeClient;
  }

  const client = createStripeClient();

  if (process.env.NODE_ENV !== 'production') {
    globalStripeState.__lyraStripeClient = client;
  }

  return client;
}
