import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  iniciarServidorOpenAiCompativel,
  type ServidorOpenAiCompativel,
} from '../../../tests/support/servidor-openai-compativel';
import { cifrar, decifrar } from '../security/cifra';
import {
  type ConexaoDeIa,
  ErroDoProvedor,
  extrairJson,
  gerarTexto,
  listarModelos,
  normalizarBaseUrl,
} from './cliente-de-ia';
import { presetPorId, urlEhLocal } from './provedores-catalogo';

describe('URL base e catálogo', () => {
  it('normaliza a URL e recusa protocolo errado ou credencial embutida', () => {
    expect(normalizarBaseUrl(' http://localhost:11434/v1/ ')).toBe(
      'http://localhost:11434/v1'
    );
    expect(() => normalizarBaseUrl('ftp://servidor/v1')).toThrow(
      ErroDoProvedor
    );
    expect(() => normalizarBaseUrl('http://u:s@localhost:1234/v1')).toThrow(
      /usuário ou senha/
    );
    expect(() => normalizarBaseUrl('não é url')).toThrow(/inválida/);
  });

  it('reconhece endereços locais e de rede privada', () => {
    for (const url of [
      'http://localhost:11434/v1',
      'http://127.0.0.1:1234/v1',
      'http://192.168.0.20:1337/v1',
      'http://10.0.0.5:8080/v1',
      'http://host.docker.internal:11434/v1',
      'http://[::1]:8080/v1',
    ]) {
      expect(urlEhLocal(url)).toBe(true);
    }
    expect(urlEhLocal('https://api.openai.com/v1')).toBe(false);
    expect(urlEhLocal(null)).toBe(false);
  });

  it('traz os servidores locais pedidos (Ollama, LM Studio, Jan, llama.cpp)', () => {
    expect(presetPorId('ollama')?.urlPadrao).toBe('http://localhost:11434/v1');
    expect(presetPorId('lm_studio')?.urlPadrao).toBe(
      'http://localhost:1234/v1'
    );
    expect(presetPorId('jan')?.urlPadrao).toBe('http://localhost:1337/v1');
    expect(presetPorId('llama_cpp')?.urlPadrao).toBe(
      'http://localhost:8080/v1'
    );
    for (const id of ['ollama', 'lm_studio', 'jan', 'llama_cpp']) {
      expect(presetPorId(id)?.local).toBe(true);
      expect(presetPorId(id)?.exigeChave).toBe(false);
    }
  });
});

describe('extração de JSON da resposta do modelo', () => {
  it('aceita JSON puro, cercado e com texto em volta; recusa o que não é JSON', () => {
    expect(extrairJson('{"a":1}')).toEqual({ a: 1 });
    expect(extrairJson('```json\n{"a":2}\n```')).toEqual({ a: 2 });
    expect(
      extrairJson('<think>x</think>Aqui está: {"a":3} espero ajudar')
    ).toEqual({ a: 3 });
    expect(() => extrairJson('sem json')).toThrow(/não contém JSON/);
    expect(() => extrairJson('{"a":}')).toThrow(/JSON inválido/);
  });
});

describe('cliente compatível com a OpenAI (servidor HTTP real)', () => {
  let servidor: ServidorOpenAiCompativel;
  beforeAll(async () => {
    servidor = await iniciarServidorOpenAiCompativel({
      chaveExigida: 'jan-123',
    });
  });
  afterAll(() => servidor.fechar());

  const conexao = (chave: string | null): ConexaoDeIa => ({
    tipo: 'openai_compativel',
    baseUrl: `${servidor.baseUrl}/`,
    modelo: 'llama3.2:3b',
    chave,
    tempoMaximoSegundos: 5,
    temperatura: 0.2,
  });

  it('lista os modelos e gera texto com a chave no cabeçalho Authorization', async () => {
    expect(await listarModelos(conexao('jan-123'))).toEqual([
      'llama3.2:3b',
      'qwen2.5:7b-instruct',
    ]);
    servidor.responder('<think>pensando</think>Ashwini? Não: Krittika.');
    expect(
      await gerarTexto(conexao('jan-123'), { sistema: 's', usuario: 'u' })
    ).toBe('Ashwini? Não: Krittika.');
    const pedido = servidor.requisicoes.at(-1);
    expect(pedido?.cabecalhos.authorization).toBe('Bearer jan-123');
    expect(pedido?.caminho).toBe('/v1/chat/completions');
    expect(pedido?.corpo).toMatchObject({
      model: 'llama3.2:3b',
      temperature: 0.2,
      stream: false,
    });
  });

  it('chave errada vira erro com o status, sem repetir a chave', async () => {
    const erro = await gerarTexto(conexao('chave-errada-xyz'), {
      sistema: 's',
      usuario: 'u',
    }).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ErroDoProvedor);
    expect((erro as ErroDoProvedor).status).toBe(401);
    expect((erro as Error).message).not.toContain('chave-errada-xyz');
  });
});

