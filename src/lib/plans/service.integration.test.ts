import { beforeAll, describe, expect, it } from 'vitest';

import { HttpError } from '@/lib/http-error';
import { queryRows } from '@/lib/mysql/pool';
import {
  assertActiveRowsQuota,
  assignPlanToUserByAdmin,
  consumeUsageQuota,
  ensureUserSubscription,
  getAccountSubscriptionSummary,
  getMetricsHistoryLimit,
  getPlanMatrix,
  requireFeatureEnabled,
} from '@/lib/plans/service';
import type { PlanFeatureKey, PlanKey } from '@/types/subscription';

import {
  contar,
  criarUsuario,
  type UsuarioDeTeste,
} from '../../../tests/integration/fixtures';

// Regras de plano contra a matriz real semeada pelas migrations (003): os
// valores esperados são lidos do próprio banco, não fixados no teste.

interface Direito {
  enabled: number;
  quota_value: number | null;
}

async function direito(plano: PlanKey, recurso: PlanFeatureKey) {
  const linhas = await queryRows<Direito>(
    `SELECT pe.enabled, pe.quota_value
     FROM plan_entitlements pe
     JOIN plan_features f ON f.id = pe.feature_id
     JOIN subscription_plans p ON p.id = pe.plan_id
     WHERE p.plan_key = ? AND f.feature_key = ?`,
    [plano, recurso]
  );
  const linha = linhas[0];
  if (!linha) {
    throw new Error(`Direito ausente na matriz: ${plano}/${recurso}`);
  }
  return {
    enabled: linha.enabled === 1,
    quota: linha.quota_value === null ? null : Number(linha.quota_value),
  };
}

async function assinaturasAtivas(usuario: UsuarioDeTeste) {
  return contar(
    `SELECT COUNT(*) AS total FROM user_subscriptions
     WHERE user_id = ? AND status = 'active'`,
    [usuario.id]
  );
}

async function statusDe(promessa: Promise<unknown>) {
  try {
    await promessa;
    return 200;
  } catch (error) {
    if (error instanceof HttpError) {
      return error.statusCode;
    }
    throw error;
  }
}

let admin: UsuarioDeTeste;

beforeAll(async () => {
  admin = await criarUsuario('admin', 'Gestora');
});

describe('planos · assinatura', () => {
  it('cria a assinatura gratuita uma única vez, mesmo com chamadas repetidas', async () => {
    const pessoa = await criarUsuario('patient', 'Nova');
    const primeira = await ensureUserSubscription(pessoa.id, 'free');
    const segunda = await ensureUserSubscription(pessoa.id, 'free');
    expect(primeira.plan_key).toBe('free');
    expect(segunda.subscription_id).toBe(primeira.subscription_id);
    expect(await assinaturasAtivas(pessoa)).toBe(1);
  });

  it('chamadas simultâneas criam uma única assinatura ativa', async () => {
    const pessoa = await criarUsuario('patient', 'Simultânea');
    const resultados = await Promise.all(
      Array.from({ length: 8 }, () => ensureUserSubscription(pessoa.id, 'free'))
    );
    expect(new Set(resultados.map((r) => r.subscription_id)).size).toBe(1);
    expect(await assinaturasAtivas(pessoa)).toBe(1);
  });

  it('resume a assinatura com os recursos da matriz', async () => {
    const pessoa = await criarUsuario('patient', 'Resumo');
    const resumo = await getAccountSubscriptionSummary(pessoa.id, 'patient');
    expect(resumo.plan.key).toBe('free');
    const chat = resumo.features.find((f) => f.key === 'ai_chat_messages');
    const esperado = await direito('free', 'ai_chat_messages');
    expect(chat?.quotaValue).toBe(esperado.quota);
    expect(chat?.usedValue).toBe(0);
    expect(chat?.remainingValue).toBe(esperado.quota);
  });

  it('a troca de plano pelo administrador substitui a assinatura ativa', async () => {
    const pessoa = await criarUsuario('patient', 'Upgrade');
    await ensureUserSubscription(pessoa.id, 'free');
    await assignPlanToUserByAdmin({
      targetUserId: pessoa.id,
      actorUserId: admin.id,
      planKey: 'care',
      billingInterval: 'annual',
    });
    expect(await assinaturasAtivas(pessoa)).toBe(1);
    const resumo = await getAccountSubscriptionSummary(pessoa.id, 'patient');
    expect(resumo.plan.key).toBe('care');
    expect(resumo.billingInterval).toBe('annual');
    expect(
      await contar(
        `SELECT COUNT(*) AS total FROM user_subscriptions
         WHERE user_id = ? AND status = 'replaced' AND ended_at IS NOT NULL`,
        [pessoa.id]
      )
    ).toBe(1);
  });

  it('a matriz pública lista os três planos em ordem', async () => {
    const matriz = await getPlanMatrix();
    expect(matriz.plans.map((plano) => plano.key)).toEqual([
      'free',
      'meta',
      'care',
    ]);
    for (const plano of matriz.plans) {
      expect(plano.features.length).toBeGreaterThan(0);
    }
  });
});

