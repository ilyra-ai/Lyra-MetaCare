import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { gravarRegistroDoDia } from '@/lib/metricas/gravacao';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import { criarUsuario } from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';

import * as dados from './data/[table]/route';
import * as streaks from './data/streaks/route';
import * as metas from './metas/route';
import * as sincronizar from './metas/sincronizar/route';

// Sem cidade no perfil, o "hoje" da pessoa é o dia UTC.
function diaUtc(diasAtras = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - diasAtras);
  return d.toISOString().slice(0, 10);
}

async function meta(id: string) {
  const [linha] = await queryRows<{
    current_value: number;
    status: string;
    auto_sample_days: number | null;
    metric_direction: string | null;
    title: string;
  }>(
    `SELECT current_value, status, auto_sample_days, metric_direction, title
       FROM goals WHERE id = ?`,
    [id]
  );
  return linha;
}

describe('metas automáticas (POST /api/metas)', () => {
  it('cria a meta e o progresso acompanha o registro do dia sozinho', async () => {
    const pessoa = await criarUsuario('patient', 'MetaSono');
    const criada = await chamar(metas.POST, {
      method: 'POST',
      body: { metrica: 'sono', alvo: 7.5 },
      usuario: pessoa,
    });
    expect(criada.status).toBe(201);
    const id = (criada.json as { meta: { id: string } }).meta.id;
    expect(await meta(id)).toMatchObject({
      title: 'Sono por noite: 7,5 h',
      current_value: 0,
      status: 'in_progress',
      auto_sample_days: 0,
      metric_direction: 'up',
    });

    await gravarRegistroDoDia(pessoa.id, {
      data: diaUtc(1),
      valores: { sono: 420 },
    });
    expect(await meta(id)).toMatchObject({
      current_value: 7,
      status: 'in_progress',
      auto_sample_days: 1,
    });
    await gravarRegistroDoDia(pessoa.id, {
      data: diaUtc(0),
      valores: { sono: 540 },
    });
    // Média de 7 h e 9 h = 8 h: alvo atingido.
    expect(await meta(id)).toMatchObject({
      current_value: 8,
      status: 'completed',
      auto_sample_days: 2,
    });

    const repetida = await chamar(metas.POST, {
      method: 'POST',
      body: { metrica: 'sono', alvo: 8 },
      usuario: pessoa,
    });
    expect(repetida.status).toBe(409);
  });

  it('valida alvo, prazo e campos; peso exige registro e define a direção', async () => {
    const pessoa = await criarUsuario('patient', 'MetaPeso');
    const criar = (body: unknown) =>
      chamar(metas.POST, { method: 'POST', body, usuario: pessoa });

    expect((await criar({ metrica: 'passos', alvo: 10 })).status).toBe(400);
    expect((await criar({ metrica: 'inexistente', alvo: 10 })).status).toBe(
      400
    );
    expect(
      (await criar({ metrica: 'agua', alvo: 2, prazo: '2000-01-01' })).status
    ).toBe(400);
    expect(
      (await criar({ metrica: 'agua', alvo: 2, metric_key: 'x' })).status
    ).toBe(400);
    expect((await criar({ metrica: 'peso', alvo: 75 })).status).toBe(422);

    await gravarRegistroDoDia(pessoa.id, {
      data: diaUtc(0),
      valores: { peso: 80 },
    });
    const peso = await criar({ metrica: 'peso', alvo: 75 });
    expect(peso.status).toBe(201);
    const id = (peso.json as { meta: { id: string } }).meta.id;
    expect(await meta(id)).toMatchObject({
      title: 'Peso: até 75 kg',
      metric_direction: 'down',
      current_value: 80,
      status: 'in_progress',
    });

    expect(
      (await chamar(metas.POST, { method: 'POST', body: {}, usuario: null }))
        .status
    ).toBe(401);
  });

  it('a API genérica não cria nem altera metas automáticas', async () => {
    const pessoa = await criarUsuario('patient', 'MetaGenerica');
    const resposta = await chamar(dados.POST, {
      method: 'POST',
      params: { table: 'goals' },
      body: {
        values: { title: 'Forjada', target_value: 1, metric_key: 'passos' },
      },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(403);
  });
});

describe('prazos e sequências (POST /api/metas/sincronizar)', () => {
  it('meta manual com prazo vencido fica em atraso', async () => {
    const pessoa = await criarUsuario('patient', 'Prazo');
    const id = randomUUID();
    await executeStatement(
      `INSERT INTO goals (id, user_id, title, target_value, current_value, deadline, status)
       VALUES (?, ?, 'Ler 10 livros', 10, 2, ?, 'in_progress')`,
      [id, pessoa.id, diaUtc(1)]
    );
    const resposta = await chamar(sincronizar.POST, {
      method: 'POST',
      usuario: pessoa,
    });
    expect(resposta.status).toBe(200);
    expect(resposta.json).toMatchObject({ hoje: diaUtc(0), metasAlteradas: 1 });
    expect((await meta(id)).status).toBe('missed');

    // Prazo estendido: volta ao andamento.
    await executeStatement('UPDATE goals SET deadline = ? WHERE id = ?', [
      diaUtc(-30),
      id,
    ]);
    await chamar(sincronizar.POST, { method: 'POST', usuario: pessoa });
    expect((await meta(id)).status).toBe('in_progress');
  });

  it('sequências nascem do registro do dia e o navegador não as grava', async () => {
    const pessoa = await criarUsuario('patient', 'Sequencia');
    for (const diasAtras of [2, 1, 0]) {
      await gravarRegistroDoDia(pessoa.id, {
        data: diaUtc(diasAtras),
        valores: { sono: 450, passos: 8000, humor: 4 },
      });
    }
    // Um dia antigo, separado por uma lacuna, não entra na sequência atual.
    await gravarRegistroDoDia(pessoa.id, {
      data: diaUtc(5),
      valores: { meditacao: 10 },
    });

    const resposta = await chamar(sincronizar.POST, {
      method: 'POST',
      usuario: pessoa,
    });
    const corpo = resposta.json as {
      sequencias: Array<{ tipo: string; atual: number; maisLonga: number }>;
      aderencia: { score: number };
    };
    const porTipo = Object.fromEntries(
      corpo.sequencias.map((s) => [s.tipo, s])
    );
    expect(porTipo.daily_metrics).toMatchObject({ atual: 3, maisLonga: 3 });
    expect(porTipo.sleep_hygiene).toMatchObject({ atual: 3 });
    expect(porTipo.movement).toMatchObject({ atual: 3 });
    // Meditação só há 5 dias: sequência atual 0, mais longa 1.
    expect(porTipo.meditation).toMatchObject({ atual: 0, maisLonga: 1 });
    expect(porTipo.hydration).toBeUndefined();
    // (3×2 + 3×1,5 + 3×1) / (7×30) = 6,4%.
    expect(corpo.aderencia.score).toBe(6);

    const lidas = await chamar(streaks.GET, { usuario: pessoa });
    expect((lidas.json as { streaks: unknown[] }).streaks).toHaveLength(4);

    const forjada = await chamar(dados.POST, {
      method: 'POST',
      params: { table: 'user_streaks' },
      body: {
        values: {
          streak_type: 'meditation',
          current_streak: 999,
          longest_streak: 999,
          last_activity_date: diaUtc(0),
        },
      },
      usuario: pessoa,
    });
    expect(forjada.status).toBe(403);
  });
});
