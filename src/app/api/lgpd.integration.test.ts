import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import Stripe from 'stripe';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { processStripeWebhook } from '@/lib/billing/service';
import { HttpError } from '@/lib/http-error';
import { runSelectQuery } from '@/lib/mysql/data-api';
import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { resolveStoragePath } from '@/lib/storage/local';

import {
  contar,
  criarUsuario,
  type UsuarioDeTeste,
} from '../../../tests/integration/fixtures';
import { chamar, cookieJar, entrarComo } from '../../../tests/integration/http';

import * as conta from './account/route';
import * as consentimentos from './account/consents/route';
import * as exportacao from './account/export/route';
import * as compras from './account/purchases/route';
import * as fiscais from './admin/fiscal-records/route';
import * as usuarioAdmin from './admin/users/[userId]/route';
import * as listaAdmin from './admin/users/route';
import * as dados from './data/[table]/route';
import * as register from './auth/register/route';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

// LGPD (tarefa 28) contra o MySQL real: consentimento, portabilidade,
// segregação dos dados do titular, registros fiscais e exclusão da conta.
// As faturas chegam por webhook assinado localmente pela SDK da Stripe (sem
// rede), como no teste do serviço de cobrança.

const ORIGEM = { 'x-forwarded-for': '203.0.113.28' };
const SENHA = 'Senha-Lgpd-2026';
const AMBIENTE_ORIGINAL = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};
const segredoWebhook = `whsec_${randomBytes(24).toString('hex')}`;
const precoCareAnual = `price_lgpd_${randomUUID().slice(0, 8)}`;
const sdk = new Stripe('sk_test_somente_assinatura_local');

let admin: UsuarioDeTeste;

async function cadastrar(nome: string) {
  const email = `lgpd-${nome}-${randomUUID().slice(0, 8)}@teste.lyra.local`;
  const resposta = await chamar(register.POST, {
    method: 'POST',
    body: { email, password: SENHA, firstName: nome, acceptTerms: true },
    headers: ORIGEM,
    usuario: null,
  });
  expect(resposta.status).toBe(200);
  const id = (resposta.json as { session: { user: { id: string } } }).session
    .user.id;
  const usuario: UsuarioDeTeste = {
    id,
    email,
    role: 'patient',
    session: {
      user: {
        id,
        email,
        role: 'patient',
        onboarding_completed: false,
        user_metadata: { first_name: nome },
      },
    },
  };
  return usuario;
}

async function faturaPaga(options: {
  usuario: UsuarioDeTeste | null;
  clienteId: string;
}) {
  const agora = Math.floor(Date.now() / 1000);
  const fatura = {
    id: `in_${randomUUID().replace(/-/g, '').slice(0, 20)}`,
    object: 'invoice',
    number: `LYRA-${randomUUID().slice(0, 6).toUpperCase()}`,
    customer: options.clienteId,
    customer_name: 'Comprador Fiscal',
    customer_email: 'comprador@teste.lyra.local',
    customer_tax_ids: [{ type: 'br_cpf', value: '000.000.001-91' }],
    customer_address: { city: 'Recife', country: 'BR', state: 'PE' },
    currency: 'brl',
    subtotal: 29900,
    total: 29900,
    total_taxes: [],
    created: agora,
    effective_at: agora,
    period_start: agora,
    period_end: agora + 365 * 24 * 3600,
    status: 'paid',
    status_transitions: { paid_at: agora },
    hosted_invoice_url: 'https://invoice.stripe.com/i/teste',
    parent: {
      type: 'subscription_details',
      subscription_details: {
        subscription: 'sub_lgpd',
        metadata: options.usuario ? { lyra_user_id: options.usuario.id } : {},
      },
    },
    lines: {
      object: 'list',
      data: [
        {
          id: `il_${randomUUID().slice(0, 8)}`,
          object: 'line_item',
          description: 'Lyra Care (anual)',
          pricing: {
            type: 'price_details',
            price_details: { price: precoCareAnual, product: 'prod_lgpd' },
          },
        },
      ],
    },
  };
  const payload = JSON.stringify({
    id: `evt_${randomUUID().replace(/-/g, '')}`,
    object: 'event',
    type: 'invoice.paid',
    created: agora,
    data: { object: fatura },
  });
  await processStripeWebhook({
    payload,
    signature: sdk.webhooks.generateTestHeaderString({
      payload,
      secret: segredoWebhook,
    }),
  });
  return { faturaId: fatura.id, payload };
}

