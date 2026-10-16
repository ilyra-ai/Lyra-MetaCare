import { describe, expect, it } from 'vitest';

import {
  assinaturaDaCadeia,
  cadeiaTemModelo,
  type EloDaCadeia,
  gerarNaCadeia,
  juntarContinuacao,
  montarCadeia,
  somenteLocais,
} from './cadeia-de-modelos';
import type {
  ConfiguracaoDeIa,
  ProvedorConfigurado,
} from './provedores-da-plataforma';

type Comportamento =
  { status: number } | { texto: string; cortado?: boolean } | { rede: true };

/**
 * `fetch` falso de um servidor compatível com a OpenAI: cada modelo tem o
 * seu comportamento, e os pedidos recebidos ficam guardados.
 */
function servidorFalso(comportamentos: Record<string, Comportamento>) {
  const pedidos: Array<{ modelo: string; usuario: string; corpo: unknown }> =
    [];
  const buscar = (async (_url: string | URL | Request, init?: RequestInit) => {
    const corpo = JSON.parse(String(init?.body)) as {
      model: string;
      messages: Array<{ role: string; content: string }>;
    };
    pedidos.push({
      modelo: corpo.model,
      usuario: corpo.messages[1].content,
      corpo,
    });
    const comportamento = comportamentos[corpo.model];
    if (!comportamento) throw new Error(`modelo sem roteiro: ${corpo.model}`);
    if ('rede' in comportamento) {
      throw new TypeError('fetch failed', {
        cause: new Error('connect ECONNREFUSED 127.0.0.1:11434'),
      });
    }
    if ('status' in comportamento) {
      return new Response(
        JSON.stringify({ error: { message: 'quota exceeded' } }),
        { status: comportamento.status }
      );
    }
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: { role: 'assistant', content: comportamento.texto },
            finish_reason: comportamento.cortado ? 'length' : 'stop',
          },
        ],
      }),
      { status: 200 }
    );
  }) as typeof fetch;
  return { buscar, pedidos };
}

function elo(modelo: string, local = true): EloDaCadeia {
  return {
    tipo: 'modelo',
    conexao: {
      tipo: 'openai_compativel',
      baseUrl: 'http://localhost:11434/v1',
      modelo,
      chave: null,
      tempoMaximoSegundos: 30,
      temperatura: 0.7,
    },
    autor: { provedor: 'Ollama', modelo, local },
  };
}

const pedido = { sistema: 'Você é a Lyra.', usuario: 'Como será o meu dia?' };

describe('gerarNaCadeia', () => {
  it('o primeiro modelo que responde é o autor; sem troca, um só pedido', async () => {
    const { buscar, pedidos } = servidorFalso({ a: { texto: 'Dia calmo.' } });
    const resultado = await gerarNaCadeia(
      [elo('a'), elo('b'), { tipo: 'lyra' }],
      pedido,
      { buscar }
    );
    expect(resultado).toMatchObject({
      origem: 'modelo',
      texto: 'Dia calmo.',
      autor: { modelo: 'a' },
    });
    expect(pedidos).toHaveLength(1);
  });

  it('cota esgotada (429), erro do servidor e rede fora passam a vez ao próximo', async () => {
    const { buscar, pedidos } = servidorFalso({
      a: { status: 429 },
      b: { rede: true },
      c: { status: 503 },
      d: { texto: 'Resposta do quarto modelo.' },
    });
    const resultado = await gerarNaCadeia(
      [elo('a'), elo('b'), elo('c'), elo('d'), { tipo: 'lyra' }],
      pedido,
      { buscar }
    );
    expect(resultado.origem).toBe('modelo');
    if (resultado.origem !== 'modelo') return;
    expect(resultado.texto).toBe('Resposta do quarto modelo.');
    expect(resultado.tentativas.map((t) => t.resultado)).toEqual([
      'falhou',
      'falhou',
      'falhou',
      'ok',
    ]);
    expect(resultado.tentativas[0].motivo).toMatch(/HTTP 429/);
    expect(resultado.tentativas[1].motivo).toMatch(/ECONNREFUSED/);
    // Todos receberam o mesmo pedido original.
    expect(new Set(pedidos.map((p) => p.usuario))).toEqual(
      new Set([pedido.usuario])
    );
  });

  it('resposta cortada no limite de tokens é continuada pelo próximo, de onde parou', async () => {
    const { buscar, pedidos } = servidorFalso({
      a: { texto: 'Hoje a Lua pede calma e', cortado: true },
      b: { texto: 'calma e presença nas conversas da tarde.' },
    });
    const resultado = await gerarNaCadeia(
      [elo('a'), elo('b'), { tipo: 'lyra' }],
      { ...pedido, maximoDeTokens: 64 },
      { buscar }
    );
    expect(resultado.origem).toBe('modelo');
    if (resultado.origem !== 'modelo') return;
    // A emenda repetida ("calma e") não aparece duas vezes.
    expect(resultado.texto).toBe(
      'Hoje a Lua pede calma e presença nas conversas da tarde.'
    );
    expect(resultado.autores.map((a) => a.modelo)).toEqual(['a', 'b']);
    expect(pedidos[1].usuario).toContain('Continue exatamente do ponto');
    expect(pedidos[1].usuario).toContain('Hoje a Lua pede calma e');
    // A continuação não pede formato estruturado.
    expect(pedidos[1].corpo).not.toHaveProperty('response_format');
    expect(pedidos[0].corpo).toHaveProperty('max_tokens', 64);
  });

  it('se o modelo que continuava falha, o seguinte continua o mesmo trecho', async () => {
    const { buscar, pedidos } = servidorFalso({
      a: { texto: 'Primeira parte', cortado: true },
      b: { status: 500 },
      c: { texto: 'segunda parte.' },
    });
    const resultado = await gerarNaCadeia(
      [elo('a'), elo('b'), elo('c'), { tipo: 'lyra' }],
      pedido,
      { buscar }
    );
    expect(resultado.origem === 'modelo' && resultado.texto).toBe(
      'Primeira parte segunda parte.'
    );
    expect(pedidos[2].usuario).toContain('Primeira parte');
  });

  it('resposta recusada na conferência passa ao próximo, do zero', async () => {
    const { buscar, pedidos } = servidorFalso({
      a: { texto: 'sem json' },
      b: { texto: '{"ok":true}' },
    });
    const resultado = await gerarNaCadeia(
      [elo('a'), elo('b'), { tipo: 'lyra' }],
      pedido,
      {
        buscar,
        validar: (texto) => (texto.startsWith('{') ? null : 'não é JSON'),
      }
    );
    expect(resultado.origem === 'modelo' && resultado.texto).toBe(
      '{"ok":true}'
    );
    expect(resultado.tentativas[0]).toMatchObject({
      resultado: 'recusado',
      motivo: 'não é JSON',
    });
    expect(pedidos[1].usuario).toBe(pedido.usuario);
  });

  it('chegando ao motor da Lyra, para: os modelos depois dele não são chamados', async () => {
    const { buscar, pedidos } = servidorFalso({
      a: { status: 503 },
      b: { texto: 'não deveria ser chamado' },
    });
    const resultado = await gerarNaCadeia(
      [elo('a'), { tipo: 'lyra' }, elo('b')],
      pedido,
      { buscar }
    );
    expect(resultado.origem).toBe('lyra');
    expect(pedidos.map((p) => p.modelo)).toEqual(['a']);
  });
});

