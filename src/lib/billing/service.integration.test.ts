import { randomBytes, randomUUID } from 'node:crypto';

import Stripe from 'stripe';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { processStripeWebhook } from '@/lib/billing/service';
import { HttpError } from '@/lib/http-error';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import {
  contar,
  criarUsuario,
  type UsuarioDeTeste,
} from '../../../tests/integration/fixtures';

// Webhook Stripe processado de ponta a ponta contra o MySQL real. A
// assinatura HMAC é gerada e verificada localmente pela própria SDK da
// Stripe (generateTestHeaderString/constructEvent), com um segredo de teste
// criado aqui; nenhuma chamada sai para a rede e nenhuma transação externa é
// simulada. O evento checkout.session.completed consulta a API da Stripe e
// exige credencial real: fica fora deste teste (fronteira externa).

const AMBIENTE_ORIGINAL = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};
const segredoWebhook = `whsec_${randomBytes(24).toString('hex')}`;
const precoMetaMensal = `price_teste_${randomUUID().slice(0, 8)}`;
const sdk = new Stripe('sk_test_somente_assinatura_local');

function assinar(payload: string, segredo = segredoWebhook) {
  return sdk.webhooks.generateTestHeaderString({ payload, secret: segredo });
}

function eventoDeAssinatura(options: {
  tipo: Stripe.Event.Type;
  usuario: UsuarioDeTeste;
  status: Stripe.Subscription.Status;
  assinaturaId: string;
  clienteId: string;
}) {
  const agora = Math.floor(Date.now() / 1000);
  return JSON.stringify({
    id: `evt_${randomUUID().replace(/-/g, '')}`,
    object: 'event',
    type: options.tipo,
    created: agora,
    data: {
      object: {
        id: options.assinaturaId,
        object: 'subscription',
        customer: options.clienteId,
        status: options.status,
        metadata: { lyra_user_id: options.usuario.id },
        start_date: agora,
        cancel_at_period_end: false,
        canceled_at: options.status === 'canceled' ? agora : null,
        items: {
          object: 'list',
          data: [
            {
              id: `si_${randomUUID().slice(0, 8)}`,
              object: 'subscription_item',
              current_period_start: agora,
              current_period_end: agora + 30 * 24 * 3600,
              price: {
                id: precoMetaMensal,
                object: 'price',
                recurring: { interval: 'month' },
              },
            },
          ],
        },
      },
    },
  });
}

async function planoAtivo(usuario: UsuarioDeTeste) {
  const linhas = await queryRows<{ plan_key: string; source: string }>(
    `SELECT p.plan_key, us.source
     FROM user_subscriptions us
     JOIN subscription_plans p ON p.id = us.plan_id
     WHERE us.user_id = ? AND us.status = 'active'`,
    [usuario.id]
  );
  return linhas;
}

beforeAll(async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_somente_assinatura_local';
  process.env.STRIPE_WEBHOOK_SECRET = segredoWebhook;
  await executeStatement(
    `UPDATE subscription_plans SET external_monthly_price_id = ? WHERE plan_key = 'meta'`,
    [precoMetaMensal]
  );
});

afterAll(() => {
  for (const [chave, valor] of Object.entries(AMBIENTE_ORIGINAL)) {
    if (valor === undefined) {
      delete process.env[chave];
    } else {
      process.env[chave] = valor;
    }
  }
  delete (globalThis as { __lyraStripeClient?: unknown }).__lyraStripeClient;
});

