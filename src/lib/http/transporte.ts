import { paginaSaindo } from '@/lib/navegador/saida-da-pagina';

/**
 * Transporte HTTP do cliente (tarefa 58).
 *
 * Antes, o cliente de dados fazia `response.json()` sem checar a resposta:
 * uma queda de rede, um 502 do proxy ou uma página HTML de erro rejeitavam a
 * promise, enquanto quem chamava esperava `{ error }`. O botão de login
 * travava, cargas ficavam "carregando" para sempre e o chat mostrava
 * "Unexpected token '<'". Aqui nada é lançado: toda falha volta como valor,
 * com mensagem em pt-BR e o status HTTP.
 */

export type MotivoDaFalha = 'rede' | 'cancelada' | 'resposta-invalida' | 'http';

export interface FalhaDeTransporte {
  message: string;
  status: number | null;
  motivo: MotivoDaFalha;
}

export type RespostaDoTransporte =
  | { ok: true; status: number; corpo: unknown }
  | {
      ok: false;
      status: number | null;
      corpo: unknown;
      falha: FalhaDeTransporte;
    };

/** Mensagem pt-BR de um erro de rede, de leitura ou de cancelamento. */
export function mensagemDaFalha(erro: unknown): FalhaDeTransporte {
  if (
    (erro instanceof DOMException && erro.name === 'AbortError') ||
    paginaSaindo()
  ) {
    return {
      message: 'A requisição foi cancelada.',
      status: null,
      motivo: 'cancelada',
    };
  }
  if (erro instanceof DOMException && erro.name === 'TimeoutError') {
    return {
      message: 'O servidor demorou demais para responder. Tente de novo.',
      status: null,
      motivo: 'rede',
    };
  }
  return {
    message: 'Não foi possível falar com o servidor. Verifique a sua conexão.',
    status: null,
    motivo: 'rede',
  };
}

function mensagemDoCorpo(corpo: unknown): string | null {
  if (typeof corpo !== 'object' || corpo === null) return null;
  const erro = (corpo as { error?: unknown }).error;
  if (typeof erro === 'string' && erro.trim()) return erro;
  if (typeof erro === 'object' && erro !== null) {
    const mensagem = (erro as { message?: unknown }).message;
    if (typeof mensagem === 'string' && mensagem.trim()) return mensagem;
  }
  return null;
}

/**
 * `fetch` + leitura do JSON sem lançar. `credentials: 'include'` por padrão;
 * o corpo JSON de uma resposta de erro é mantido em `corpo`.
 */
export async function buscarJson(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<RespostaDoTransporte> {
  let resposta: Response;
  try {
    resposta = await fetch(input, { credentials: 'include', ...init });
  } catch (erro) {
    return {
      ok: false,
      status: null,
      corpo: null,
      falha: mensagemDaFalha(erro),
    };
  }

  const tipo = resposta.headers.get('content-type') ?? '';
  let corpo: unknown = null;
  if (resposta.status !== 204) {
    if (!tipo.includes('application/json')) {
      return {
        ok: false,
        status: resposta.status,
        corpo: null,
        falha: {
          message: `O servidor respondeu de um jeito inesperado (HTTP ${resposta.status}). Tente de novo em instantes.`,
          status: resposta.status,
          motivo: 'resposta-invalida',
        },
      };
    }
    try {
      corpo = await resposta.json();
    } catch (erro) {
      const falha = mensagemDaFalha(erro);
      return {
        ok: false,
        status: resposta.status,
        corpo: null,
        falha:
          falha.motivo === 'cancelada'
            ? falha
            : {
                message: `A resposta do servidor veio incompleta (HTTP ${resposta.status}).`,
                status: resposta.status,
                motivo: 'resposta-invalida',
              },
      };
    }
  }

  if (!resposta.ok) {
    return {
      ok: false,
      status: resposta.status,
      corpo,
      falha: {
        message:
          mensagemDoCorpo(corpo) ??
          `O servidor recusou o pedido (HTTP ${resposta.status}).`,
        status: resposta.status,
        motivo: 'http',
      },
    };
  }
  return { ok: true, status: resposta.status, corpo };
}
