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

// Um único cliente Stripe por processo, em qualquer ambiente (antes um novo
// cliente, com seu próprio agente HTTP, era criado a cada uso em produção).
export function getStripeClient() {
  if (!globalStripeState.__lyraStripeClient) {
    globalStripeState.__lyraStripeClient = createStripeClient();
  }

  return globalStripeState.__lyraStripeClient;
}