beforeAll(async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_somente_assinatura_local';
  process.env.STRIPE_WEBHOOK_SECRET = segredoWebhook;
  await executeStatement(
    `UPDATE subscription_plans SET external_annual_price_id = ? WHERE plan_key = 'care'`,
    [precoCareAnual]
  );
  admin = await criarUsuario('admin', 'AdminLgpd');
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

describe('consentimento', () => {
  it('registra o consentimento de dados de saúde, sem duplicar', async () => {
    const pessoa = await cadastrar('consentimento');
    for (let i = 0; i < 2; i++) {
      const resposta = await chamar(consentimentos.POST, {
        method: 'POST',
        body: { types: ['health_data_processing'] },
        usuario: pessoa,
      });
      expect(resposta.status).toBe(200);
    }
    const lista = await chamar(consentimentos.GET, { usuario: pessoa });
    const tipos = (
      lista.json as { consentimentos: { consent_type: string }[] }
    ).consentimentos.map((item) => item.consent_type);
    expect(tipos.sort()).toEqual([
      'health_data_processing',
      'privacy_policy',
      'terms_of_use',
    ]);

    const invalido = await chamar(consentimentos.POST, {
      method: 'POST',
      body: { types: ['marketing'] },
      usuario: pessoa,
    });
    expect(invalido.status).toBe(400);
  });
});

describe('segregação: dados do titular longe do administrador', () => {
  it('o administrador vê só identificação e papel das outras contas', async () => {
    const pessoa = await criarUsuario('patient', 'Sensivel');
    await executeStatement(
      `UPDATE profiles SET birth_date = '1990-01-01', gender = 'female',
         birth_location = 'Natal', goals = '["reduce_stress"]' WHERE id = ?`,
      [pessoa.id]
    );

    // `*` devolve só as colunas liberadas.
    const todos = await runSelectQuery({
      table: 'profiles',
      select: '*',
      filters: [{ type: 'eq', column: 'id', value: pessoa.id }],
      orders: [],
      session: admin.session,
    });
    const linha = (todos.data as Record<string, unknown>[])[0];
    expect(linha.email).toBe(pessoa.email);
    for (const sensivel of [
      'birth_date',
      'gender',
      'birth_location',
      'goals',
      'age',
      'tracks_menstrual_cycle',
    ]) {
      expect(linha).not.toHaveProperty(sensivel);
    }

    // Pedir, filtrar ou ordenar por dado sensível de outra conta: 403.
    for (const consulta of [
      { select: 'id, birth_date', filters: [], orders: [] },
      {
        select: 'id',
        filters: [{ type: 'eq' as const, column: 'gender', value: 'female' }],
        orders: [],
      },
      {
        select: 'id',
        filters: [],
        orders: [{ column: 'birth_date', ascending: true }],
      },
      {
        select: 'id',
        filters: [
          { type: 'or' as const, expression: 'birth_location.ilike.%nat%' },
        ],
        orders: [],
      },
    ]) {
      const erro = await runSelectQuery({
        table: 'profiles',
        ...consulta,
        session: admin.session,
      }).catch((error: unknown) => error);
      expect(erro).toBeInstanceOf(HttpError);
      expect((erro as HttpError).statusCode).toBe(403);
    }

    // O próprio perfil do administrador continua completo para ele.
    const proprio = await runSelectQuery({
      table: 'profiles',
      select: 'id, birth_date',
      filters: [{ type: 'eq', column: 'id', value: admin.id }],
      orders: [],
      session: admin.session,
    });
    expect(proprio.error).toBeNull();
  });

  it('métricas: só quem registrou e quando; nenhuma alteração', async () => {
    const pessoa = await criarUsuario('patient', 'Metricas');
    await executeStatement(
      `INSERT INTO daily_metrics (id, user_id, date, steps, hrv_ms) VALUES (?, ?, CURDATE(), 5000, 61)`,
      [randomUUID(), pessoa.id]
    );
    const resposta = await chamar(dados.GET, {
      path: `/api/data/daily_metrics?select=*&filters=${encodeURIComponent(
        JSON.stringify([{ type: 'eq', column: 'user_id', value: pessoa.id }])
      )}`,
      params: { table: 'daily_metrics' },
      usuario: admin,
    });
    expect(resposta.status).toBe(200);
    const linhas = (resposta.json as { data: Record<string, unknown>[] }).data;
    expect(linhas).toHaveLength(1);
    expect(Object.keys(linhas[0]).sort()).toEqual([
      'created_at',
      'date',
      'id',
      'user_id',
    ]);

    const alteracao = await chamar(dados.PATCH, {
      method: 'PATCH',
      params: { table: 'daily_metrics' },
      body: {
        values: { steps: 1 },
        filters: [{ type: 'eq', column: 'user_id', value: pessoa.id }],
      },
      usuario: admin,
    });
    expect(alteracao.status).toBe(403);
    expect(
      await contar(
        'SELECT COUNT(*) AS total FROM daily_metrics WHERE user_id = ? AND steps = 5000',
        [pessoa.id]
      )
    ).toBe(1);
  });

  it('perfil de outra conta: só papel e onboarding podem mudar', async () => {
    const pessoa = await criarUsuario('patient', 'Alterar');
    const sensivel = await chamar(dados.PATCH, {
      method: 'PATCH',
      params: { table: 'profiles' },
      body: {
        // Dado sensível gravável pelo titular (o local de nascimento agora só
        // muda pela rota de localização, para qualquer pessoa).
        values: { birth_time: '08:00' },
        filters: [{ type: 'eq', column: 'id', value: pessoa.id }],
      },
      usuario: admin,
    });
    expect(sensivel.status).toBe(403);

    const onboarding = await chamar(dados.PATCH, {
      method: 'PATCH',
      params: { table: 'profiles' },
      body: {
        values: { onboarding_completed: false },
        filters: [{ type: 'eq', column: 'id', value: pessoa.id }],
      },
      usuario: admin,
    });
    expect(onboarding.status).toBe(200);
  });

  it('a lista administrativa de usuários não traz dados sensíveis', async () => {
    await criarUsuario('patient', 'ListaAdmin');
    const resposta = await chamar(listaAdmin.GET, {
      path: '/api/admin/users?pageSize=5',
      usuario: admin,
    });
    expect(resposta.status).toBe(200);
    const usuarios = (resposta.json as { users: Record<string, unknown>[] })
      .users;
    expect(usuarios.length).toBeGreaterThan(0);
    for (const usuario of usuarios) {
      for (const sensivel of [
        'birthDate',
        'birthTime',
        'birthLocation',
        'gender',
        'age',
        'goals',
        'activityLevel',
      ]) {
        expect(usuario).not.toHaveProperty(sensivel);
      }
    }
  });
});

describe('registros fiscais e histórico de compras', () => {
  it('fatura paga vira registro fiscal (idempotente) e compra do titular', async () => {
    const pessoa = await cadastrar('compra');
    const outra = await cadastrar('semcompra');
    const { faturaId, payload } = await faturaPaga({
      usuario: pessoa,
      clienteId: 'cus_lgpd_compra',
    });
    // O mesmo evento reenviado pela Stripe não duplica o registro.
    await processStripeWebhook({
      payload,
      signature: sdk.webhooks.generateTestHeaderString({
        payload,
        secret: segredoWebhook,
      }),
    });
    const registros = await queryRows<{
      user_id: string;
      plan_key: string;
      billing_interval: string;
      amount_total: number;
      currency_code: string;
      buyer_tax_id: string;
    }>(
      `SELECT user_id, plan_key, billing_interval, amount_total, currency_code, buyer_tax_id
         FROM fiscal_records WHERE external_invoice_id = ?`,
      [faturaId]
    );
    expect(registros).toEqual([
      {
        user_id: pessoa.id,
        plan_key: 'care',
        billing_interval: 'annual',
        amount_total: 29900,
        currency_code: 'BRL',
        buyer_tax_id: '000.000.001-91',
      },
    ]);

    const minhas = await chamar(compras.GET, { usuario: pessoa });
    expect(
      (minhas.json as { compras: { amount_total: number }[] }).compras
    ).toEqual([expect.objectContaining({ amount_total: 29900 })]);
    const alheias = await chamar(compras.GET, { usuario: outra });
    expect((alheias.json as { compras: unknown[] }).compras).toEqual([]);
  });

  it('só o administrador consulta os registros fiscais, e só lê', async () => {
    await faturaPaga({ usuario: null, clienteId: 'cus_lgpd_sem_conta' });

    const paciente = await criarUsuario('patient', 'SemFiscal');
    const negado = await chamar(fiscais.GET, {
      path: '/api/admin/fiscal-records',
      usuario: paciente,
    });
    expect(negado.status).toBe(403);

    const hoje = new Date().toISOString().slice(0, 10);
    const resposta = await chamar(fiscais.GET, {
      path: `/api/admin/fiscal-records?de=${hoje}&ate=${hoje}`,
      usuario: admin,
    });
    expect(resposta.status).toBe(200);
    const corpo = resposta.json as {
      registros: { buyer_tax_id: string; conta_ativa: boolean }[];
      total: number;
    };
    expect(corpo.total).toBeGreaterThanOrEqual(2);
    expect(corpo.registros.some((registro) => !registro.conta_ativa)).toBe(
      true
    );

    // Não há rota de escrita: a API de dados nem conhece a tabela.
    const viaDados = await chamar(dados.DELETE, {
      method: 'DELETE',
      params: { table: 'fiscal_records' },
      body: { filters: [{ type: 'eq', column: 'id', value: 'x' }] },
      usuario: admin,
    });
    expect(viaDados.status).toBe(400);
  });
});

describe('portabilidade e exclusão da conta', () => {
  it('exporta todos os dados da própria conta, sem a senha', async () => {
    const pessoa = await cadastrar('exporta');
    await executeStatement(
      `INSERT INTO daily_metrics (id, user_id, date, steps) VALUES (?, ?, CURDATE(), 4321)`,
      [randomUUID(), pessoa.id]
    );
    await executeStatement(
      `INSERT INTO daily_briefings (id, user_id, briefing_date, content, source, inputs_hash)
       VALUES (?, ?, CURDATE(), JSON_OBJECT('manchete', 'Dia de teste'), 'local', REPEAT('a', 64))`,
      [randomUUID(), pessoa.id]
    );
    await executeStatement(
      `INSERT INTO user_notifications (id, user_id, kind, title, body, dedupe_key)
       VALUES (?, ?, 'coach_dia', 'Seu dia está pronto', 'Dia de teste', 'dia:teste')`,
      [randomUUID(), pessoa.id]
    );
    const resposta = await chamar(exportacao.GET, { usuario: pessoa });
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get('content-disposition')).toMatch(
      /attachment; filename="lyra-meus-dados-\d{4}-\d{2}-\d{2}\.json"/
    );
    expect(resposta.headers.get('cache-control')).toBe('no-store');
    expect(resposta.texto).not.toMatch(/password_hash|\$2[aby]\$/);
    const corpo = resposta.json as {
      conta: { email: string };
      perfil: { id: string };
      consentimentos: unknown[];
      daily_metrics: { steps: number }[];
      daily_briefings: { content: { manchete: string } }[];
      user_notifications: { title: string }[];
    };
    expect(corpo.conta.email).toBe(pessoa.email);
    expect(corpo.perfil.id).toBe(pessoa.id);
    expect(corpo.consentimentos).toHaveLength(2);
    expect(corpo.daily_metrics.map((linha) => linha.steps)).toEqual([4321]);
    expect(
      corpo.daily_briefings.map((linha) => linha.content.manchete)
    ).toEqual(['Dia de teste']);
    expect(corpo.user_notifications.map((linha) => linha.title)).toEqual([
      'Seu dia está pronto',
    ]);

    const visitante = await chamar(exportacao.GET, { usuario: null });
    expect(visitante.status).toBe(401);
  });

  it('exclui a conta inteira e mantém só o registro fiscal desvinculado', async () => {
    const pessoa = await cadastrar('exclui');
    const { faturaId } = await faturaPaga({
      usuario: pessoa,
      clienteId: 'cus_lgpd_exclui',
    });
    await executeStatement(
      `INSERT INTO daily_metrics (id, user_id, date, steps) VALUES (?, ?, CURDATE(), 10)`,
      [randomUUID(), pessoa.id]
    );
    await executeStatement(
      `INSERT INTO daily_briefings (id, user_id, briefing_date, content, source, inputs_hash)
       VALUES (?, ?, CURDATE(), JSON_OBJECT('manchete', 'x'), 'local', REPEAT('b', 64))`,
      [randomUUID(), pessoa.id]
    );
    await executeStatement(
      `INSERT INTO user_notifications (id, user_id, kind, title, body, dedupe_key)
       VALUES (?, ?, 'coach_alerta', 'Alerta', 'x', 'alerta:teste')`,
      [randomUUID(), pessoa.id]
    );
    const { absolute } = resolveStoragePath('avatars', [pessoa.id, 'foto.png']);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, 'x');

    await entrarComo(pessoa);
    const fraseErrada = await chamar(conta.DELETE, {
      method: 'DELETE',
      body: { currentPassword: SENHA, confirmation: 'apagar' },
    });
    expect(fraseErrada.status).toBe(400);
    const senhaErrada = await chamar(conta.DELETE, {
      method: 'DELETE',
      body: {
        currentPassword: 'senha-errada-1',
        confirmation: 'excluir minha conta',
      },
    });
    expect(senhaErrada.status).toBe(403);
    expect(
      await contar('SELECT COUNT(*) AS total FROM users WHERE id = ?', [
        pessoa.id,
      ])
    ).toBe(1);

    const resposta = await chamar(conta.DELETE, {
      method: 'DELETE',
      body: { currentPassword: SENHA, confirmation: 'EXCLUIR MINHA CONTA' },
    });
    expect(resposta.status).toBe(200);
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(false);

    for (const [tabela, coluna] of [
      ['users', 'id'],
      ['profiles', 'id'],
      ['daily_metrics', 'user_id'],
      ['daily_briefings', 'user_id'],
      ['user_notifications', 'user_id'],
      ['consent_records', 'user_id'],
      ['user_subscriptions', 'user_id'],
    ]) {
      expect(
        await contar(
          `SELECT COUNT(*) AS total FROM ${tabela} WHERE ${coluna} = ?`,
          [pessoa.id]
        )
      ).toBe(0);
    }
    const fiscal = await queryRows<{
      user_id: string | null;
      buyer_email: string;
    }>(
      'SELECT user_id, buyer_email FROM fiscal_records WHERE external_invoice_id = ?',
      [faturaId]
    );
    expect(fiscal).toEqual([
      { user_id: null, buyer_email: 'comprador@teste.lyra.local' },
    ]);
    await expect(stat(path.dirname(absolute))).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });

  it('recusa a exclusão com assinatura paga renovável ou do último administrador', async () => {
    const pagante = await cadastrar('pagante');
    await executeStatement(
      `UPDATE user_subscriptions SET source = 'stripe', cancel_at_period_end = 0
         WHERE user_id = ? AND status = 'active'`,
      [pagante.id]
    );
    await entrarComo(pagante);
    const comAssinatura = await chamar(conta.DELETE, {
      method: 'DELETE',
      body: { currentPassword: SENHA, confirmation: 'EXCLUIR MINHA CONTA' },
    });
    expect(comAssinatura.status).toBe(409);
    expect(
      await contar('SELECT COUNT(*) AS total FROM users WHERE id = ?', [
        pagante.id,
      ])
    ).toBe(1);

    // Com a renovação cancelada (não haverá nova cobrança), a exclusão segue.
    await executeStatement(
      `UPDATE user_subscriptions SET cancel_at_period_end = 1 WHERE user_id = ?`,
      [pagante.id]
    );
    const semRenovacao = await chamar(conta.DELETE, {
      method: 'DELETE',
      body: { currentPassword: SENHA, confirmation: 'EXCLUIR MINHA CONTA' },
    });
    expect(semRenovacao.status).toBe(200);

    // Único administrador: os demais são rebaixados só durante o teste.
    const outrosAdmins = await queryRows<{ id: string }>(
      "SELECT id FROM profiles WHERE role = 'admin' AND id <> ?",
      [admin.id]
    );
    try {
      for (const { id } of outrosAdmins) {
        await executeStatement(
          "UPDATE profiles SET role = 'patient' WHERE id = ?",
          [id]
        );
      }
      const erro = await import('@/lib/lgpd/conta')
        .then(({ excluirConta }) => excluirConta(admin.id))
        .catch((falha: unknown) => falha);
      expect(erro).toBeInstanceOf(HttpError);
      expect((erro as HttpError).statusCode).toBe(409);
    } finally {
      for (const { id } of outrosAdmins) {
        await executeStatement(
          "UPDATE profiles SET role = 'admin' WHERE id = ?",
          [id]
        );
      }
    }
  });

  it('o administrador exclui a conta de outra pessoa pela rota própria', async () => {
    const alvo = await criarUsuario('patient', 'ExclusaoAdmin');
    const paciente = await criarUsuario('patient', 'Intruso');

    const negado = await chamar(usuarioAdmin.DELETE, {
      method: 'DELETE',
      params: { userId: alvo.id },
      usuario: paciente,
    });
    expect(negado.status).toBe(403);

    const propria = await chamar(usuarioAdmin.DELETE, {
      method: 'DELETE',
      params: { userId: admin.id },
      usuario: admin,
    });
    expect(propria.status).toBe(400);

    const resposta = await chamar(usuarioAdmin.DELETE, {
      method: 'DELETE',
      params: { userId: alvo.id },
      usuario: admin,
    });
    expect(resposta.status).toBe(200);
    expect(
      await contar('SELECT COUNT(*) AS total FROM users WHERE id = ?', [
        alvo.id,
      ])
    ).toBe(0);
  });
});
