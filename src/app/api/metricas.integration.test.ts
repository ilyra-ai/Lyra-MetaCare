import { describe, expect, it } from 'vitest';

import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { assignPlanToUserByAdmin } from '@/lib/plans/service';

import { criarUsuario } from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';

import * as avaliacoes from './data/user-assessments/route';
import * as dados from './data/[table]/route';
import * as dia from './metricas/dia/route';
import * as sensor from './metricas/sensor/route';

// Data UTC de hoje: dentro da janela aceita (amanhã UTC até 7 dias atrás).
const hoje = new Date().toISOString().slice(0, 10);

async function linhaDoDia(userId: string) {
  const [linha] = await queryRows<Record<string, string | number | null>>(
    `SELECT steps, sleep_duration_minutes, mood_score, energy_level, weight_kg,
            resting_heart_rate, resting_heart_rate_min, resting_heart_rate_max,
            sensor_heart_rate_avg, sensor_minutes, hrv_ms, metrics_updated_at
       FROM daily_metrics WHERE user_id = ? AND date = ?`,
    [userId, hoje]
  );
  return linha ?? null;
}

describe('registro do dia (POST /api/metricas/dia)', () => {
  it('grava só o informado e preserva o restante do dia', async () => {
    const pessoa = await criarUsuario('patient', 'Registro');
    const primeira = await chamar(dia.POST, {
      method: 'POST',
      body: {
        data: hoje,
        valores: { passos: 8200, sono: 435, humor: 4, energia: 3 },
      },
      usuario: pessoa,
    });
    expect(primeira.status).toBe(200);

    const segunda = await chamar(dia.POST, {
      method: 'POST',
      body: { data: hoje, valores: { peso: 71.4, energia: 5 } },
      usuario: pessoa,
    });
    expect(segunda.status).toBe(200);

    const linha = await linhaDoDia(pessoa.id);
    expect(linha).toMatchObject({
      steps: 8200,
      sleep_duration_minutes: 435,
      energy_level: 5,
    });
    expect(Number(linha?.mood_score)).toBe(4);
    expect(Number(linha?.weight_kg)).toBe(71.4);
    expect(linha?.metrics_updated_at).not.toBeNull();

    const leitura = await chamar(dia.GET, {
      path: `/api/metricas/dia?data=${hoje}`,
      usuario: pessoa,
    });
    expect(leitura.status).toBe(200);
    expect(leitura.json).toMatchObject({
      registro: { steps: 8200, energy_level: 5 },
    });
  });

  it.each([
    ['fora da faixa', { data: hoje, valores: { passos: 999_999 } }],
    ['humor fora da escala', { data: hoje, valores: { humor: 7 } }],
    ['decimal em campo inteiro', { data: hoje, valores: { passos: 10.5 } }],
    [
      'diastólica maior que a sistólica',
      {
        data: hoje,
        valores: { pressaoSistolica: 110, pressaoDiastolica: 120 },
      },
    ],
    ['sem nenhuma métrica', { data: hoje, valores: {} }],
    ['campo desconhecido', { data: hoje, valores: { readiness: 90 } }],
    ['data antiga', { data: '2020-01-01', valores: { passos: 10 } }],
    ['data inexistente', { data: '2026-02-30', valores: { passos: 10 } }],
  ])('recusa %s com 400', async (_caso, corpo) => {
    const pessoa = await criarUsuario('patient', 'Invalido');
    const resposta = await chamar(dia.POST, {
      method: 'POST',
      body: corpo,
      usuario: pessoa,
    });
    expect(resposta.status).toBe(400);
    expect(await linhaDoDia(pessoa.id)).toBeNull();
  });

  it('exige sessão', async () => {
    const resposta = await chamar(dia.POST, {
      method: 'POST',
      body: { data: hoje, valores: { passos: 10 } },
      usuario: null,
    });
    expect(resposta.status).toBe(401);
  });

  it('a API genérica de dados não grava métricas do dia', async () => {
    const pessoa = await criarUsuario('patient', 'Generica');
    const resposta = await chamar(dados.POST, {
      method: 'POST',
      params: { table: 'daily_metrics' },
      body: {
        values: { user_id: pessoa.id, date: hoje, steps: 999_999_999 },
      },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(403);
    expect(resposta.texto).toContain('/api/metricas/dia');
    expect(await linhaDoDia(pessoa.id)).toBeNull();
  });

  it('o humor da avaliação entra no registro do dia', async () => {
    const pessoa = await criarUsuario('patient', 'Humor');
    const resposta = await chamar(avaliacoes.POST, {
      method: 'POST',
      body: { type: 'mood', payload: { moodValue: '2', data: hoje } },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(200);
    expect(Number((await linhaDoDia(pessoa.id))?.mood_score)).toBe(2);
  });
});

describe('sessão da pulseira (POST /api/metricas/sensor)', () => {
  const sessao = {
    data: hoje,
    minutos: 10,
    amostras: 600,
    fcMinima: 58,
    fcMaxima: 96,
    fcMedia: 72,
    fcRepousoEstimada: 61,
    rmssd: 48.2,
  };

  it('plano sem wearable recebe 403 e nada é gravado', async () => {
    const pessoa = await criarUsuario('patient', 'Free');
    const resposta = await chamar(sensor.POST, {
      method: 'POST',
      body: sessao,
      usuario: pessoa,
    });
    expect(resposta.status).toBe(403);
    expect(await linhaDoDia(pessoa.id)).toBeNull();
  });

  it('soma as sessões do dia sem apagar o check-in', async () => {
    const admin = await criarUsuario('admin', 'Plano');
    const pessoa = await criarUsuario('patient', 'Pulseira');
    await assignPlanToUserByAdmin({
      targetUserId: pessoa.id,
      actorUserId: admin.id,
      planKey: 'meta',
    });

    // Check-in com FC de repouso 64 e passos.
    await chamar(dia.POST, {
      method: 'POST',
      body: { data: hoje, valores: { passos: 3000, fcRepouso: 64 } },
      usuario: pessoa,
    });

    expect(
      (
        await chamar(sensor.POST, {
          method: 'POST',
          body: sessao,
          usuario: pessoa,
        })
      ).status
    ).toBe(200);

    let linha = await linhaDoDia(pessoa.id);
    expect(Number(linha?.resting_heart_rate_min)).toBe(58);
    expect(Number(linha?.resting_heart_rate_max)).toBe(96);
    expect(Number(linha?.sensor_heart_rate_avg)).toBe(72);
    expect(Number(linha?.sensor_minutes)).toBe(10);
    // Repouso: o menor entre o check-in (64) e a estimativa (61).
    expect(Number(linha?.resting_heart_rate)).toBe(61);
    expect(Number(linha?.hrv_ms)).toBe(48.2);
    expect(linha?.steps).toBe(3000);

    // Segunda sessão: 30 min a 82 bpm, sem estimativa de repouso nem VFC.
    expect(
      (
        await chamar(sensor.POST, {
          method: 'POST',
          body: {
            ...sessao,
            minutos: 30,
            amostras: 1800,
            fcMinima: 70,
            fcMaxima: 132,
            fcMedia: 82,
            fcRepousoEstimada: null,
            rmssd: null,
          },
          usuario: pessoa,
        })
      ).status
    ).toBe(200);

    linha = await linhaDoDia(pessoa.id);
    expect(Number(linha?.resting_heart_rate_min)).toBe(58);
    expect(Number(linha?.resting_heart_rate_max)).toBe(132);
    // Média ponderada: (72×10 + 82×30) / 40 = 79,5.
    expect(Number(linha?.sensor_heart_rate_avg)).toBe(79.5);
    expect(Number(linha?.sensor_minutes)).toBe(40);
    expect(Number(linha?.resting_heart_rate)).toBe(61);
    expect(Number(linha?.hrv_ms)).toBe(48.2);
  });

  it('frequência no limite pessoal vira um aviso por dia no sino', async () => {
    const admin = await criarUsuario('admin', 'Plano');
    const pessoa = await criarUsuario('patient', 'FcAlta');
    await assignPlanToUserByAdmin({
      targetUserId: pessoa.id,
      actorUserId: admin.id,
      planKey: 'meta',
    });
    const avisos = () =>
      queryRows<{ title: string }>(
        `SELECT title FROM user_notifications
          WHERE user_id = ? AND dedupe_key LIKE 'fc-alta:%'`,
        [pessoa.id]
      );
    const enviar = (fcMaxima: number) =>
      chamar(sensor.POST, {
        method: 'POST',
        body: { ...sessao, fcMaxima },
        usuario: pessoa,
      });

    // Sem idade no perfil não há limite: nenhum aviso.
    expect((await enviar(175)).status).toBe(200);
    expect(await avisos()).toEqual([]);

    // 40 anos: limite = 0,9 × (208 − 28) = 162 bpm.
    await executeStatement('UPDATE profiles SET age = 40 WHERE id = ?', [
      pessoa.id,
    ]);
    await enviar(150);
    expect(await avisos()).toEqual([]);
    await enviar(170);
    await enviar(180);
    expect(await avisos()).toEqual([
      { title: 'Frequência cardíaca chegou a 170 bpm' },
    ]);
  });

  it('recusa sessão incoerente', async () => {
    const admin = await criarUsuario('admin', 'Plano');
    const pessoa = await criarUsuario('patient', 'Incoerente');
    await assignPlanToUserByAdmin({
      targetUserId: pessoa.id,
      actorUserId: admin.id,
      planKey: 'care',
    });
    const resposta = await chamar(sensor.POST, {
      method: 'POST',
      body: { ...sessao, fcMinima: 100, fcMedia: 72 },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(400);
    expect(await linhaDoDia(pessoa.id)).toBeNull();
  });
});
