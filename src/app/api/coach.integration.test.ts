import { afterEach, describe, expect, it, vi } from 'vitest';

import { dataLocal } from '@/lib/astrology/tempo';
import { executarRotinaDoCoach } from '@/lib/coach/servico';
import type { BriefingDoDia } from '@/lib/coach/tipos';
import { buscarCidades } from '@/lib/geo/cidades';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import { contar, criarUsuario } from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';

import * as consentimentos from './account/consents/route';
import * as feedback from './coach/feedback/route';
import * as coachIa from './perfil/coach-ia/route';
import * as hoje from './coach/hoje/route';
import * as rotina from './coach/rotina/route';
import * as registro from './metricas/dia/route';
import * as notificacoes from './notificacoes/route';
import * as localizacao from './perfil/localizacao/route';

const saoPaulo = buscarCidades('sao paulo, sp')[0];
const FUSO = 'America/Sao_Paulo';

type Estado =
  | {
      estado: 'pronto';
      briefing: BriefingDoDia;
      feedback: number | null;
      atualizado: boolean;
    }
  | { estado: 'sem_local'; faltando: string[] };

async function pessoaComCidade(nome: string) {
  const pessoa = await criarUsuario('patient', nome);
  await executeStatement(
    `UPDATE profiles SET birth_date = '1988-03-21', birth_time = '07:15:00' WHERE id = ?`,
    [pessoa.id]
  );
  for (const tipo of ['nascimento', 'moradia']) {
    const resposta = await chamar(localizacao.PATCH, {
      method: 'PATCH',
      body: { tipo, cidadeId: saoPaulo.id },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(200);
  }
  return pessoa;
}

afterEach(() => {
  delete process.env.COACH_ROTINA_SEGREDO;
});

describe('coach diário (GET /api/coach/hoje)', () => {
  it('sem cidade, informa o que falta em vez de inventar o dia', async () => {
    const pessoa = await criarUsuario('patient', 'SemCidade');
    const resposta = await chamar(hoje.GET, { usuario: pessoa });
    expect(resposta.status).toBe(200);
    expect(resposta.json).toEqual({
      estado: 'sem_local',
      faltando: ['data', 'hora', 'local'],
    });
    expect(
      await contar(
        'SELECT COUNT(*) AS total FROM daily_briefings WHERE user_id = ?',
        [pessoa.id]
      )
    ).toBe(0);
  });

  it('gera, guarda, reaproveita e refaz quando o check-in muda', async () => {
    const pessoa = await pessoaComCidade('Coach');
    const data = dataLocal(new Date(), FUSO);

    const primeira = await chamar(hoje.GET, { usuario: pessoa });
    expect(primeira.status).toBe(200);
    expect(primeira.headers.get('cache-control')).toBe('private, no-store');
    const estado = primeira.json as Estado;
    expect(estado.estado).toBe('pronto');
    if (estado.estado !== 'pronto') return;
    expect(estado.atualizado).toBe(true);
    expect(estado.briefing.data).toBe(data);
    expect(estado.briefing.local.fuso).toBe(FUSO);
    expect(estado.briefing.periodos).toHaveLength(4);
    expect(estado.briefing.prontidao.valor).toBeNull();
    expect(estado.briefing.ceu.tara).not.toBeNull();

    const [linha] = await queryRows<{ source: string; briefing_date: string }>(
      'SELECT source, briefing_date FROM daily_briefings WHERE user_id = ?',
      [pessoa.id]
    );
    expect(linha).toEqual({ source: 'local', briefing_date: data });
    expect(
      await contar(
        `SELECT COUNT(*) AS total FROM user_notifications
          WHERE user_id = ? AND dedupe_key = ? AND kind = 'coach_dia'`,
        [pessoa.id, `dia:${data}`]
      )
    ).toBe(1);

    const segunda = (await chamar(hoje.GET, { usuario: pessoa }))
      .json as Estado;
    expect(segunda.estado === 'pronto' && segunda.atualizado).toBe(false);

    const checkin = await chamar(registro.POST, {
      method: 'POST',
      body: {
        data,
        valores: { sono: 450, energia: 4, humor: 4, estresse: 25 },
      },
      usuario: pessoa,
    });
    expect(checkin.status).toBe(200);

    const terceira = (await chamar(hoje.GET, { usuario: pessoa }))
      .json as Estado;
    expect(terceira.estado).toBe('pronto');
    if (terceira.estado !== 'pronto') return;
    expect(terceira.atualizado).toBe(true);
    expect(terceira.briefing.prontidao.valor).not.toBeNull();
    expect(terceira.briefing.prontidao.base).toContain('Sono 7h30');
    // Refazer não duplica o briefing nem a notificação do dia.
    expect(
      await contar(
        'SELECT COUNT(*) AS total FROM daily_briefings WHERE user_id = ?',
        [pessoa.id]
      )
    ).toBe(1);
    expect(
      await contar(
        `SELECT COUNT(*) AS total FROM user_notifications
          WHERE user_id = ? AND kind = 'coach_dia'`,
        [pessoa.id]
      )
    ).toBe(1);
  });

  it('exige sessão e respeita o plano', async () => {
    expect((await chamar(hoje.GET, { usuario: null })).status).toBe(401);

    const pessoa = await pessoaComCidade('Plano');
    await executeStatement(
      `UPDATE plan_entitlements e
         JOIN subscription_plans p ON p.id = e.plan_id
         JOIN plan_features f ON f.id = e.feature_id
          SET e.enabled = FALSE
        WHERE p.plan_key = 'free' AND f.feature_key = 'ai_tips_feed'`
    );
    try {
      expect((await chamar(hoje.GET, { usuario: pessoa })).status).toBe(403);
    } finally {
      await executeStatement(
        `UPDATE plan_entitlements e
           JOIN subscription_plans p ON p.id = e.plan_id
           JOIN plan_features f ON f.id = e.feature_id
            SET e.enabled = TRUE
          WHERE p.plan_key = 'free' AND f.feature_key = 'ai_tips_feed'`
      );
    }
  });
});

describe('avaliação do briefing (POST /api/coach/feedback)', () => {
  it('grava a resposta só para um briefing existente da própria pessoa', async () => {
    const pessoa = await pessoaComCidade('Avalia');
    const data = dataLocal(new Date(), FUSO);
    const semBriefing = await chamar(feedback.POST, {
      method: 'POST',
      body: { data, util: true },
      usuario: pessoa,
    });
    expect(semBriefing.status).toBe(404);

    await chamar(hoje.GET, { usuario: pessoa });
    const resposta = await chamar(feedback.POST, {
      method: 'POST',
      body: { data, util: false },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(200);
    const [linha] = await queryRows<{ feedback: number }>(
      'SELECT feedback FROM daily_briefings WHERE user_id = ?',
      [pessoa.id]
    );
    expect(linha.feedback).toBe(-1);
    const estado = (await chamar(hoje.GET, { usuario: pessoa })).json as Estado;
    expect(estado.estado === 'pronto' && estado.feedback).toBe(-1);

    const invalida = await chamar(feedback.POST, {
      method: 'POST',
      body: { data: '2020-01-01', util: true },
      usuario: pessoa,
    });
    expect(invalida.status).toBe(400);
  });
});

describe('notificações (GET e PATCH /api/notificacoes)', () => {
  it('lista e marca como lidas só as notificações da própria pessoa', async () => {
    const pessoa = await pessoaComCidade('Sino');
    const outra = await pessoaComCidade('Outra');
    await chamar(hoje.GET, { usuario: pessoa });
    await chamar(hoje.GET, { usuario: outra });

    const lista = await chamar(notificacoes.GET, { usuario: pessoa });
    expect(lista.status).toBe(200);
    const corpo = lista.json as {
      notificacoes: Array<{
        id: string;
        tipo: string;
        titulo: string;
        link: string;
        lida: boolean;
        criadaEm: string;
      }>;
      naoLidas: number;
    };
    const doDia = corpo.notificacoes.find((n) => n.tipo === 'coach_dia');
    expect(doDia).toMatchObject({
      titulo: 'Seu dia está pronto',
      link: '/dia',
      lida: false,
    });
    expect(Number.isNaN(Date.parse(doDia?.criadaEm ?? ''))).toBe(false);
    expect(corpo.naoLidas).toBe(corpo.notificacoes.length);

    // Ids de outra pessoa não são marcados (sem IDOR).
    const daOutra = (
      (await chamar(notificacoes.GET, { usuario: outra })).json as typeof corpo
    ).notificacoes[0];
    const indevida = await chamar(notificacoes.PATCH, {
      method: 'PATCH',
      body: { ids: [daOutra.id] },
      usuario: pessoa,
    });
    expect(indevida.json).toEqual({ marcadas: 0 });

    const uma = await chamar(notificacoes.PATCH, {
      method: 'PATCH',
      body: { ids: [doDia?.id] },
      usuario: pessoa,
    });
    expect(uma.json).toEqual({ marcadas: 1 });
    await chamar(notificacoes.PATCH, {
      method: 'PATCH',
      body: { todas: true },
      usuario: pessoa,
    });
    const depois = (await chamar(notificacoes.GET, { usuario: pessoa }))
      .json as typeof corpo;
    expect(depois.naoLidas).toBe(0);
    expect(
      (
        (await chamar(notificacoes.GET, { usuario: outra }))
          .json as typeof corpo
      ).naoLidas
    ).toBeGreaterThan(0);

    expect(
      (
        await chamar(notificacoes.PATCH, {
          method: 'PATCH',
          body: { ids: ['nao-e-uuid'] },
          usuario: pessoa,
        })
      ).status
    ).toBe(400);
    expect((await chamar(notificacoes.GET, { usuario: null })).status).toBe(
      401
    );
  });
});

describe('rotina diária do coach', () => {
  it('prepara o dia de quem ainda não tem, depois das 3 h locais', async () => {
    const pessoa = await pessoaComCidade('Rotina');
    const madrugada = new Date('2026-10-14T05:30:00Z'); // 02:30 em São Paulo
    await executarRotinaDoCoach(madrugada);
    expect(
      await contar(
        'SELECT COUNT(*) AS total FROM daily_briefings WHERE user_id = ?',
        [pessoa.id]
      )
    ).toBe(0);

    const manha = new Date('2026-10-14T10:00:00Z'); // 07:00 em São Paulo
    const resultado = await executarRotinaDoCoach(manha);
    expect(resultado.falhas).toBe(0);
    expect(resultado.gerados).toBeGreaterThanOrEqual(1);
    const [linha] = await queryRows<{ briefing_date: string }>(
      'SELECT briefing_date FROM daily_briefings WHERE user_id = ?',
      [pessoa.id]
    );
    expect(linha.briefing_date).toBe('2026-10-14');

    // Segunda passada no mesmo dia não refaz nada para quem já tem.
    const repetida = await executarRotinaDoCoach(manha);
    expect(repetida.gerados).toBe(0);
  });

  it('a rota externa exige o segredo configurado', async () => {
    const semSegredo = await chamar(rotina.POST, { method: 'POST' });
    expect(semSegredo.status).toBe(404);

    process.env.COACH_ROTINA_SEGREDO =
      'segredo-de-teste-com-mais-de-32-caracteres';
    const errado = await chamar(rotina.POST, {
      method: 'POST',
      headers: {
        authorization: 'Bearer segredo-errado-com-mais-de-32-caracteres!',
      },
    });
    expect(errado.status).toBe(401);

    const certo = await chamar(rotina.POST, {
      method: 'POST',
      headers: {
        authorization: 'Bearer segredo-de-teste-com-mais-de-32-caracteres',
      },
    });
    expect(certo.status).toBe(200);
    expect(certo.json).toMatchObject({
      falhas: 0,
      notificacoesApagadas: expect.any(Number),
    });
  });
});

describe('texto do coach pelo Gemini (consentimento revogável)', () => {
  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    vi.unstubAllGlobals();
  });

  it('sem chave no servidor não ativa; com chave registra o aceite e usa o Gemini', async () => {
    const pessoa = await pessoaComCidade('CoachIa');
    const ler = async () =>
      (await chamar(coachIa.GET, { usuario: pessoa })).json as {
        ativo: boolean;
        disponivel: boolean;
      };
    const ativar = (ativo: boolean) =>
      chamar(coachIa.PATCH, {
        method: 'PATCH',
        body: { ativo },
        usuario: pessoa,
      });

    expect(await ler()).toMatchObject({ ativo: false, disponivel: false });
    expect((await ativar(true)).status).toBe(503);

    process.env.GEMINI_API_KEY = 'chave-de-teste';
    expect((await ativar(true)).status).toBe(200);
    expect(await ler()).toMatchObject({ ativo: true, disponivel: true });
    expect(
      await contar(
        `SELECT COUNT(*) AS total FROM consent_records
          WHERE user_id = ? AND consent_type = 'coach_external_ai'`,
        [pessoa.id]
      )
    ).toBe(1);

    // O "Gemini" deste teste devolve um texto válido sem horários novos.
    const chamadas: string[] = [];
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      chamadas.push(String(init?.body ?? ''));
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      manchete: 'Seu dia, com calma e no tempo certo',
                      resumo:
                        'Hoje vale escolher bem os horários e cuidar do corpo, com pausas ao longo do dia e uma noite tranquila.',
                      sugestoes: {},
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200 }
      );
    });
    const comIa = (await chamar(hoje.GET, { usuario: pessoa })).json as Estado;
    expect(comIa.estado === 'pronto' && comIa.briefing.origem).toBe('gemini');
    expect(comIa.estado === 'pronto' && comIa.briefing.manchete).toBe(
      'Seu dia, com calma e no tempo certo'
    );
    // O pedido não leva nome, e-mail nem cidade.
    expect(chamadas).toHaveLength(1);
    expect(chamadas[0]).not.toContain('CoachIa');
    expect(chamadas[0]).not.toContain(pessoa.email);
    expect(chamadas[0]).not.toContain('São Paulo');

    // Revogar vale na hora: o dia é refeito só com o motor local.
    expect((await ativar(false)).status).toBe(200);
    const semIa = (await chamar(hoje.GET, { usuario: pessoa })).json as Estado;
    expect(semIa.estado === 'pronto' && semIa.briefing.origem).toBe('local');
    expect(chamadas).toHaveLength(1);
  });

  it('a rota genérica de consentimentos não aceita o da IA externa', async () => {
    const pessoa = await criarUsuario('patient', 'ConsentimentoIa');
    const resposta = await chamar(consentimentos.POST, {
      method: 'POST',
      body: { types: ['coach_external_ai'] },
      usuario: pessoa,
    });
    expect(resposta.status).toBe(400);
  });
});
