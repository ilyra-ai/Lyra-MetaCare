import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { gravarRegistroDoDia } from '@/lib/metricas/gravacao';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import { criarUsuario } from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';

import * as efemerides from './astrology/ephemeris/route';
import * as streaks from './data/streaks/route';
import * as avaliacoes from './data/user-assessments/route';
import * as assistente from './functions/ask-ai-assistant/route';
import * as score from './functions/calculate-longevity-score/route';
import type { EscoresDoDia } from '@/lib/ai/score-engine';
import * as plano from './functions/generate-ai-plan/route';
import * as planoSalvo from './plano/route';
import * as conexao from './functions/test-ai-connection/route';
import * as webhook from './webhooks/stripe/route';

async function comObjetivosEMetricas(nome: string) {
  const pessoa = await criarUsuario('patient', nome);
  // Coluna JSON preenchida: o mysql2 a devolve como array (antes, o
  // JSON.parse direto nesse array derrubava as rotas de IA com 500).
  await executeStatement('UPDATE profiles SET goals = ? WHERE id = ?', [
    JSON.stringify(['sleep_better', 'manage_blood_glucose']),
    pessoa.id,
  ]);
  await executeStatement(
    `INSERT INTO daily_metrics (id, user_id, date, steps, sleep_duration_minutes, hrv_ms, blood_glucose_mgdl)
     VALUES (?, ?, UTC_DATE(), 4200, 380, 35, 125)`,
    [randomUUID(), pessoa.id]
  );
  return pessoa;
}

