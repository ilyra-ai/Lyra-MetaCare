import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { horasDoDia } from '@/lib/astrology/horas';
import { calcularPanchang } from '@/lib/astrology/panchang';
import type { PerfilAstrologico } from '@/lib/astrology/perfil-astrologico';

import {
  iniciarServidorOpenAiCompativel,
  type ServidorOpenAiCompativel,
} from '../../../tests/support/servidor-openai-compativel';
import type { ContextoDoCoach } from './contexto';
import { gerarDiaLocal } from './gerador-local';
import { escreverLeituraComIa, type LeituraDaIa } from './leitura-ia';
import type { EntradaDaLeitura } from './leitura-vedica';

const SAO_PAULO = {
  rotulo: 'São Paulo, São Paulo, Brasil',
  latitude: -23.5475,
  longitude: -46.63611,
  fuso: 'America/Sao_Paulo',
};

function contexto(
  data: string,
  nascimento: Partial<PerfilAstrologico['nascimento']> = {}
): ContextoDoCoach {
  return {
    userId: 'teste',
    data,
    perfil: {
      nascimento: {
        data: '1990-05-15',
        hora: '08:30',
        local: SAO_PAULO,
        ...nascimento,
      },
      moradia: SAO_PAULO,
      localDoDia: SAO_PAULO,
      faltando: [],
    },
    pessoa: { nome: 'Ana', objetivos: ['sleep_better'], ciclo: null },
    hoje: null,
    historico: [],
  };
}

function dia(
  data: string,
  nascimento?: Partial<PerfilAstrologico['nascimento']>
) {
  return gerarDiaLocal({
    contexto: contexto(data, nascimento),
    agora: new Date(`${data}T09:00:00Z`),
  });
}

describe('horas planetárias', () => {
  it('começam pelo regente do dia e seguem a ordem caldeia por 24 horas', () => {
    // 2026-10-18 é domingo: a 1ª hora é do Sol, a 2ª de Vênus, a 3ª de
    // Mercúrio, a 4ª da Lua e a 25ª (1ª de segunda-feira) seria da Lua.
    const panchang = calcularPanchang({ data: '2026-10-18', ...SAO_PAULO });
    const horas = horasDoDia(panchang);
    expect(horas).toHaveLength(24);
    expect(horas.slice(0, 4).map((h) => h.graha)).toEqual([
      'sol',
      'venus',
      'mercurio',
      'lua',
    ]);
    expect(horas[0].inicio).toEqual(panchang.nascerDoSol);
    expect(horas[11].fim.getTime()).toBeCloseTo(
      panchang.porDoSol.getTime(),
      -1
    );
    expect(horas[23].fim.getTime()).toBeCloseTo(
      panchang.proximoNascerDoSol.getTime(),
      -1
    );
    // A 24ª hora é a de Mercúrio; na ordem caldeia, a seguinte é a da Lua,
    // que abre a segunda-feira (continuidade entre os dias).
    expect(horas[23].graha).toBe('mercurio');
    const segunda = calcularPanchang({ data: '2026-10-19', ...SAO_PAULO });
    expect(horasDoDia(segunda)[0].graha).toBe('lua');
  });
});

