import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { dataLocal } from '@/lib/astrology/tempo';
import { buscarCidades } from '@/lib/geo/cidades';
import { diasAntes } from '@/lib/metas/catalogo';
import { executeStatement } from '@/lib/mysql/pool';
import type { SemanaDaPessoa } from '@/lib/semana/servico';

import { criarUsuario } from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';

import * as metas from './metas/route';
import * as localizacao from './perfil/localizacao/route';
import * as semana from './semana/route';

const saoPaulo = buscarCidades('sao paulo, sp')[0];

async function metricas(
  userId: string,
  data: string,
  valores: { prontidao?: number; sono?: number; meditacao?: number }
) {
  await executeStatement(
    `INSERT INTO daily_metrics (id, user_id, date, readiness_score, sleep_duration_minutes, meditation_minutes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      userId,
      data,
      valores.prontidao ?? null,
      valores.sono ?? null,
      valores.meditacao ?? null,
    ]
  );
}

describe('sua semana (GET /api/semana)', () => {
  it('exige sessão', async () => {
    expect((await chamar(semana.GET, { usuario: null })).status).toBe(401);
  });

  it('sem registros: 7 dias vazios, sem números nem percepções inventados', async () => {
    const pessoa = await criarUsuario('patient', 'Vazia');
    const resposta = await chamar(semana.GET, { usuario: pessoa });
    expect(resposta.status).toBe(200);
    const corpo = resposta.json as SemanaDaPessoa;
    const hoje = dataLocal(new Date(), 'UTC');
    expect(corpo.fim).toBe(hoje);
    expect(corpo.inicio).toBe(diasAntes(hoje, 6));
    expect(corpo.dias).toHaveLength(7);
    expect(corpo.lugar).toBeNull();
    expect(corpo.temMapa).toBe(false);
    expect(corpo.dias.every((d) => d.tara === null)).toBe(true);
    expect(corpo.resumo).toMatchObject({
      diasComRegistro: 0,
      prontidaoMedia: null,
      sonoMedioMinutos: null,
      respiracaoMinutos: 0,
    });
    expect(corpo.percepcoes).toEqual([]);
  });

  it('junta métricas, reflexões, respiração, metas e o Tara de cada dia', async () => {
    const pessoa = await criarUsuario('patient', 'Semana');
    await executeStatement(
      `UPDATE profiles SET birth_date = '1988-03-21', birth_time = '07:15:00' WHERE id = ?`,
      [pessoa.id]
    );
    for (const tipo of ['nascimento', 'moradia']) {
      const r = await chamar(localizacao.PATCH, {
        method: 'PATCH',
        body: { tipo, cidadeId: saoPaulo.id },
        usuario: pessoa,
      });
      expect(r.status).toBe(200);
    }
    const meta = await chamar(metas.POST, {
      method: 'POST',
      body: { metrica: 'sono', alvo: 7 },
      usuario: pessoa,
    });
    expect(meta.status).toBe(201);

    const hoje = dataLocal(new Date(), 'America/Sao_Paulo');
    await metricas(pessoa.id, diasAntes(hoje, 1), { prontidao: 80, sono: 480 });
    await metricas(pessoa.id, diasAntes(hoje, 2), { prontidao: 78, sono: 450 });
    await metricas(pessoa.id, diasAntes(hoje, 3), { prontidao: 60, sono: 360 });
    await metricas(pessoa.id, diasAntes(hoje, 4), { prontidao: 62, sono: 330 });
    // Semana anterior, para a variação.
    await metricas(pessoa.id, diasAntes(hoje, 8), { prontidao: 60, sono: 400 });
    await metricas(pessoa.id, diasAntes(hoje, 9), { prontidao: 64, sono: 400 });
    // Fora da janela de 14 dias: não entra em nada.
    await metricas(pessoa.id, diasAntes(hoje, 20), { prontidao: 10 });
    await executeStatement(
      `INSERT INTO daily_reflections (id, user_id, reflection_date, emotional_score, body_score, spiritual_score, note)
       VALUES (?, ?, ?, 4, 3, 5, 'Boa semana')`,
      [randomUUID(), pessoa.id, diasAntes(hoje, 1)]
    );
    await executeStatement(
      `INSERT INTO breathing_sessions (id, user_id, session_date, technique, cycles, duration_seconds, minutes_logged)
       VALUES (?, ?, ?, 'quadrada', 19, 304, 5), (?, ?, ?, '4-7-8', 4, 76, 1)`,
      [
        randomUUID(),
        pessoa.id,
        diasAntes(hoje, 1),
        randomUUID(),
        pessoa.id,
        diasAntes(hoje, 1),
      ]
    );

    const resposta = await chamar(semana.GET, { usuario: pessoa });
    expect(resposta.status).toBe(200);
    const corpo = resposta.json as SemanaDaPessoa;
    expect(corpo.lugar).toContain('São Paulo');
    expect(corpo.temMapa).toBe(true);
    expect(corpo.dias.map((d) => d.data)).toEqual(
      Array.from({ length: 7 }, (_, i) => diasAntes(hoje, 6 - i))
    );
    expect(corpo.dias.every((d) => d.tara !== null)).toBe(true);
    expect(
      corpo.dias.map((d) => d.diaDaSemana).every((d) => /^[a-zá]{3}$/.test(d))
    ).toBe(true);

    const ontem = corpo.dias[5];
    expect(ontem).toMatchObject({
      prontidao: 80,
      sonoMinutos: 480,
      respiracaoMinutos: 6,
      reflexao: { emocional: 4, corpo: 3, espiritual: 5, frase: 'Boa semana' },
    });
    expect(corpo.resumo).toMatchObject({
      diasComRegistro: 4,
      prontidaoMedia: 70,
      // (80+78+60+62)/4 = 70 contra (60+64)/2 = 62.
      prontidaoVariacao: 8,
      sonoMedioMinutos: 405,
      sonoVariacaoMinutos: 5,
      respiracaoMinutos: 6,
      reflexoes: 1,
    });
    expect(corpo.metas).toEqual([
      { titulo: 'Sono por noite: 7 h', diasCumpridos: 2, diasComRegistro: 4 },
    ]);
    // 2 noites com 7 h+ (prontidão 79) contra 2 mais curtas (61).
    expect(corpo.percepcoes.map((p) => p.texto)).toContain(
      'Depois de noites com 7 h ou mais de sono, a sua prontidão média foi 79; depois de noites mais curtas, 61.'
    );
  });

  it('cada pessoa vê só a própria semana', async () => {
    const ana = await criarUsuario('patient', 'Ana');
    const bia = await criarUsuario('patient', 'Bia');
    await metricas(ana.id, dataLocal(new Date(), 'UTC'), { prontidao: 90 });
    const daBia = (await chamar(semana.GET, { usuario: bia }))
      .json as SemanaDaPessoa;
    expect(daBia.dias.every((d) => d.prontidao === null)).toBe(true);
  });
});