function provedor(
  preset: string,
  baseUrl: string | null,
  modelos: string[],
  chave: string | null = null
): ProvedorConfigurado {
  return {
    id: `id-${preset}`,
    preset,
    tipo: preset === 'gemini' ? 'gemini' : 'openai_compativel',
    baseUrl,
    chave,
    finalDaChave: null,
    chaveIlegivel: false,
    modelos,
    tempoMaximoSegundos: 60,
    temperatura: 0.7,
    atualizadoEm: '2026-10-16T10:00:00.000Z',
  };
}

describe('montarCadeia', () => {
  const configuracao: ConfiguracaoDeIa = {
    provedores: [
      provedor('ollama', 'http://localhost:11434/v1', ['qwen', 'llama']),
      provedor('openai', 'https://api.openai.com/v1', ['gpt'], 'sk-1'),
      // Exige chave e está sem: é pulado.
      provedor('groq', 'https://api.groq.com/openai/v1', ['mixtral']),
    ],
    ordem: [
      { tipo: 'modelo', preset: 'groq', modelo: 'mixtral' },
      { tipo: 'modelo', preset: 'openai', modelo: 'gpt' },
      { tipo: 'modelo', preset: 'ollama', modelo: 'llama' },
    ],
    atualizadoEm: '2026-10-16T10:00:00.000Z',
  };

  it('segue a ordem, pula provedor incompleto e fecha com o motor da Lyra', () => {
    const cadeia = montarCadeia(configuracao);
    expect(
      cadeia.map((e) => (e.tipo === 'lyra' ? 'lyra' : e.autor.modelo))
    ).toEqual(['gpt', 'llama', 'lyra']);
    expect(cadeiaTemModelo(cadeia)).toBe(true);
    expect(
      somenteLocais(cadeia).map((e) =>
        e.tipo === 'lyra' ? 'lyra' : e.autor.modelo
      )
    ).toEqual(['llama', 'lyra']);
  });

  it('o motor da Lyra em 1º deixa a cadeia sem modelo', () => {
    const cadeia = montarCadeia({
      ...configuracao,
      ordem: [
        { tipo: 'lyra' },
        { tipo: 'modelo', preset: 'ollama', modelo: 'qwen' },
      ],
    });
    expect(cadeia).toEqual([{ tipo: 'lyra' }]);
    expect(cadeiaTemModelo(cadeia)).toBe(false);
    expect(assinaturaDaCadeia(cadeia, 'x')).toBe('lyra_local');
  });

  it('a assinatura muda com a ordem e não contém chaves', () => {
    const uma = assinaturaDaCadeia(montarCadeia(configuracao), 'x');
    const outra = assinaturaDaCadeia(
      montarCadeia({
        ...configuracao,
        ordem: [...configuracao.ordem].reverse(),
      }),
      'x'
    );
    expect(uma).not.toBe(outra);
    expect(uma).not.toContain('sk-1');
  });
});

describe('juntarContinuacao', () => {
  it('não repete a emenda e põe espaço entre palavras', () => {
    expect(juntarContinuacao('O dia pede', 'calma.')).toBe('O dia pede calma.');
    expect(
      juntarContinuacao(
        'A Lua em Touro pede descanso e',
        'pede descanso e silêncio à noite.'
      )
    ).toBe('A Lua em Touro pede descanso e silêncio à noite.');
    expect(juntarContinuacao('{"a":"x', '","b":1}')).toBe('{"a":"x","b":1}');
  });
});
