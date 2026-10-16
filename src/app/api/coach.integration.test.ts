import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { dataLocal } from '@/lib/astrology/tempo';
import { executarRotinaDoCoach } from '@/lib/coach/servico';
import type { BriefingDoDia } from '@/lib/coach/tipos';
import { buscarCidades } from '@/lib/geo/cidades';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import { contar, criarUsuario } from '../../../tests/integration/fixtures';
import { chamar } from '../../../tests/integration/http';
import {
  iniciarServidorOpenAiCompativel,
  type ServidorOpenAiCompativel,
} from '../../../tests/support/servidor-openai-compativel';

import * as adminIa from './admin/ia/route';
import * as adminModelos from './admin/ia/modelos/route';
import * as adminTestar from './admin/ia/testar/route';
import * as feedback from './coach/feedback/route';
import * as dados from './data/[table]/route';
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

/** Volta o provedor da plataforma ao padrão (só o motor da Lyra). */
async function voltarAoMotorDaLyra() {
  await executeStatement(
    `UPDATE ai_provider_settings
        SET provider_type = 'lyra_local', preset = 'lyra', base_url = NULL,
            model = NULL, api_key_ciphertext = NULL, api_key_last4 = NULL
      WHERE id = 1`
  );
}

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

describe('provedor de IA da plataforma (rotas administrativas)', () => {
  let servidor: ServidorOpenAiCompativel;
  beforeAll(async () => {
    servidor = await iniciarServidorOpenAiCompativel();
  });
  afterAll(async () => {
    await servidor.fechar();
  });
  afterEach(async () => {
    servidor.falharCom(null);
    await voltarAoMotorDaLyra();
  });

  const ollama = () => ({
    tipo: 'openai_compativel',
    preset: 'ollama',
    baseUrl: servidor.baseUrl,
    modelo: 'qwen2.5:7b-instruct',
    tempoMaximoSegundos: 10,
    temperatura: 0.7,
  });

  it('só administradores leem e alteram; a chave nunca volta e fica cifrada no banco', async () => {
    const admin = await criarUsuario('admin', 'AdminIa');
    const pessoa = await criarUsuario('patient', 'PacienteIa');
    expect((await chamar(adminIa.GET, { usuario: null })).status).toBe(401);
    expect((await chamar(adminIa.GET, { usuario: pessoa })).status).toBe(403);
    expect(
      (
        await chamar(adminIa.PUT, {
          method: 'PUT',
          body: ollama(),
          usuario: pessoa,
        })
      ).status
    ).toBe(403);

    const leitura = await chamar(adminIa.GET, { usuario: admin });
    expect(leitura.status).toBe(200);
    expect(leitura.json).toMatchObject({
      provedor: { tipo: 'lyra_local', temChave: false, local: true },
    });
    const presets = (leitura.json as { presets: Array<{ id: string }> })
      .presets;
    expect(presets.map((p) => p.id)).toEqual(
      expect.arrayContaining(['ollama', 'lm_studio', 'jan', 'llama_cpp'])
    );

    const openai = {
      ...ollama(),
      preset: 'openai',
      baseUrl: servidor.baseUrl,
      modelo: 'gpt-modelo',
    };
    const semChave = await chamar(adminIa.PUT, {
      method: 'PUT',
      body: openai,
      usuario: admin,
    });
    expect(semChave.status).toBe(400);

    const comChave = await chamar(adminIa.PUT, {
      method: 'PUT',
      body: { ...openai, chave: 'sk-teste-segredo-123456' },
      usuario: admin,
    });
    expect(comChave.status).toBe(200);
    expect(comChave.json).toMatchObject({
      provedor: { temChave: true, finalDaChave: '3456', local: true },
    });
    expect(JSON.stringify(comChave.json)).not.toContain('sk-teste-segredo');
    const [linha] = await queryRows<{ api_key_ciphertext: string }>(
      'SELECT api_key_ciphertext FROM ai_provider_settings WHERE id = 1'
    );
    expect(linha.api_key_ciphertext).toMatch(/^v1\./);
    expect(linha.api_key_ciphertext).not.toContain('sk-teste-segredo');

    // Sem o campo "chave", a chave salva continua; com null, é apagada (e
    // a OpenAI exige chave).
    const mantida = await chamar(adminIa.PUT, {
      method: 'PUT',
      body: { ...openai, modelo: 'gpt-outro' },
      usuario: admin,
    });
    expect(mantida.json).toMatchObject({ provedor: { temChave: true } });
    const apagada = await chamar(adminIa.PUT, {
      method: 'PUT',
      body: { ...openai, chave: null },
      usuario: admin,
    });
    expect(apagada.status).toBe(400);

    // A tabela não existe para a API genérica de dados.
    const generica = await chamar(dados.GET, {
      path: '/api/data/ai_provider_settings',
      params: { table: 'ai_provider_settings' },
      usuario: admin,
    });
    expect(generica.status).not.toBe(200);
  });

  it('lista os modelos e testa a conexão do servidor local, com o erro real quando falha', async () => {
    const admin = await criarUsuario('admin', 'AdminModelos');
    const modelos = await chamar(adminModelos.POST, {
      method: 'POST',
      body: ollama(),
      usuario: admin,
    });
    expect(modelos.status).toBe(200);
    expect(modelos.json).toEqual({
      modelos: ['llama3.2:3b', 'qwen2.5:7b-instruct'],
    });

    servidor.responder('Krittika, conexão funcionando.');
    const teste = await chamar(adminTestar.POST, {
      method: 'POST',
      body: ollama(),
      usuario: admin,
    });
    expect(teste.status).toBe(200);
    expect(teste.json).toMatchObject({
      ok: true,
      resposta: 'Krittika, conexão funcionando.',
      milissegundos: expect.any(Number),
    });

    servidor.falharCom(503);
    const falha = await chamar(adminTestar.POST, {
      method: 'POST',
      body: ollama(),
      usuario: admin,
    });
    expect(falha.status).toBe(502);
    expect(falha.json).toMatchObject({ ok: false });
    expect((falha.json as { error: string }).error).toMatch(/HTTP 503/);

    const semModelo = await chamar(adminTestar.POST, {
      method: 'POST',
      body: { ...ollama(), tipo: 'lyra_local', preset: 'lyra' },
      usuario: admin,
    });
    expect(semModelo.status).toBe(400);
  });
});