describe('leitura védica do dia (motor da Lyra)', () => {
  it('traz resumo, os três tópicos de cada período, pontos e dicas com fundamento', () => {
    const { briefing } = dia('2026-10-14');
    const leitura = briefing.leitura;
    expect(briefing.versao).toBe(3);
    expect(leitura.autor).toEqual({ tipo: 'lyra' });
    expect(leitura.resumoGeral.length).toBeGreaterThan(80);
    expect(leitura.periodos.map((p) => p.chave)).toEqual([
      'madrugada',
      'manha',
      'tarde',
      'noite',
    ]);
    for (const periodo of leitura.periodos) {
      expect(periodo.emocional.length).toBeGreaterThan(30);
      expect(periodo.fisico.length).toBeGreaterThan(30);
      expect(periodo.espiritual.length).toBeGreaterThan(30);
    }
    expect(leitura.pontosPositivos.length).toBeGreaterThanOrEqual(2);
    expect(leitura.pontosNegativos.length).toBeGreaterThanOrEqual(2);
    expect(leitura.dicas.length).toBeGreaterThanOrEqual(3);
    for (const dica of leitura.dicas)
      expect(dica.porque.length).toBeGreaterThan(10);
    // A fase da vida (dasha natal) aparece no resumo, em linguagem simples.
    expect(leitura.resumoGeral).toMatch(/Nesta fase da sua vida/);
    expect(leitura.resumoGeral).not.toMatch(/Mahadasha|Antardasha/);
  });

  it('cada dia é diferente: resumo e textos dos períodos mudam de um dia para o outro', () => {
    const dias = ['2026-10-14', '2026-10-15', '2026-10-16'].map(
      (d) => dia(d).briefing.leitura
    );
    const resumos = new Set(dias.map((l) => l.resumoGeral));
    expect(resumos.size).toBe(3);
    for (const chave of ['manha', 'tarde', 'noite'] as const) {
      const textos = new Set(
        dias.map((l) => {
          const p = l.periodos.find((x) => x.chave === chave);
          return `${p?.emocional}|${p?.fisico}|${p?.espiritual}`;
        })
      );
      expect(textos.size).toBe(3);
    }
  });

  it('a entrada do modelo só tem dados astrológicos (sem nome, nascimento, cidade ou métricas)', () => {
    const { entradaDaLeitura } = dia('2026-10-14');
    const texto = JSON.stringify(entradaDaLeitura);
    for (const proibido of [
      'Ana',
      '1990',
      '08:30',
      'São Paulo',
      'sleep_better',
      'teste',
      'America/Sao_Paulo',
    ]) {
      expect(texto).not.toContain(proibido);
    }
    expect(entradaDaLeitura.mapa?.lua.signo).toBeTruthy();
    expect(
      entradaDaLeitura.periodos[1].horasPlanetarias.length
    ).toBeGreaterThan(0);
  });

  it('sem data de nascimento, a leitura usa só o céu do dia', () => {
    const { briefing, entradaDaLeitura } = dia('2026-10-14', {
      data: null,
      hora: null,
      local: null,
    });
    expect(entradaDaLeitura.mapa).toBeNull();
    expect(briefing.leitura.periodos).toHaveLength(4);
    expect(briefing.leitura.pontosPositivos.length).toBeGreaterThanOrEqual(2);
    expect(briefing.leitura.resumoGeral).not.toMatch(/fase da sua vida/);
    expect(briefing.leitura.resumoGeral).toContain(
      'Com a sua data e a cidade de nascimento no perfil'
    );
  });
});

function respostaValida(
  entrada: EntradaDaLeitura,
  resumo: string
): LeituraDaIa {
  const periodo = (nome: string) => ({
    emocional: `No período ${nome}, a Lua em ${entrada.ceu.signoDaLua} pede escuta e gentileza.`,
    fisico: `O corpo agradece movimento consciente e hidratação no período ${nome}.`,
    espiritual: `Recite ${entrada.regenteDoDia.mantra} por alguns minutos no período ${nome}.`,
  });
  return {
    resumoGeral: resumo,
    periodos: Object.fromEntries(
      entrada.periodos.map((p) => [p.chave, periodo(p.nome)])
    ),
    pontosPositivos: [
      'Para você, um dia de prosperidade para avançar.',
      'A combinação do Sol com a Lua sustenta o dia.',
    ],
    pontosNegativos: [
      `Das ${entrada.ceu.rahuKalam.replace('–', ' às ')}, evite começos.`,
      'Evite excessos à noite.',
    ],
    dicas: [
      {
        texto: 'Repita o mantra do dia por alguns minutos.',
        porque: 'Ligado ao planeta que rege o dia da semana.',
      },
      {
        texto: 'Estude algo inspirador.',
        porque: 'Júpiter está numa posição que apoia o seu crescimento.',
      },
      {
        texto: 'Silêncio ao entardecer.',
        porque: 'O pôr do sol marca a passagem do dia.',
      },
    ],
  };
}