describe('saída estruturada por JSON Schema', () => {
  const esquema = {
    type: 'object',
    properties: { a: { type: 'string', minLength: 2 } },
    required: ['a'],
    additionalProperties: false,
  };
  const conexao = (baseUrl: string): ConexaoDeIa => ({
    tipo: 'openai_compativel',
    baseUrl,
    modelo: 'qwen2.5-1.5b-instruct',
    chave: null,
    tempoMaximoSegundos: 5,
    temperatura: 0.7,
  });
  const formatos = (servidor: ServidorOpenAiCompativel) =>
    servidor.requisicoes
      .filter((r) => r.caminho === '/v1/chat/completions')
      .map(
        (r) =>
          (r.corpo as { response_format?: { type: string } }).response_format
            ?.type ?? 'nenhum'
      );

  it('pede json_schema primeiro (padrão OpenAI, Ollama, LM Studio, vLLM)', async () => {
    const servidor = await iniciarServidorOpenAiCompativel();
    try {
      servidor.responder('{"a":"ok"}');
      await gerarTexto(conexao(servidor.baseUrl), {
        sistema: 's',
        usuario: 'u',
        esquemaJson: esquema,
        nomeDoEsquema: 'teste',
      });
      expect(formatos(servidor)).toEqual(['json_schema']);
      expect(servidor.requisicoes[0].corpo).toMatchObject({
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'teste', schema: esquema, strict: true },
        },
      });
    } finally {
      await servidor.fechar();
    }
  });

  it('servidor que recusa json_schema com 500 (llama-cpp-python) recebe json_object com o esquema', async () => {
    const servidor = await iniciarServidorOpenAiCompativel({
      recusarFormatos: { tipos: ['json_schema'], status: 500 },
    });
    try {
      servidor.responder('{"a":"ok"}');
      const texto = await gerarTexto(conexao(servidor.baseUrl), {
        sistema: 's',
        usuario: 'u',
        esquemaJson: esquema,
      });
      expect(texto).toBe('{"a":"ok"}');
      expect(formatos(servidor)).toEqual(['json_schema', 'json_object']);
      expect(servidor.requisicoes[1].corpo).toMatchObject({
        response_format: { type: 'json_object', schema: esquema },
      });
    } finally {
      await servidor.fechar();
    }
  });

  it('servidor sem saída estruturada (422) recebe o pedido livre', async () => {
    const servidor = await iniciarServidorOpenAiCompativel({
      recusarFormatos: { tipos: ['json_schema', 'json_object'], status: 422 },
    });
    try {
      servidor.responder('{"a":"ok"}');
      await gerarTexto(conexao(servidor.baseUrl), {
        sistema: 's',
        usuario: 'u',
        esquemaJson: esquema,
      });
      expect(formatos(servidor)).toEqual([
        'json_schema',
        'json_object',
        'nenhum',
      ]);
    } finally {
      await servidor.fechar();
    }
  });

  it('falha que não é do formato (503) não é repetida', async () => {
    const servidor = await iniciarServidorOpenAiCompativel();
    try {
      servidor.falharCom(503);
      await expect(
        gerarTexto(conexao(servidor.baseUrl), {
          sistema: 's',
          usuario: 'u',
          esquemaJson: esquema,
        })
      ).rejects.toThrow(/HTTP 503/);
      expect(formatos(servidor)).toEqual(['json_schema']);
    } finally {
      await servidor.fechar();
    }
  });
});