describe('webhook Stripe', () => {
  it('recusa requisição sem assinatura ou com assinatura inválida', async () => {
    const usuario = await criarUsuario('patient', 'Assinatura');
    const payload = eventoDeAssinatura({
      tipo: 'customer.subscription.updated',
      usuario,
      status: 'active',
      assinaturaId: 'sub_invalida',
      clienteId: 'cus_invalido',
    });

    const semAssinatura = await processStripeWebhook({
      payload,
      signature: null,
    }).catch((error: unknown) => error);
    expect(semAssinatura).toBeInstanceOf(HttpError);
    expect((semAssinatura as HttpError).statusCode).toBe(400);

    const forjada = await processStripeWebhook({
      payload,
      signature: assinar(payload, `whsec_${randomBytes(24).toString('hex')}`),
    }).catch((error: unknown) => error);
    expect(forjada).toBeInstanceOf(
      Stripe.errors.StripeSignatureVerificationError
    );

    // Corpo adulterado depois de assinado.
    const adulterada = await processStripeWebhook({
      payload: payload.replace('"active"', '"trialing"'),
      signature: assinar(payload),
    }).catch((error: unknown) => error);
    expect(adulterada).toBeInstanceOf(
      Stripe.errors.StripeSignatureVerificationError
    );

    expect(
      await contar(
        "SELECT COUNT(*) AS total FROM billing_webhook_events WHERE provider = 'stripe'"
      )
    ).toBe(0);
  });

  it('ativa o plano pago e ignora a reentrega do mesmo evento', async () => {
    const usuario = await criarUsuario('patient', 'Cliente');
    const assinaturaId = `sub_${randomUUID().slice(0, 12)}`;
    const clienteId = `cus_${randomUUID().slice(0, 12)}`;
    const payload = eventoDeAssinatura({
      tipo: 'customer.subscription.created',
      usuario,
      status: 'active',
      assinaturaId,
      clienteId,
    });

    const primeira = await processStripeWebhook({
      payload,
      signature: assinar(payload),
    });
    expect(primeira.duplicate).toBe(false);
    expect(await planoAtivo(usuario)).toEqual([
      { plan_key: 'meta', source: 'stripe' },
    ]);
    const mapeamento = await queryRows<{ external_customer_id: string }>(
      'SELECT external_customer_id FROM billing_customers WHERE user_id = ?',
      [usuario.id]
    );
    expect(mapeamento[0]?.external_customer_id).toBe(clienteId);

    const reentrega = await processStripeWebhook({
      payload,
      signature: assinar(payload),
    });
    expect(reentrega.duplicate).toBe(true);
    expect(await planoAtivo(usuario)).toHaveLength(1);
    const evento = await queryRows<{ status: string }>(
      'SELECT status FROM billing_webhook_events WHERE external_event_id = ?',
      [primeira.eventId]
    );
    expect(evento[0]?.status).toBe('processed');
  });

  it('cancelamento devolve o usuário ao plano gratuito', async () => {
    const usuario = await criarUsuario('patient', 'Cancelamento');
    const assinaturaId = `sub_${randomUUID().slice(0, 12)}`;
    const clienteId = `cus_${randomUUID().slice(0, 12)}`;
    const ativa = eventoDeAssinatura({
      tipo: 'customer.subscription.created',
      usuario,
      status: 'active',
      assinaturaId,
      clienteId,
    });
    await processStripeWebhook({ payload: ativa, signature: assinar(ativa) });

    const cancelada = eventoDeAssinatura({
      tipo: 'customer.subscription.deleted',
      usuario,
      status: 'canceled',
      assinaturaId,
      clienteId,
    });
    await processStripeWebhook({
      payload: cancelada,
      signature: assinar(cancelada),
    });

    const ativos = await planoAtivo(usuario);
    expect(ativos).toHaveLength(1);
    expect(ativos[0]?.plan_key).toBe('free');
    expect(
      await contar(
        `SELECT COUNT(*) AS total FROM user_subscriptions
         WHERE external_subscription_id = ? AND status = 'canceled'`,
        [assinaturaId]
      )
    ).toBeGreaterThanOrEqual(1);
  });

  it('registra o erro quando o price id não pertence a nenhum plano', async () => {
    const usuario = await criarUsuario('patient', 'PrecoDesconhecido');
    const payload = eventoDeAssinatura({
      tipo: 'customer.subscription.updated',
      usuario,
      status: 'active',
      assinaturaId: `sub_${randomUUID().slice(0, 12)}`,
      clienteId: `cus_${randomUUID().slice(0, 12)}`,
    }).replaceAll(precoMetaMensal, 'price_inexistente');

    const erro = await processStripeWebhook({
      payload,
      signature: assinar(payload),
    }).catch((error: unknown) => error);
    expect(erro).toBeInstanceOf(HttpError);
    expect((erro as HttpError).statusCode).toBe(400);

    const id = (JSON.parse(payload) as { id: string }).id;
    const evento = await queryRows<{ status: string; error_message: string }>(
      'SELECT status, error_message FROM billing_webhook_events WHERE external_event_id = ?',
      [id]
    );
    expect(evento[0]?.status).toBe('error');
    expect(evento[0]?.error_message).toContain('price_inexistente');
  });
});