describe('leitura védica pelo modelo de IA (servidor compatível com a OpenAI)', () => {
  let servidor: ServidorOpenAiCompativel;
  beforeAll(async () => {
    servidor = await iniciarServidorOpenAiCompativel();
  });
  afterAll(() => servidor.fechar());

  const conexao = () => ({
    tipo: 'openai_compativel' as const,
    baseUrl: servidor.baseUrl,
    modelo: 'qwen2.5:7b-instruct',
    chave: null,
    tempoMaximoSegundos: 10,
    temperatura: 0.7,
  });
  const autor = {
    provedor: 'Ollama',
    modelo: 'qwen2.5:7b-instruct',
    local: true,
  };

  it('aceita a resposta válida, mesmo com raciocínio <think> e cerca ```json', async () => {
    const { briefing, entradaDaLeitura } = dia('2026-10-14');
    const resumo = `Hoje a Lua em ${entradaDaLeitura.ceu.signoDaLua} pede presença e escuta; use ${entradaDaLeitura.melhorJanela?.horario ?? 'a manhã'} para o que mais importa no seu dia.`;
    servidor.responder(
      `<think>vou montar o JSON</think>\n\`\`\`json\n${JSON.stringify(respostaValida(entradaDaLeitura, resumo))}\n\`\`\``
    );
    const resultado = await escreverLeituraComIa({
      conexao: conexao(),
      autor,
      entrada: entradaDaLeitura,
      base: briefing.leitura,
      ontem: null,
    });
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.leitura.resumoGeral).toBe(resumo);
    expect(resultado.leitura.autor).toEqual({ tipo: 'ia', ...autor });
    expect(resultado.leitura.periodos).toHaveLength(4);

    // O pedido foi para a rota de chat, com o modelo escolhido e só os fatos
    // astrológicos (nada do perfil).
    const pedido = servidor.requisicoes.at(-1);
    expect(pedido?.caminho).toBe('/v1/chat/completions');
    const corpo = pedido?.corpo as {
      model: string;
      messages: Array<{ role: string; content: string }>;
    };
    expect(corpo.model).toBe('qwen2.5:7b-instruct');
    expect(corpo.messages[1].content).toContain(entradaDaLeitura.ceu.nakshatra);
    expect(corpo.messages[1].content).not.toContain('Ana');
    expect(corpo.messages[1].content).not.toContain('1990-05-15');
    // Tarefa 56: o modelo escreve como a Lyra, sobre a leitura do motor.
    expect(corpo.messages[0].role).toBe('system');
    expect(corpo.messages[0].content).toMatch(/^Você é a Lyra/);
    expect(corpo.messages[1].content).toContain(
      'Leitura do motor da Lyra para hoje'
    );
    expect(corpo.messages[1].content).toContain(
      JSON.stringify(briefing.leitura.resumoGeral)
    );
  });

  it('descarta horário inventado, formato errado, período faltando e resumo igual ao de ontem', async () => {
    const { briefing, entradaDaLeitura } = dia('2026-10-14');
    const chamar = (ontem = null as typeof briefing.leitura | null) =>
      escreverLeituraComIa({
        conexao: conexao(),
        autor,
        entrada: entradaDaLeitura,
        base: briefing.leitura,
        ontem,
      });

    const comHorarioFalso = respostaValida(
      entradaDaLeitura,
      'Um dia para começar às 03:17 em ponto, quando o céu se abre inteiro para você e para os seus planos.'
    );
    servidor.responder(JSON.stringify(comHorarioFalso));
    expect(await chamar()).toEqual({
      ok: false,
      motivo: 'horário que não existe no dia',
    });

    servidor.responder('Desculpe, não consigo responder em JSON.');
    expect((await chamar()).ok).toBe(false);

    const semTarde = respostaValida(
      entradaDaLeitura,
      'Um dia de presença e escuta, com a Lua pedindo calma, respiração e foco no essencial ao longo de hoje.'
    );
    delete semTarde.periodos.tarde;
    servidor.responder(JSON.stringify(semTarde));
    expect(await chamar()).toEqual({
      ok: false,
      motivo: 'faltou o período tarde',
    });

    const repetido = respostaValida(
      entradaDaLeitura,
      briefing.leitura.resumoGeral
    );
    servidor.responder(JSON.stringify(repetido));
    expect(await chamar(briefing.leitura)).toEqual({
      ok: false,
      motivo: 'resumo igual ao de ontem',
    });

    // Resposta real de um modelo de 1,5B: o mesmo texto físico em vários
    // períodos.
    const copiado = respostaValida(
      entradaDaLeitura,
      'Um dia de presença e escuta, com a Lua pedindo calma, respiração e foco no essencial ao longo de hoje.'
    );
    const fisico =
      'O corpo físico é um lugar onde as emoções se acomodam ao longo do dia.';
    for (const p of Object.values(copiado.periodos)) {
      if (p) p.fisico = fisico;
    }
    servidor.responder(JSON.stringify(copiado));
    expect(await chamar()).toEqual({
      ok: false,
      motivo: 'texto repetido entre períodos',
    });

    // Termo técnico (tarefa 49): a leitura é para leigos.
    const tecnica = respostaValida(
      entradaDaLeitura,
      `Um dia Tara Pratyari, com a Lua em ${entradaDaLeitura.ceu.nakshatra}: escolha suas batalhas e poupe energia ao longo de hoje.`
    );
    servidor.responder(JSON.stringify(tecnica));
    expect(await chamar()).toEqual({
      ok: false,
      motivo: 'termo técnico na leitura ("Tara")',
    });
    // Tarefa 56: quem se apresenta como outro assistente não é a Lyra.
    const outraVoz = respostaValida(
      entradaDaLeitura,
      'Eu sou o ChatGPT e preparei a sua leitura: um dia de presença, escuta e foco no essencial ao longo de hoje.'
    );
    servidor.responder(JSON.stringify(outraVoz));
    expect(await chamar()).toEqual({
      ok: false,
      motivo: 'o modelo falou como outro assistente, não como a Lyra',
    });

    // O pedido explica a regra ao modelo.
    const sistema = (
      servidor.requisicoes.at(-1)?.corpo as {
        messages: Array<{ content: string }>;
      }
    ).messages[0].content;
    expect(sistema).toContain('nada de termos técnicos nem nomes em sânscrito');

    // O pedido leva o JSON Schema com os períodos do dia, todos obrigatórios.
    const pedido = servidor.requisicoes.at(-1)?.corpo as {
      response_format: {
        type: string;
        json_schema: {
          schema: {
            properties: { periodos: { required: string[] } };
          };
        };
      };
    };
    expect(pedido.response_format.type).toBe('json_schema');
    expect(
      pedido.response_format.json_schema.schema.properties.periodos.required
    ).toEqual(entradaDaLeitura.periodos.map((p) => p.chave));
  });

  it('erro HTTP ou servidor desligado mantém a leitura da Lyra', async () => {
    const { briefing, entradaDaLeitura } = dia('2026-10-14');
    servidor.falharCom(503);
    const indisponivel = await escreverLeituraComIa({
      conexao: conexao(),
      autor,
      entrada: entradaDaLeitura,
      base: briefing.leitura,
      ontem: null,
    });
    servidor.falharCom(null);
    expect(indisponivel.ok).toBe(false);
    if (!indisponivel.ok) expect(indisponivel.motivo).toMatch(/HTTP 503/);

    const desligado = await escreverLeituraComIa({
      conexao: { ...conexao(), baseUrl: 'http://127.0.0.1:9/v1' },
      autor,
      entrada: entradaDaLeitura,
      base: briefing.leitura,
      ontem: null,
    });
    expect(desligado.ok).toBe(false);
    if (!desligado.ok)
      expect(desligado.motivo).toMatch(/Não foi possível conectar/);
  });
});
