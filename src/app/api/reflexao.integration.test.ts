import { describe, expect, it } from 'vitest';

import { dataLocal } from '@/lib/astrology/tempo';
import { buscarCidades } from '@/lib/geo/cidades';
import { queryRows } from '@/lib/mysql/pool';
import type { EstadoDaReflexao } from '@/lib/reflexao/esquema';

import { contar, criarUsuario } from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';

import * as localizacao from './perfil/localizacao/route';
import * as reflexao from './reflexao/route';

function diaAnterior(data: string, dias = 1) {
  const instante = new Date(`${data}T12:00:00Z`);
  instante.setUTCDate(instante.getUTCDate() - dias);
  return instante.toISOString().slice(0, 10);
}

describe('reflexão da noite (/api/reflexao)', () => {
  it('exige sessão em todas as operações', async () => {
    for (const [handler, method] of [
      [reflexao.GET, 'GET'],
      [reflexao.PUT, 'PUT'],
      [reflexao.DELETE, 'DELETE'],
    ] as const) {
      const resposta = await chamar(handler, {
        method,
        body:
          method === 'PUT'
            ? { emocional: 3, corpo: 3, espiritual: 3 }
            : undefined,
        usuario: null,
      });
      expect(resposta.status).toBe(401);
    }
  });

  it('cria, lê, substitui e apaga a reflexão de hoje (CRUD completo)', async () => {
    const pessoa = await criarUsuario('patient', 'Reflete');
    // Sem cidade, o "hoje" da pessoa é o dia UTC (mesma regra do coach).
    const hoje = dataLocal(new Date(), 'UTC');

    const vazia = await chamar(reflexao.GET, { usuario: pessoa });
    expect(vazia.status).toBe(200);
    expect(vazia.headers.get('cache-control')).toBe('private, no-store');
    expect(vazia.json).toEqual({
      data: hoje,
      datasPermitidas: [hoje, diaAnterior(hoje)],
      reflexao: null,
    });

    const criada = await chamar(reflexao.PUT, {
      method: 'PUT',
      body: {
        emocional: 4,
        corpo: 3,
        espiritual: 5,
        // Espaços nas pontas e caracteres de controle são removidos.
        frase: '  Dia de encontros\u0007 bons.  ',
      },
      usuario: pessoa,
    });
    expect(criada.status).toBe(200);
    const estado = criada.json as EstadoDaReflexao;
    expect(estado.reflexao).toMatchObject({
      data: hoje,
      emocional: 4,
      corpo: 3,
      espiritual: 5,
      frase: 'Dia de encontros bons.',
    });
    expect(Number.isNaN(Date.parse(estado.reflexao!.atualizadaEm))).toBe(false);

    const [linha] = await queryRows<{
      reflection_date: string;
      emotional_score: number;
      note: string;
    }>(
      'SELECT reflection_date, emotional_score, note FROM daily_reflections WHERE user_id = ?',
      [pessoa.id]
    );
    expect(linha).toEqual({
      reflection_date: hoje,
      emotional_score: 4,
      note: 'Dia de encontros bons.',
    });

    // Gravar de novo na mesma data substitui (sem duplicar) e frase vazia
    // vira "sem frase".
    const substituida = await chamar(reflexao.PUT, {
      method: 'PUT',
      body: { emocional: 2, corpo: 2, espiritual: 3, frase: '   ' },
      usuario: pessoa,
    });
    expect(substituida.status).toBe(200);
    expect((substituida.json as EstadoDaReflexao).reflexao).toMatchObject({
      emocional: 2,
      corpo: 2,
      espiritual: 3,
      frase: null,
    });
    expect(
      await contar(
        'SELECT COUNT(*) AS total FROM daily_reflections WHERE user_id = ?',
        [pessoa.id]
      )
    ).toBe(1);

    const lida = await chamar(reflexao.GET, { usuario: pessoa });
    expect((lida.json as EstadoDaReflexao).reflexao?.emocional).toBe(2);

    const apagada = await chamar(reflexao.DELETE, {
      method: 'DELETE',
      usuario: pessoa,
    });
    expect(apagada.status).toBe(200);
    expect((apagada.json as EstadoDaReflexao).reflexao).toBeNull();
    expect(
      await contar(
        'SELECT COUNT(*) AS total FROM daily_reflections WHERE user_id = ?',
        [pessoa.id]
      )
    ).toBe(0);

    const deNovo = await chamar(reflexao.DELETE, {
      method: 'DELETE',
      usuario: pessoa,
    });
    expect(deNovo.status).toBe(404);
  });

  it('aceita ontem (reflexão após a meia-noite) e recusa datas fora da janela', async () => {
    const pessoa = await criarUsuario('patient', 'Madrugada');
    const hoje = dataLocal(new Date(), 'UTC');
    const ontem = diaAnterior(hoje);

    const deOntem = await chamar(reflexao.PUT, {
      method: 'PUT',
      body: { data: ontem, emocional: 5, corpo: 4, espiritual: 4 },
      usuario: pessoa,
    });
    expect(deOntem.status).toBe(200);
    expect((deOntem.json as EstadoDaReflexao).data).toBe(ontem);

    const leituraDeOntem = await chamar(reflexao.GET, {
      path: `/api/reflexao?data=${ontem}`,
      usuario: pessoa,
    });
    expect((leituraDeOntem.json as EstadoDaReflexao).reflexao?.emocional).toBe(
      5
    );
    // Hoje continua sem reflexão: as datas não se misturam.
    const deHoje = await chamar(reflexao.GET, { usuario: pessoa });
    expect((deHoje.json as EstadoDaReflexao).reflexao).toBeNull();

    for (const data of [diaAnterior(hoje, 2), diaAnterior(hoje, -1)]) {
      const fora = await chamar(reflexao.PUT, {
        method: 'PUT',
        body: { data, emocional: 3, corpo: 3, espiritual: 3 },
        usuario: pessoa,
      });
      expect(fora.status).toBe(400);
      expect(fora.json).toEqual({
        error: 'A reflexão pode ser feita para hoje ou para ontem.',
      });
    }
  });

  it('usa o dia local da cidade da pessoa', async () => {
    const pessoa = await criarUsuario('patient', 'Paulistana');
    const saoPaulo = buscarCidades('sao paulo, sp')[0];
    const resposta = await chamar(localizacao.PATCH, {
      method: 'PATCH',
      body: { tipo: 'moradia', cidadeId: saoPaulo.id },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(200);
    const estado = await chamar(reflexao.GET, { usuario: pessoa });
    expect((estado.json as EstadoDaReflexao).data).toBe(
      dataLocal(new Date(), 'America/Sao_Paulo')
    );
  });

  it('valida notas, frase e campos desconhecidos', async () => {
    const pessoa = await criarUsuario('patient', 'Valida');
    const casos: Array<[unknown, RegExp]> = [
      [
        { emocional: 6, corpo: 3, espiritual: 3 },
        /Emocional: escolha uma nota de 1 a 5/,
      ],
      [
        { emocional: 3, corpo: 0, espiritual: 3 },
        /Corpo: escolha uma nota de 1 a 5/,
      ],
      [
        { emocional: 3, corpo: 3, espiritual: 2.5 },
        /Espiritual: escolha uma nota de 1 a 5/,
      ],
      [{ emocional: 3, corpo: 3 }, /Espiritual/],
      [
        { emocional: 3, corpo: 3, espiritual: 3, frase: 'x'.repeat(281) },
        /até 280 caracteres/,
      ],
      [{ emocional: 3, corpo: 3, espiritual: 3, humor: 5 }, /humor/],
    ];
    for (const [body, mensagem] of casos) {
      const resposta = await chamar(reflexao.PUT, {
        method: 'PUT',
        body,
        usuario: pessoa,
      });
      expect(resposta.status).toBe(400);
      expect(JSON.stringify(resposta.json)).toMatch(mensagem);
    }
    const malformado = await chamar(reflexao.PUT, {
      method: 'PUT',
      rawBody: '{"emocional":',
      headers: { 'content-type': 'application/json' },
      usuario: pessoa,
    });
    expect(malformado.status).toBe(400);
    expect(
      await contar(
        'SELECT COUNT(*) AS total FROM daily_reflections WHERE user_id = ?',
        [pessoa.id]
      )
    ).toBe(0);
  });

  it('cada pessoa vê e apaga só a própria reflexão', async () => {
    const ana = await criarUsuario('patient', 'Ana');
    const bia = await criarUsuario('patient', 'Bia');
    await chamar(reflexao.PUT, {
      method: 'PUT',
      body: { emocional: 5, corpo: 5, espiritual: 5, frase: 'Só minha' },
      usuario: ana,
    });
    const daBia = await chamar(reflexao.GET, { usuario: bia });
    expect((daBia.json as EstadoDaReflexao).reflexao).toBeNull();
    const apagarDaBia = await chamar(reflexao.DELETE, {
      method: 'DELETE',
      usuario: bia,
    });
    expect(apagarDaBia.status).toBe(404);
    const daAna = await chamar(reflexao.GET, { usuario: ana });
    expect((daAna.json as EstadoDaReflexao).reflexao?.frase).toBe('Só minha');
  });
});
