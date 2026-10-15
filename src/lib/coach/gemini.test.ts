import { afterEach, describe, expect, it } from 'vitest';

import { COLUNAS_DO_COACH, type MetricasDoCoach } from './contexto';
import { gerarBriefingLocal } from './gerador-local';
import {
  dadosMinimizados,
  horariosConferem,
  refinarComGemini,
  type RespostaDoGemini,
} from './gemini';

const SP = {
  rotulo: 'São Paulo, São Paulo, Brasil',
  latitude: -23.5475,
  longitude: -46.63611,
  fuso: 'America/Sao_Paulo',
};

function metricas(): MetricasDoCoach {
  const linha = { date: '2026-10-14', menstrual_flow: null } as MetricasDoCoach;
  for (const coluna of COLUNAS_DO_COACH) linha[coluna] = null;
  linha.sleep_duration_minutes = 450;
  linha.energy_level = 4;
  return linha;
}

const briefing = gerarBriefingLocal({
  contexto: {
    userId: 'teste',
    data: '2026-10-14',
    perfil: {
      nascimento: { data: '1990-05-15', hora: '08:30', local: SP },
      moradia: SP,
      localDoDia: SP,
      faltando: [],
    },
    pessoa: {
      nome: 'Ana',
      objetivos: [],
      ciclo: {
        lastMenstrualPeriod: '2026-10-10',
        cycleLength: 28,
        periodLength: 5,
        lifeStage: 'ciclo_regular',
      },
    },
    hoje: metricas(),
    historico: [],
  },
  agora: new Date('2026-10-14T09:00:00Z'),
});

const manha = briefing.periodos.find((p) => p.chave === 'manha');
const horarioDaManha = manha?.horario.slice(0, 5) ?? '00:00';

function respostaValida(): RespostaDoGemini {
  return {
    manchete: 'Um dia para escolher bem os seus horários',
    resumo: `Comece cedo: a partir das ${horarioDaManha} a manhã favorece o que pede foco. Guarde energia para a tarde e desacelere à noite.`,
    sugestoes: {
      manha: `Aproveite a manhã a partir das ${horarioDaManha} para o que pede foco.`,
    },
  };
}

function fetchFalso(status: number, corpo: unknown) {
  const chamadas: Array<{ url: string; init: RequestInit | undefined }> = [];
  const fn = (async (url: string | URL | Request, init?: RequestInit) => {
    chamadas.push({ url: String(url), init });
    return new Response(JSON.stringify(corpo), { status });
  }) as typeof fetch;
  return { fn, chamadas };
}

function corpoDoGemini(texto: string) {
  return { candidates: [{ content: { parts: [{ text: texto }] } }] };
}

afterEach(() => {
  delete process.env.GEMINI_API_KEY;
});

describe('texto do coach pelo Gemini', () => {
  it('envia só o texto do dia: sem nome, cidade, métricas nem ciclo', () => {
    const dados = JSON.stringify(dadosMinimizados(briefing));
    expect(dados).not.toContain('Ana');
    expect(dados).not.toContain('São Paulo');
    expect(dados).not.toContain('Sono 7h30');
    expect(dados).not.toContain('menstrual');
    expect(dados).not.toContain('America/Sao_Paulo');
    expect(dados).toContain(briefing.manchete);
  });

  it('sem chave no servidor não chama ninguém', async () => {
    const falso = fetchFalso(200, {});
    expect(await refinarComGemini(briefing, { fetch: falso.fn })).toBeNull();
    expect(falso.chamadas).toHaveLength(0);
  });

  it('aplica o texto válido e mantém horários e regras', async () => {
    process.env.GEMINI_API_KEY = 'chave-de-teste';
    const falso = fetchFalso(
      200,
      corpoDoGemini(JSON.stringify(respostaValida()))
    );
    const refinado = await refinarComGemini(briefing, { fetch: falso.fn });
    expect(refinado?.origem).toBe('gemini');
    expect(refinado?.manchete).toBe(respostaValida().manchete);
    expect(refinado?.periodos.find((p) => p.chave === 'manha')?.sugestao).toBe(
      respostaValida().sugestoes.manha
    );
    // Períodos sem texto novo ficam com o do motor local.
    expect(refinado?.periodos.find((p) => p.chave === 'noite')?.sugestao).toBe(
      briefing.periodos.find((p) => p.chave === 'noite')?.sugestao
    );
    expect(refinado?.periodos.map((p) => p.horario)).toEqual(
      briefing.periodos.map((p) => p.horario)
    );
    expect(refinado?.cuidados).toEqual(briefing.cuidados);
    // Chave no cabeçalho, nunca na URL.
    expect(falso.chamadas[0].url).not.toContain('chave-de-teste');
    expect(
      (falso.chamadas[0].init?.headers as Record<string, string>)[
        'x-goog-api-key'
      ]
    ).toBe('chave-de-teste');
  });

  it('recusa horário inventado, formato errado e falha HTTP', async () => {
    process.env.GEMINI_API_KEY = 'chave-de-teste';
    const inventado = {
      ...respostaValida(),
      resumo: 'Treine às 03:17, o melhor horário do dia para você hoje.',
    };
    expect(horariosConferem(dadosMinimizados(briefing), inventado)).toBe(false);
    for (const falso of [
      fetchFalso(200, corpoDoGemini(JSON.stringify(inventado))),
      fetchFalso(200, corpoDoGemini('{"manchete": "curta"}')),
      fetchFalso(200, corpoDoGemini('isto não é JSON')),
      fetchFalso(500, { error: 'falha' }),
    ]) {
      expect(await refinarComGemini(briefing, { fetch: falso.fn })).toBeNull();
    }
  });
});
