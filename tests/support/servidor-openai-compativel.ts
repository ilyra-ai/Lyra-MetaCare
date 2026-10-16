import { createServer, type IncomingMessage } from 'node:http';
import type { AddressInfo } from 'node:net';

/**
 * Servidor HTTP real, em 127.0.0.1 e porta livre, com as duas rotas da API
 * compatível com a OpenAI que os servidores locais (Ollama, LM Studio, Jan,
 * llama.cpp) oferecem: `GET /v1/models` e `POST /v1/chat/completions`. O teste
 * define o texto que o "modelo" responde e lê as requisições recebidas, para
 * exercitar o cliente de IA de ponta a ponta pela rede.
 */

export interface RequisicaoRecebida {
  metodo: string;
  caminho: string;
  cabecalhos: IncomingMessage['headers'];
  corpo: unknown;
}

export interface ServidorOpenAiCompativel {
  baseUrl: string;
  requisicoes: RequisicaoRecebida[];
  /** Texto (ou função do pedido) que o modelo devolve no próximo chat. */
  responder(conteudo: string | ((corpo: unknown) => string)): void;
  /** Próximas respostas do chat com este status HTTP e corpo de erro. */
  falharCom(status: number | null): void;
  /**
   * Comportamento de um modelo específico (tarefa 54): falha com o status
   * HTTP (ex.: 429, cota esgotada) ou responde o texto cortado no limite de
   * tokens (`finish_reason: length`). `null` volta ao normal.
   */
  modelo(
    nome: string,
    comportamento:
      | { falha: number }
      | { cortado: string | ((corpo: unknown) => string) }
      | null
  ): void;
  modelos: string[];
  fechar(): Promise<void>;
}

export async function iniciarServidorOpenAiCompativel(
  opcoes: {
    chaveExigida?: string;
    /**
     * Tipos de `response_format` recusados, como fazem servidores reais (o
     * llama-cpp-python responde 500 a `json_schema`; outros, 422 a qualquer
     * formato).
     */
    recusarFormatos?: { tipos: string[]; status: number };
  } = {}
): Promise<ServidorOpenAiCompativel> {
  const requisicoes: RequisicaoRecebida[] = [];
  let conteudo: string | ((corpo: unknown) => string) = 'OK';
  let statusDeFalha: number | null = null;
  const estado = { modelos: ['qwen2.5:7b-instruct', 'llama3.2:3b'] };
  const porModelo = new Map<
    string,
    { falha: number } | { cortado: string | ((corpo: unknown) => string) }
  >();

  const servidor = createServer((req, res) => {
    const partes: Buffer[] = [];
    req.on('data', (parte: Buffer) => partes.push(parte));
    req.on('end', () => {
      const texto = Buffer.concat(partes).toString('utf8');
      let corpo: unknown = null;
      try {
        corpo = texto ? JSON.parse(texto) : null;
      } catch {
        corpo = texto;
      }
      requisicoes.push({
        metodo: req.method ?? '',
        caminho: req.url ?? '',
        cabecalhos: req.headers,
        corpo,
      });
      const json = (status: number, valor: unknown) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(valor));
      };
      if (
        opcoes.chaveExigida &&
        req.headers.authorization !== `Bearer ${opcoes.chaveExigida}`
      ) {
        json(401, { error: { message: 'Chave de API inválida.' } });
        return;
      }
      if (req.method === 'GET' && req.url === '/v1/models') {
        json(200, {
          object: 'list',
          data: estado.modelos.map((id) => ({ id, object: 'model' })),
        });
        return;
      }
      if (req.method === 'POST' && req.url === '/v1/chat/completions') {
        if (statusDeFalha !== null) {
          json(statusDeFalha, { error: { message: 'modelo indisponível' } });
          return;
        }
        const doModelo = porModelo.get(
          String((corpo as { model?: unknown })?.model)
        );
        if (doModelo && 'falha' in doModelo) {
          json(doModelo.falha, {
            error: { message: 'cota de tokens esgotada para este modelo' },
          });
          return;
        }
        if (doModelo && 'cortado' in doModelo) {
          json(200, {
            id: 'chatcmpl-teste',
            object: 'chat.completion',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content:
                    typeof doModelo.cortado === 'function'
                      ? doModelo.cortado(corpo)
                      : doModelo.cortado,
                },
                finish_reason: 'length',
              },
            ],
          });
          return;
        }
        const formato = (corpo as { response_format?: { type?: string } })
          ?.response_format?.type;
        if (formato && opcoes.recusarFormatos?.tipos.includes(formato)) {
          json(opcoes.recusarFormatos.status, {
            error: {
              message: `1 validation error: ('body', 'response_format', 'type') Input should be 'text', got '${formato}'`,
            },
          });
          return;
        }
        const resposta =
          typeof conteudo === 'function' ? conteudo(corpo) : conteudo;
        json(200, {
          id: 'chatcmpl-teste',
          object: 'chat.completion',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: resposta },
              finish_reason: 'stop',
            },
          ],
        });
        return;
      }
      json(404, { error: { message: 'rota inexistente' } });
    });
  });

  await new Promise<void>((resolve) =>
    servidor.listen(0, '127.0.0.1', resolve)
  );
  const { port } = servidor.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${port}/v1`,
    requisicoes,
    responder(valor) {
      conteudo = valor;
    },
    falharCom(status) {
      statusDeFalha = status;
    },
    modelo(nome, comportamento) {
      if (comportamento) porModelo.set(nome, comportamento);
      else porModelo.delete(nome);
    },
    get modelos() {
      return estado.modelos;
    },
    set modelos(valor: string[]) {
      estado.modelos = valor;
    },
    fechar: () =>
      new Promise<void>((resolve, reject) =>
        servidor.close((erro) => (erro ? reject(erro) : resolve()))
      ),
  };
}