describe('planos · recursos e cotas', () => {
  it('bloqueia recursos desligados no plano e libera administradores', async () => {
    const pessoa = await criarUsuario('patient', 'Recursos');
    const bluetooth = await direito('free', 'wearable_bluetooth_connection');
    expect(
      await statusDe(
        requireFeatureEnabled(pessoa.session, 'wearable_bluetooth_connection')
      )
    ).toBe(bluetooth.enabled ? 200 : 403);
    expect(
      await statusDe(
        requireFeatureEnabled(admin.session, 'wearable_bluetooth_connection')
      )
    ).toBe(200);
  });

  it('consome a cota mensal até o limite e então recusa', async () => {
    const pessoa = await criarUsuario('patient', 'Cota');
    const { quota } = await direito('free', 'ai_plan_generations');
    expect(quota).not.toBeNull();
    for (let usado = 0; usado < (quota as number); usado += 1) {
      await consumeUsageQuota({
        session: pessoa.session,
        featureKey: 'ai_plan_generations',
      });
    }
    expect(
      await statusDe(
        consumeUsageQuota({
          session: pessoa.session,
          featureKey: 'ai_plan_generations',
        })
      )
    ).toBe(403);
    const resumo = await getAccountSubscriptionSummary(pessoa.id, 'patient');
    const recurso = resumo.features.find(
      (f) => f.key === 'ai_plan_generations'
    );
    expect(recurso?.usedValue).toBe(quota);
    expect(recurso?.remainingValue).toBe(0);
  });

  it('consumos simultâneos nunca ultrapassam a cota', async () => {
    const pessoa = await criarUsuario('patient', 'Concorrência');
    const { quota } = await direito('free', 'ai_chat_messages');
    const tentativas = (quota as number) + 5;
    const resultados = await Promise.all(
      Array.from({ length: tentativas }, () =>
        statusDe(
          consumeUsageQuota({
            session: pessoa.session,
            featureKey: 'ai_chat_messages',
          })
        )
      )
    );
    expect(resultados.filter((status) => status === 200)).toHaveLength(
      quota as number
    );
    expect(resultados.filter((status) => status === 403)).toHaveLength(5);
    const contador = await queryRows<{ used_value: number }>(
      `SELECT used_value FROM feature_usage_counters
       WHERE user_id = ? AND feature_key = 'ai_chat_messages'`,
      [pessoa.id]
    );
    expect(contador.map((linha) => Number(linha.used_value))).toEqual([quota]);
  });

  it('respeita a cota de linhas ativas', async () => {
    const pessoa = await criarUsuario('patient', 'Profissionais');
    const { quota } = await direito('free', 'professionals_total');
    expect(
      await statusDe(
        assertActiveRowsQuota({
          session: pessoa.session,
          featureKey: 'professionals_total',
          currentCount: (quota as number) - 1,
        })
      )
    ).toBe(200);
    expect(
      await statusDe(
        assertActiveRowsQuota({
          session: pessoa.session,
          featureKey: 'professionals_total',
          currentCount: quota as number,
        })
      )
    ).toBe(403);
  });

  it('o histórico de métricas segue o plano; administradores não têm limite', async () => {
    const pessoa = await criarUsuario('patient', 'Histórico');
    const { quota } = await direito('free', 'metrics_history_days');
    expect(await getMetricsHistoryLimit(pessoa.session)).toBe(quota);
    expect(await getMetricsHistoryLimit(admin.session)).toBeNull();
  });
});