describe('leitura védica do "Seu dia" pelo modelo configurado', () => {
  let servidor: ServidorOpenAiCompativel;
  beforeAll(async () => {
    servidor = await iniciarServidorOpenAiCompativel();
  });
  afterAll(async () => {
    await servidor.fechar();
    await voltarAoMotorDaLyra();
  });

  // O "modelo" lê os fatos enviados e responde uma leitura válida, em
  // linguagem simples (tarefa 49), para os períodos daquele dia, citando o
  // horário de pausa para começos real.
  function leituraValida(corpo: unknown) {
    const pedido = corpo as { messages: Array<{ content: string }> };
    const texto = pedido.messages[1].content;
    const inicio = texto.indexOf('Fatos do dia:\n') + 'Fatos do dia:\n'.length;
    const fim = texto.indexOf('\n', inicio);
    const fatos = JSON.parse(texto.slice(inicio, fim)) as {
      ceu: { rahuKalam: string; signoDaLua: string };
      periodos: Array<{ chave: string; nome: string }>;
    };
    const pausa = fatos.ceu.rahuKalam.replace('–', ' às ');
    const periodo = (nome: string) => ({
      emocional: `${nome}: emoções sob a Lua em ${fatos.ceu.signoDaLua}, com acolhimento.`,
      fisico: `${nome}: corpo pede movimento consciente e hidratação constante.`,
      espiritual: `${nome}: alguns minutos de silêncio reconectam a intenção.`,
    });
    return JSON.stringify({
      resumoGeral: `Leitura do modelo local: a Lua em ${fatos.ceu.signoDaLua} pede presença, e das ${pausa} vale pausar os começos.`,
      periodos: Object.fromEntries(
        fatos.periodos.map((p) => [p.chave, periodo(p.nome)])
      ),
      pontosPositivos: [
        'Céu que favorece o essencial.',
        'Boa janela pela manhã.',
      ],
      pontosNegativos: [
        `Das ${pausa}, evite começos.`,
        'Evite excessos à noite.',
      ],
      dicas: [
        {
          texto: 'Repita o mantra do dia.',
          porque: 'Ligado ao planeta que rege o dia da semana.',
        },
        {
          texto: 'Estudo inspirador.',
          porque: 'Júpiter apoia o seu crescimento.',
        },
        {
          texto: 'Silêncio ao entardecer.',
          porque: 'O pôr do sol marca a passagem do dia.',
        },
      ],
    });
  }

  it('sem consentimento e só com dados astrológicos; troca de modelo refaz o dia e falha volta ao motor da Lyra', async () => {
    const admin = await criarUsuario('admin', 'AdminLeitura');
    const pessoa = await pessoaComCidade('LeituraIa');
    const configurar = (modelo: string) =>
      chamar(adminIa.PUT, {
        method: 'PUT',
        body: {
          tipo: 'openai_compativel',
          preset: 'ollama',
          baseUrl: servidor.baseUrl,
          modelo,
          tempoMaximoSegundos: 10,
          temperatura: 0.7,
        },
        usuario: admin,
      });
    expect((await configurar('qwen2.5:7b-instruct')).status).toBe(200);
    servidor.responder(leituraValida);

    const antes = servidor.requisicoes.length;
    const primeira = (await chamar(hoje.GET, { usuario: pessoa }))
      .json as Estado;
    expect(primeira.estado).toBe('pronto');
    if (primeira.estado !== 'pronto') return;
    expect(primeira.briefing.origem).toBe('ia');
    expect(primeira.briefing.leitura.autor).toEqual({
      tipo: 'ia',
      provedor: 'Ollama',
      modelo: 'qwen2.5:7b-instruct',
      local: true,
    });
    expect(primeira.briefing.leitura.resumoGeral).toMatch(
      /^Leitura do modelo local/
    );
    expect(primeira.briefing.leitura.periodos).toHaveLength(4);
    const novas = servidor.requisicoes.slice(antes);
    expect(novas).toHaveLength(1);
    const enviado = JSON.stringify(novas[0].corpo);
    for (const proibido of [
      pessoa.email,
      'LeituraIa',
      '1988-03-21',
      '07:15',
      'São Paulo',
      'America/Sao_Paulo',
    ]) {
      expect(enviado).not.toContain(proibido);
    }

    // Reaproveita o dia guardado: nenhuma chamada nova ao modelo.
    const segunda = (await chamar(hoje.GET, { usuario: pessoa }))
      .json as Estado;
    expect(segunda.estado === 'pronto' && segunda.atualizado).toBe(false);
    expect(servidor.requisicoes.length).toBe(antes + 1);

    // Outro modelo refaz o dia; com o servidor falhando, fica a leitura da
    // Lyra, sem erro para a pessoa.
    servidor.falharCom(500);
    expect((await configurar('llama3.2:3b')).status).toBe(200);
    const comFalha = (await chamar(hoje.GET, { usuario: pessoa }))
      .json as Estado;
    servidor.falharCom(null);
    expect(comFalha.estado === 'pronto' && comFalha.atualizado).toBe(true);
    expect(comFalha.estado === 'pronto' && comFalha.briefing.origem).toBe(
      'local'
    );
    expect(
      comFalha.estado === 'pronto' && comFalha.briefing.leitura.autor
    ).toEqual({ tipo: 'lyra' });
  });
});
