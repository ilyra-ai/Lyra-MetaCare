import type { TipoDeProvedor } from './provedores-catalogo';

/**
 * Cliente HTTP dos provedores de IA (servidor). Fala as três APIs aceitas
 * (chat completions compatível com a OpenAI, Gemini nativo e Anthropic
 * Messages), com tempo máximo, chave sempre em cabeçalho e mensagens de erro
 * que nunca repetem a chave.
 */

export interface ConexaoDeIa {
  tipo: Exclude<TipoDeProvedor, 'lyra_local'>;
  /** Obrigatória para `openai_compativel`; ignorada nas APIs nativas. */
  baseUrl: string | null;
  modelo: string;
  chave: string | null;
  tempoMaximoSegundos: number;
  temperatura: number;
}

export class ErroDoProvedor extends Error {
  constructor(
    message: string,
    readonly status: number | null = null
  ) {
    super(message);
    this.name = 'ErroDoProvedor';
  }
}

const URL_DO_GEMINI = 'https://generativelanguage.googleapis.com/v1beta';
const URL_DA_ANTHROPIC = 'https://api.anthropic.com/v1';
const VERSAO_DA_ANTHROPIC = '2023-06-01';

/** URL base sem barra final; só http(s) e sem usuário/senha embutidos. */
export function normalizarBaseUrl(valor: string): string {
  let url: URL;
  try {
    url = new URL(valor.trim());
  } catch {
    throw new ErroDoProvedor('URL base inválida.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ErroDoProvedor(
      'A URL base precisa começar com http:// ou https://.'
    );
  }
  if (url.username || url.password) {
    throw new ErroDoProvedor(
      'Não coloque usuário ou senha na URL: use o campo da chave.'
    );
  }
  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/+$/, '');
}

function ocultarChave(texto: string, chave: string | null) {
  return chave ? texto.split(chave).join('•••') : texto;
}

async function requisitar(
  conexao: ConexaoDeIa,
  url: string,
  init: RequestInit,
  buscar: typeof fetch
): Promise<unknown> {
  let resposta: Response;
  try {
    resposta = await buscar(url, {
      ...init,
      cache: 'no-store',
      signal: AbortSignal.timeout(conexao.tempoMaximoSegundos * 1000),
    });
  } catch (erro) {
    const nome = erro instanceof Error ? erro.name : '';
    if (nome === 'TimeoutError' || nome === 'AbortError') {
      throw new ErroDoProvedor(
        `Sem resposta em ${conexao.tempoMaximoSegundos} s (tempo máximo).`
      );
    }
    const causa =
      erro instanceof Error && erro.cause instanceof Error
        ? erro.cause.message
        : erro instanceof Error
          ? erro.message
          : 'falha de rede';
    throw new ErroDoProvedor(
      `Não foi possível conectar: ${ocultarChave(causa, conexao.chave)}.`
    );
  }
  const texto = await resposta.text();
  let corpo: unknown = null;
  try {
    corpo = texto ? JSON.parse(texto) : null;
  } catch {
    corpo = null;
  }
  if (!resposta.ok) {
    const detalhe =
      (typeof corpo === 'object' &&
        corpo !== null &&
        (() => {
          const erro = (corpo as { error?: unknown }).error;
          if (typeof erro === 'string') return erro;
          if (typeof erro === 'object' && erro !== null) {
            const mensagem = (erro as { message?: unknown }).message;
            return typeof mensagem === 'string' ? mensagem : null;
          }
          return null;
        })()) ||
      texto.slice(0, 300) ||
      resposta.statusText;
    throw new ErroDoProvedor(
      `O provedor respondeu HTTP ${resposta.status}: ${ocultarChave(String(detalhe), conexao.chave).slice(0, 300)}`,
      resposta.status
    );
  }
  if (corpo === null) {
    throw new ErroDoProvedor('O provedor respondeu sem um JSON válido.');
  }
  return corpo;
}

function cabecalhosOpenAi(conexao: ConexaoDeIa) {
  const cabecalhos: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (conexao.chave) cabecalhos.Authorization = `Bearer ${conexao.chave}`;
  return cabecalhos;
}

function baseObrigatoria(conexao: ConexaoDeIa) {
  if (!conexao.baseUrl) {
    throw new ErroDoProvedor('Informe a URL base do servidor de IA.');
  }
  return normalizarBaseUrl(conexao.baseUrl);
}

function exigirChave(conexao: ConexaoDeIa) {
  if (!conexao.chave) {
    throw new ErroDoProvedor('Este provedor exige uma chave de API.');
  }
  return conexao.chave;
}