describe('assistente de IA', () => {
  it('valida a pergunta e exige sessão', async () => {
    const pessoa = await criarUsuario('patient', 'Pergunta');
    for (const body of [{ query: '   ' }, { query: 'x'.repeat(2001) }, {}]) {
      const resposta = await chamar(assistente.POST, {
        method: 'POST',
        body,
        usuario: pessoa,
      });
      expect(resposta.status).toBe(400);
    }
    expect(
      (
        await chamar(assistente.POST, {
          method: 'POST',
          body: { query: 'oi' },
          usuario: null,
        })
      ).status
    ).toBe(401);
  });

  it('responde com o motor local para quem tem objetivos e métricas', async () => {
    const pessoa = await comObjetivosEMetricas('Objetivos');
    const resposta = await chamar(assistente.POST, {
      method: 'POST',
      body: { query: 'como está meu sono?' },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(200);
    expect((resposta.json as { response: string }).response).toMatch(/6h 20m/);
  });

  it('consome a cota antes de processar e recusa quando esgotada', async () => {
    const pessoa = await criarUsuario('patient', 'CotaChat');
    const cota = await queryRows<{ quota_value: number }>(
      `SELECT pe.quota_value FROM plan_entitlements pe
       JOIN plan_features f ON f.id = pe.feature_id
       JOIN subscription_plans p ON p.id = pe.plan_id
       WHERE p.plan_key = 'free' AND f.feature_key = 'ai_chat_messages'`
    );
    const limite = Number(cota[0]?.quota_value);
    for (let i = 0; i < limite; i += 1) {
      const ok = await chamar(assistente.POST, {
        method: 'POST',
        body: { query: 'resumo' },
        usuario: pessoa,
      });
      expect(ok.status).toBe(200);
    }
    const excedeu = await chamar(assistente.POST, {
      method: 'POST',
      body: { query: 'resumo' },
      usuario: pessoa,
    });
    expect(excedeu.status).toBe(403);
  });
});

describe('plano e score', () => {
  it('gera e persiste o plano só com dados do servidor; recusa corpo com leituras', async () => {
    const pessoa = await comObjetivosEMetricas('Plano');
    const invalido = await chamar(plano.POST, {
      method: 'POST',
      body: { metrics: { steps: 99999 } },
      usuario: pessoa,
    });
    expect(invalido.status).toBe(400);

    const gerado = await chamar(plano.POST, {
      method: 'POST',
      usuario: pessoa,
    });
    expect(gerado.status).toBe(200);
    expect(gerado.json).toMatchObject({
      pillars: { sleep: { title: 'Sono' } },
      meta: {
        origem: 'manual',
        data: new Date().toISOString().slice(0, 10),
        base: expect.arrayContaining(['Sono médio 6h20 (1 dia)']),
      },
    });
    const salvo = await queryRows('SELECT id FROM ai_plans WHERE user_id = ?', [
      pessoa.id,
    ]);
    expect(salvo).toHaveLength(1);
  });

  it('o plano salvo se refaz sozinho quando o registro do dia muda, sem cota', async () => {
    const pessoa = await comObjetivosEMetricas('PlanoAuto');
    expect((await chamar(planoSalvo.GET, { usuario: pessoa })).json).toEqual({
      plano: null,
      atualizado: false,
    });
    await chamar(plano.POST, { method: 'POST', usuario: pessoa });
    const usosAntes = await queryRows<{ used_value: number }>(
      `SELECT used_value FROM feature_usage_counters
        WHERE user_id = ? AND feature_key = 'ai_plan_generations'`,
      [pessoa.id]
    );

    const mesmo = (await chamar(planoSalvo.GET, { usuario: pessoa })).json as {
      atualizado: boolean;
    };
    expect(mesmo.atualizado).toBe(false);

    await gravarRegistroDoDia(pessoa.id, {
      data: new Date().toISOString().slice(0, 10),
      valores: { sono: 480 },
    });
    const refeito = (await chamar(planoSalvo.GET, { usuario: pessoa }))
      .json as {
      atualizado: boolean;
      plano: { meta: { origem: string; base: string[] } };
    };
    expect(refeito.atualizado).toBe(true);
    expect(refeito.plano.meta.origem).toBe('automatico');
    expect(refeito.plano.meta.base).toContain('Sono médio 8h00 (1 dia)');
    const usosDepois = await queryRows<{ used_value: number }>(
      `SELECT used_value FROM feature_usage_counters
        WHERE user_id = ? AND feature_key = 'ai_plan_generations'`,
      [pessoa.id]
    );
    expect(usosDepois).toEqual(usosAntes);
  });

  it('calcula os escores do dia pedido, sem inventar valores', async () => {
    const pessoa = await comObjetivosEMetricas('Score');
    const hoje = new Date().toISOString().slice(0, 10);
    const resposta = await chamar(score.POST, {
      method: 'POST',
      body: { data: hoje },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(200);
    const corpo = resposta.json as EscoresDoDia;
    expect(corpo).toMatchObject({
      data: hoje,
      cobertura: 4,
      totalDeMetricas: 13,
      // Inserido direto no banco, sem passar pela gravação: sem prontidão.
      readinessScore: null,
    });
    expect(corpo.longevityScore).toBeGreaterThanOrEqual(0);
    expect(corpo.longevityScore).toBeLessThanOrEqual(10);

    // O check-in grava a prontidão do dia no servidor.
    await gravarRegistroDoDia(pessoa.id, {
      data: hoje,
      valores: { energia: 4, estresse: 20 },
    });
    const depois = (
      await chamar(score.POST, {
        method: 'POST',
        body: { data: hoje },
        usuario: pessoa,
      })
    ).json as EscoresDoDia;
    expect(depois.readinessScore).toEqual(expect.any(Number));
    expect(depois.recoveryScore).toEqual(expect.any(Number));

    // Dia sem registro: tudo nulo (antes: longevidade 5 e prontidão 50).
    const ontem = new Date(Date.now() - 2 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const vazio = (
      await chamar(score.POST, {
        method: 'POST',
        body: { data: ontem },
        usuario: pessoa,
      })
    ).json as EscoresDoDia;
    expect(vazio).toEqual({
      data: ontem,
      readinessScore: null,
      recoveryScore: null,
      longevityScore: null,
      cobertura: 0,
      totalDeMetricas: 13,
    });

    const invalida = await chamar(score.POST, {
      method: 'POST',
      body: { data: '2020-01-01' },
      usuario: pessoa,
    });
    expect(invalida.status).toBe(400);
  });

  it('teste de conexão da IA é restrito a administradores', async () => {
    expect(
      (await chamar(conexao.POST, { method: 'POST', usuario: null })).status
    ).toBe(401);
    const pessoa = await criarUsuario('patient', 'Conexao');
    expect(
      (await chamar(conexao.POST, { method: 'POST', usuario: pessoa })).status
    ).toBe(403);
  });
});

describe('avaliações, streaks e efemérides', () => {
  it('avaliação WHO-5 válida grava; inválida responde 400', async () => {
    const pessoa = await criarUsuario('patient', 'Who5');
    const valida = await chamar(avaliacoes.POST, {
      method: 'POST',
      body: {
        type: 'who5',
        payload: { answers: { '1': 4, '2': 3, '3': 5, '4': 2, '5': 4 } },
      },
      usuario: pessoa,
    });
    expect(valida.json).toMatchObject({ success: true, scoreValue: 72 });
    const invalida = await chamar(avaliacoes.POST, {
      method: 'POST',
      body: { type: 'who5', payload: { answers: { '1': 9 } } },
      usuario: pessoa,
    });
    expect(invalida.status).toBe(400);
  });

  it('streaks são só leitura: sem registro do dia não há sequência', async () => {
    const pessoa = await criarUsuario('patient', 'Streak');
    const resposta = await chamar(streaks.GET, { usuario: pessoa });
    expect(resposta.status).toBe(200);
    expect(resposta.json).toEqual({
      success: true,
      streaks: [],
      adherence: { score: 0, level: 'baixa' },
    });
    expect((await chamar(streaks.GET, { usuario: null })).status).toBe(401);
  });

  it('efemérides: data inválida 400, válida 200', async () => {
    expect(
      (
        await chamar(efemerides.GET, {
          path: '/api/astrology/ephemeris?date=ontem',
        })
      ).status
    ).toBe(400);
    const valida = await chamar(efemerides.GET, {
      path: '/api/astrology/ephemeris?date=2026-03-03T07:38:00Z',
    });
    expect(valida.status).toBe(200);
    expect(valida.json).toMatchObject({
      success: true,
      data: { tithi: 'Purnima (Shukla Paksha)' },
    });
  });
});

describe('webhook Stripe (rota)', () => {
  it('sem segredo configurado responde 503; sem assinatura, 400', async () => {
    const original = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const semSegredo = await chamar(webhook.POST, {
      method: 'POST',
      rawBody: '{}',
    });
    expect(semSegredo.status).toBe(503);

    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_teste_rota';
    const semAssinatura = await chamar(webhook.POST, {
      method: 'POST',
      rawBody: '{}',
    });
    expect(semAssinatura.status).toBe(400);

    // `||=` e não `??=`: com o `.env.local` carregado a chave existe, mas
    // vazia ("não configurada"), e a rota responderia 503 antes de checar a
    // assinatura.
    const chaveOriginal = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY ||= 'sk_test_somente_assinatura_local';
    const assinaturaFalsa = await chamar(webhook.POST, {
      method: 'POST',
      rawBody: '{}',
      headers: { 'stripe-signature': 't=1,v1=abc' },
    });
    expect(assinaturaFalsa.status).toBe(400);
    expect(assinaturaFalsa.json).toEqual({
      error: 'Assinatura do webhook inválida.',
    });

    if (original === undefined) {
      delete process.env.STRIPE_WEBHOOK_SECRET;
    } else {
      process.env.STRIPE_WEBHOOK_SECRET = original;
    }
    if (chaveOriginal === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = chaveOriginal;
    }
  });
});