describe('APIs nativas (Gemini e Anthropic)', () => {
  function capturar(resposta: unknown) {
    const pedidos: Array<{ url: string; init: RequestInit }> = [];
    const buscar = (async (url: string | URL | Request, init?: RequestInit) => {
      pedidos.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify(resposta), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;
    return { pedidos, buscar };
  }

  it('Gemini: chave no cabeçalho x-goog-api-key, nunca na URL', async () => {
    const { pedidos, buscar } = capturar({
      candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }],
    });
    const texto = await gerarTexto(
      {
        tipo: 'gemini',
        baseUrl: null,
        modelo: 'gemini-2.5-flash',
        chave: 'AIza-teste',
        tempoMaximoSegundos: 5,
        temperatura: 0.7,
      },
      { sistema: 's', usuario: 'u', json: true },
      buscar
    );
    expect(texto).toBe('{"ok":true}');
    expect(pedidos[0].url).not.toContain('AIza-teste');
    expect(pedidos[0].url).toContain(
      '/models/gemini-2.5-flash:generateContent'
    );
    expect(
      (pedidos[0].init.headers as Record<string, string>)['x-goog-api-key']
    ).toBe('AIza-teste');
    expect(JSON.parse(String(pedidos[0].init.body))).toMatchObject({
      systemInstruction: { parts: [{ text: 's' }] },
      generationConfig: { responseMimeType: 'application/json' },
    });
  });

  it('Anthropic: x-api-key, versão da API e temperatura limitada a 1', async () => {
    const { pedidos, buscar } = capturar({
      content: [{ type: 'text', text: 'Olá' }],
    });
    const texto = await gerarTexto(
      {
        tipo: 'anthropic',
        baseUrl: null,
        modelo: 'claude-modelo',
        chave: 'sk-ant-teste',
        tempoMaximoSegundos: 5,
        temperatura: 1.4,
      },
      { sistema: 's', usuario: 'u' },
      buscar
    );
    expect(texto).toBe('Olá');
    const cabecalhos = pedidos[0].init.headers as Record<string, string>;
    expect(cabecalhos['x-api-key']).toBe('sk-ant-teste');
    expect(cabecalhos['anthropic-version']).toBe('2023-06-01');
    expect(JSON.parse(String(pedidos[0].init.body))).toMatchObject({
      model: 'claude-modelo',
      temperature: 1,
      system: 's',
    });
  });

  it('APIs nativas sem chave recusam antes de chamar a rede', async () => {
    const { pedidos, buscar } = capturar({});
    await expect(
      gerarTexto(
        {
          tipo: 'gemini',
          baseUrl: null,
          modelo: 'gemini-2.5-flash',
          chave: null,
          tempoMaximoSegundos: 5,
          temperatura: 0.7,
        },
        { sistema: 's', usuario: 'u' },
        buscar
      )
    ).rejects.toThrow(/exige uma chave/);
    expect(pedidos).toHaveLength(0);
  });
});

describe('cifra das chaves de API', () => {
  it('decifra o que cifrou; texto alterado ou outro AUTH_SECRET resultam em null', () => {
    const original = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = 'a'.repeat(48);
    try {
      const cifrado = cifrar('sk-segredo-1234', 'teste');
      expect(cifrado).not.toContain('sk-segredo');
      expect(decifrar(cifrado, 'teste')).toBe('sk-segredo-1234');
      expect(decifrar(cifrado, 'outra-finalidade')).toBeNull();
      const partes = cifrado.split('.');
      partes[3] = `${partes[3].slice(0, -2)}AA`;
      expect(decifrar(partes.join('.'), 'teste')).toBeNull();
      process.env.AUTH_SECRET = 'b'.repeat(48);
      expect(decifrar(cifrado, 'teste')).toBeNull();
    } finally {
      process.env.AUTH_SECRET = original;
    }
  });
});