/** Modelos oferecidos pelo provedor, em ordem alfabética. */
export async function listarModelos(
  conexao: Omit<ConexaoDeIa, 'modelo' | 'temperatura'>,
  buscar: typeof fetch = fetch
): Promise<string[]> {
  const completa: ConexaoDeIa = { ...conexao, modelo: '', temperatura: 0 };
  let ids: string[] = [];
  if (conexao.tipo === 'openai_compativel') {
    const corpo = (await requisitar(
      completa,
      `${baseObrigatoria(completa)}/models`,
      { method: 'GET', headers: cabecalhosOpenAi(completa) },
      buscar
    )) as { data?: Array<{ id?: unknown }>; models?: Array<{ id?: unknown }> };
    ids = [...(corpo.data ?? []), ...(corpo.models ?? [])]
      .map((m) => (typeof m.id === 'string' ? m.id : ''))
      .filter(Boolean);
  } else if (conexao.tipo === 'gemini') {
    const corpo = (await requisitar(
      completa,
      `${URL_DO_GEMINI}/models?pageSize=200`,
      {
        method: 'GET',
        headers: { 'x-goog-api-key': exigirChave(completa) },
      },
      buscar
    )) as {
      models?: Array<{
        name?: unknown;
        supportedGenerationMethods?: unknown;
      }>;
    };
    ids = (corpo.models ?? [])
      .filter(
        (m) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes('generateContent')
      )
      .map((m) =>
        typeof m.name === 'string' ? m.name.replace(/^models\//, '') : ''
      )
      .filter(Boolean);
  } else {
    const corpo = (await requisitar(
      completa,
      `${URL_DA_ANTHROPIC}/models?limit=100`,
      {
        method: 'GET',
        headers: {
          'x-api-key': exigirChave(completa),
          'anthropic-version': VERSAO_DA_ANTHROPIC,
        },
      },
      buscar
    )) as { data?: Array<{ id?: unknown }> };
    ids = (corpo.data ?? [])
      .map((m) => (typeof m.id === 'string' ? m.id : ''))
      .filter(Boolean);
  }
  return [...new Set(ids)].sort((a, b) => a.localeCompare(b));
}

export interface PedidoDeTexto {
  sistema: string;
  usuario: string;
  /** Pede JSON ao provedor quando a API tem esse modo (Gemini). */
  json?: boolean;
  /** JSON Schema da resposta, para saída estruturada (ver `formatosDeSaida`). */
  esquemaJson?: Record<string, unknown>;
  nomeDoEsquema?: string;
  maximoDeTokens?: number;
}

/**
 * Formatos de saída estruturada, do mais preciso ao mais simples. Com um
 * JSON Schema, o servidor gera presa a ele por gramática (llama.cpp, Ollama,
 * LM Studio, vLLM, OpenAI): o padrão `json_schema` da OpenAI, depois
 * `json_object` com o esquema (llama-cpp-python e llama.cpp) e, por último,
 * sem formato (servidores que recusam os anteriores). Sem esquema, só o
 * pedido livre.
 */
function formatosDeSaida(
  pedido: PedidoDeTexto
): Array<Record<string, unknown> | null> {
  if (!pedido.esquemaJson) return [null];
  return [
    {
      type: 'json_schema',
      json_schema: {
        name: pedido.nomeDoEsquema ?? 'resposta',
        schema: pedido.esquemaJson,
        strict: true,
      },
    },
    { type: 'json_object', schema: pedido.esquemaJson },
    null,
  ];
}

/**
 * Recusa imediata do formato pedido (o servidor não gerou nada): 400/422, ou
 * qualquer status cuja mensagem cite o campo do formato (o llama-cpp-python
 * responde 500 com o erro de validação de `response_format`; o Gemini cita
 * `response_json_schema`).
 */
function formatoRecusado(erro: unknown) {
  if (!(erro instanceof ErroDoProvedor) || erro.status === null) return false;
  return (
    erro.status === 400 ||
    erro.status === 422 ||
    /response_format|response_?json_?schema/i.test(erro.message)
  );
}

/** Remove raciocínio exposto (`<think>`) que alguns modelos locais devolvem. */
export function semRaciocinio(texto: string) {
  return texto.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/** Texto gerado e se ele foi cortado no limite de tokens da resposta. */
export interface TextoGerado {
  texto: string;
  /**
   * A resposta parou no limite de tokens (OpenAI `finish_reason: length`,
   * Gemini `MAX_TOKENS`, Anthropic `max_tokens`): o texto está incompleto e
   * pode ser continuado por outro modelo (ver cadeia-de-modelos.ts).
   */
  cortado: boolean;
}

/** Texto gerado pelo modelo configurado. */
export async function gerarTexto(
  conexao: ConexaoDeIa,
  pedido: PedidoDeTexto,
  buscar: typeof fetch = fetch
): Promise<string> {
  return (await gerarTextoDetalhado(conexao, pedido, buscar)).texto;
}

/**
 * Como `gerarTexto`, informando também se a resposta foi cortada no limite
 * de tokens (tarefa 54). Um raciocínio (`<think>`) cortado antes de fechar
 * não é texto da resposta e é descartado.
 */
export async function gerarTextoDetalhado(
  conexao: ConexaoDeIa,
  pedido: PedidoDeTexto,
  buscar: typeof fetch = fetch
): Promise<TextoGerado> {
  if (!conexao.modelo.trim()) {
    throw new ErroDoProvedor('Escolha o modelo.');
  }
  let texto = '';
  let cortado = false;
  if (conexao.tipo === 'openai_compativel') {
    const formatos = formatosDeSaida(pedido);
    let corpo: {
      choices?: Array<{
        message?: { content?: unknown };
        finish_reason?: unknown;
      }>;
    } = {};
    for (const [indice, formato] of formatos.entries()) {
      try {
        corpo = (await requisitar(
          conexao,
          `${baseObrigatoria(conexao)}/chat/completions`,
          {
            method: 'POST',
            headers: cabecalhosOpenAi(conexao),
            body: JSON.stringify({
              model: conexao.modelo,
              temperature: conexao.temperatura,
              stream: false,
              messages: [
                { role: 'system', content: pedido.sistema },
                { role: 'user', content: pedido.usuario },
              ],
              ...(pedido.maximoDeTokens
                ? { max_tokens: pedido.maximoDeTokens }
                : {}),
              ...(formato ? { response_format: formato } : {}),
            }),
          },
          buscar
        )) as typeof corpo;
        break;
      } catch (erro) {
        if (!formatoRecusado(erro) || indice === formatos.length - 1) {
          throw erro;
        }
      }
    }
    const conteudo = corpo.choices?.[0]?.message?.content;
    texto = typeof conteudo === 'string' ? conteudo : '';
    cortado = corpo.choices?.[0]?.finish_reason === 'length';
  } else if (conexao.tipo === 'gemini') {
    const comEsquema = pedido.esquemaJson ? [true, false] : [false];
    let corpo: {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: unknown }> };
        finishReason?: unknown;
      }>;
    } = {};
    for (const [indice, usarEsquema] of comEsquema.entries()) {
      try {
        corpo = (await requisitar(
          conexao,
          `${URL_DO_GEMINI}/models/${encodeURIComponent(conexao.modelo)}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Chave no cabeçalho, nunca na URL (que aparece em logs de proxy).
              'x-goog-api-key': exigirChave(conexao),
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: pedido.sistema }] },
              contents: [{ role: 'user', parts: [{ text: pedido.usuario }] }],
              generationConfig: {
                temperature: conexao.temperatura,
                ...(pedido.maximoDeTokens
                  ? { maxOutputTokens: pedido.maximoDeTokens }
                  : {}),
                ...(pedido.json || pedido.esquemaJson
                  ? { responseMimeType: 'application/json' }
                  : {}),
                ...(usarEsquema
                  ? { responseJsonSchema: pedido.esquemaJson }
                  : {}),
              },
            }),
          },
          buscar
        )) as typeof corpo;
        break;
      } catch (erro) {
        if (!formatoRecusado(erro) || indice === comEsquema.length - 1) {
          throw erro;
        }
      }
    }
    texto = (corpo.candidates?.[0]?.content?.parts ?? [])
      .map((parte) => (typeof parte.text === 'string' ? parte.text : ''))
      .join('');
    cortado = corpo.candidates?.[0]?.finishReason === 'MAX_TOKENS';
  } else {
    const corpo = (await requisitar(
      conexao,
      `${URL_DA_ANTHROPIC}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': exigirChave(conexao),
          'anthropic-version': VERSAO_DA_ANTHROPIC,
        },
        body: JSON.stringify({
          model: conexao.modelo,
          max_tokens: pedido.maximoDeTokens ?? 4096,
          // A API Messages aceita temperatura de 0 a 1.
          temperature: Math.min(1, conexao.temperatura),
          system: pedido.sistema,
          messages: [{ role: 'user', content: pedido.usuario }],
        }),
      },
      buscar
    )) as {
      content?: Array<{ type?: unknown; text?: unknown }>;
      stop_reason?: unknown;
    };
    texto = (corpo.content ?? [])
      .map((bloco) =>
        bloco.type === 'text' && typeof bloco.text === 'string'
          ? bloco.text
          : ''
      )
      .join('');
    cortado = corpo.stop_reason === 'max_tokens';
  }
  // Raciocínio aberto e não fechado (cortado no meio) sai inteiro.
  const limpo = semRaciocinio(texto)
    .replace(/<think>[\s\S]*$/i, '')
    .trim();
  if (!limpo) {
    throw new ErroDoProvedor(
      cortado
        ? 'O modelo atingiu o limite de tokens antes de escrever a resposta.'
        : 'O modelo respondeu sem texto.'
    );
  }
  return { texto: limpo, cortado };
}

/**
 * Primeiro objeto JSON do texto: aceita a resposta pura, cercada por ```json
 * ou com frases antes e depois (comum em modelos locais pequenos).
 */
export function extrairJson(texto: string): unknown {
  const limpo = semRaciocinio(texto)
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(limpo);
  } catch {
    const inicio = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');
    if (inicio === -1 || fim <= inicio) {
      throw new ErroDoProvedor('A resposta do modelo não contém JSON.');
    }
    try {
      return JSON.parse(limpo.slice(inicio, fim + 1));
    } catch {
      throw new ErroDoProvedor('A resposta do modelo tem um JSON inválido.');
    }
  }
}
