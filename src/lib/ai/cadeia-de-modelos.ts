import {
  ErroDoProvedor,
  gerarTextoDetalhado,
  type ConexaoDeIa,
  type PedidoDeTexto,
} from './cliente-de-ia';
import {
  conexaoDoModelo,
  type ConfiguracaoDeIa,
  nomeDoProvedor,
  provedorEhLocal,
} from './provedores-da-plataforma';

/**
 * Cadeia de modelos de IA (tarefa 54): a ordem de uso escolhida pelo
 * administrador, com troca automática. O modelo da vez gera a resposta; se
 * ele falha (erro do provedor, tempo esgotado, cota ou tokens acabando, ou
 * uma resposta que não passa na conferência de quem pediu), o seguinte
 * recebe o mesmo pedido. Se a resposta foi cortada no limite de tokens, o
 * seguinte continua o texto de onde ela parou. A pessoa recebe uma resposta
 * só, sem perceber a troca. O motor da Lyra encerra a cadeia: a partir dele,
 * quem responde é o motor determinístico (o chamador usa o texto do motor).
 */

export interface AutorDoModelo {
  provedor: string;
  modelo: string;
  local: boolean;
}

export type EloDaCadeia =
  | { tipo: 'lyra' }
  | { tipo: 'modelo'; conexao: ConexaoDeIa; autor: AutorDoModelo };

export interface TentativaNaCadeia {
  provedor: string;
  modelo: string;
  resultado: 'ok' | 'cortado' | 'falhou' | 'recusado';
  motivo?: string;
  milissegundos: number;
}

export type ResultadoDaCadeia =
  | {
      origem: 'modelo';
      texto: string;
      /** Modelo que terminou a resposta. */
      autor: AutorDoModelo;
      /** Modelos que escreveram partes da resposta (continuação). */
      autores: AutorDoModelo[];
      tentativas: TentativaNaCadeia[];
    }
  | { origem: 'lyra'; tentativas: TentativaNaCadeia[] };

/**
 * Elos utilizáveis, na ordem gravada. Um modelo de provedor incompleto (sem
 * URL ou sem a chave exigida) é pulado; o motor da Lyra sempre fecha a
 * cadeia, mesmo quando não está na ordem.
 */
export function montarCadeia(configuracao: ConfiguracaoDeIa): EloDaCadeia[] {
  const porPreset = new Map(configuracao.provedores.map((p) => [p.preset, p]));
  const cadeia: EloDaCadeia[] = [];
  for (const elo of configuracao.ordem) {
    if (elo.tipo === 'lyra') {
      cadeia.push({ tipo: 'lyra' });
      return cadeia;
    }
    const provedor = porPreset.get(elo.preset);
    const conexao = provedor ? conexaoDoModelo(provedor, elo.modelo) : null;
    if (!provedor || !conexao) continue;
    cadeia.push({
      tipo: 'modelo',
      conexao,
      autor: {
        provedor: nomeDoProvedor(provedor.preset),
        modelo: elo.modelo,
        local: provedorEhLocal(provedor),
      },
    });
  }
  cadeia.push({ tipo: 'lyra' });
  return cadeia;
}

/** Há ao menos um modelo antes do motor da Lyra. */
export function cadeiaTemModelo(cadeia: EloDaCadeia[]) {
  return cadeia[0]?.tipo === 'modelo';
}

/**
 * Só os modelos que rodam na infraestrutura da Lyra (o chat leva métricas de
 * saúde, que não saem do servidor).
 */
export function somenteLocais(cadeia: EloDaCadeia[]): EloDaCadeia[] {
  return cadeia.filter((elo) => elo.tipo === 'lyra' || elo.autor.local);
}

/** Identifica a ordem em uso (sem chaves) para refazer o dia quando muda. */
export function assinaturaDaCadeia(
  cadeia: EloDaCadeia[],
  atualizadoEm: string
) {
  if (!cadeiaTemModelo(cadeia)) return 'lyra_local';
  return [
    ...cadeia.map((elo) =>
      elo.tipo === 'lyra'
        ? 'lyra'
        : `${elo.conexao.tipo}:${elo.conexao.baseUrl ?? ''}:${elo.conexao.modelo}`
    ),
    atualizadoEm,
  ].join('|');
}

/**
 * Pedido para o próximo modelo continuar uma resposta cortada: o mesmo
 * pedido, o trecho já escrito e a instrução de seguir sem repetir. Sem
 * formato estruturado: o modelo escreve só a continuação do texto.
 */
export function pedidoDeContinuacao(
  pedido: PedidoDeTexto,
  parcial: string
): PedidoDeTexto {
  return {
    sistema: pedido.sistema,
    usuario: `${pedido.usuario}

A resposta abaixo foi interrompida no meio. Continue exatamente do ponto em que ela parou: escreva só o restante, sem repetir nada do que já foi escrito, sem comentários e mantendo o mesmo formato.

Resposta até aqui:
${parcial}`,
    maximoDeTokens: pedido.maximoDeTokens,
  };
}

/** Junta o trecho anterior e a continuação, sem repetir a emenda. */
export function juntarContinuacao(parcial: string, continuacao: string) {
  const resto = continuacao.trimStart();
  // Modelos às vezes recomeçam repetindo o fim do trecho anterior. A emenda
  // só é retirada quando são palavras inteiras (ao menos duas, ou 12
  // caracteres), para não cortar uma letra que coincide por acaso.
  for (
    let tamanho = Math.min(parcial.length, resto.length, 200);
    tamanho >= 4;
    tamanho -= 1
  ) {
    const emenda = resto.slice(0, tamanho);
    if (!parcial.endsWith(emenda)) continue;
    const antes = parcial.charAt(parcial.length - tamanho - 1);
    const depois = resto.charAt(tamanho);
    const palavrasInteiras =
      (antes === '' || /\s/.test(antes)) &&
      (depois === '' || /[\s.,;:!?]/.test(depois));
    if (palavrasInteiras && (/\s/.test(emenda.trim()) || tamanho >= 12)) {
      return parcial + resto.slice(tamanho);
    }
  }
  // Fora de fronteira de palavra (ex.: no meio de um JSON), só uma emenda
  // longa, que não coincide por acaso.
  for (
    let tamanho = Math.min(parcial.length, resto.length, 200);
    tamanho >= 12;
    tamanho -= 1
  ) {
    if (parcial.endsWith(resto.slice(0, tamanho))) {
      return parcial + resto.slice(tamanho);
    }
  }
  const precisaEspaco =
    /[\p{L}\p{N}.,;:!?]$/u.test(parcial) && /^[\p{L}\p{N}]/u.test(resto);
  return `${parcial}${precisaEspaco ? ' ' : ''}${resto}`;
}

export async function gerarNaCadeia(
  cadeia: EloDaCadeia[],
  pedido: PedidoDeTexto,
  opcoes: {
    /** Confere a resposta completa; devolve o motivo da recusa ou `null`. */
    validar?: (texto: string) => string | null;
    buscar?: typeof fetch;
    /** Nome da função que chamou, para o log de trocas. */
    rotulo?: string;
  } = {}
): Promise<ResultadoDaCadeia> {
  const tentativas: TentativaNaCadeia[] = [];
  let parcial = '';
  let autoresDaParcial: AutorDoModelo[] = [];

  for (const elo of cadeia) {
    if (elo.tipo === 'lyra') break;
    const inicio = Date.now();
    const pedidoDaVez = parcial ? pedidoDeContinuacao(pedido, parcial) : pedido;
    try {
      const gerado = await gerarTextoDetalhado(
        elo.conexao,
        pedidoDaVez,
        opcoes.buscar
      );
      const texto = parcial
        ? juntarContinuacao(parcial, gerado.texto)
        : gerado.texto;
      const milissegundos = Date.now() - inicio;
      if (gerado.cortado) {
        tentativas.push({
          provedor: elo.autor.provedor,
          modelo: elo.autor.modelo,
          resultado: 'cortado',
          motivo: 'limite de tokens da resposta',
          milissegundos,
        });
        parcial = texto;
        autoresDaParcial = [...autoresDaParcial, elo.autor];
        continue;
      }
      const recusa = opcoes.validar?.(texto) ?? null;
      if (recusa) {
        tentativas.push({
          provedor: elo.autor.provedor,
          modelo: elo.autor.modelo,
          resultado: 'recusado',
          motivo: recusa,
          milissegundos,
        });
        // Resposta completa e recusada: o próximo começa do zero.
        parcial = '';
        autoresDaParcial = [];
        continue;
      }
      tentativas.push({
        provedor: elo.autor.provedor,
        modelo: elo.autor.modelo,
        resultado: 'ok',
        milissegundos,
      });
      registrarTrocas(opcoes.rotulo, tentativas);
      return {
        origem: 'modelo',
        texto,
        autor: elo.autor,
        autores: [...autoresDaParcial, elo.autor],
        tentativas,
      };
    } catch (erro) {
      tentativas.push({
        provedor: elo.autor.provedor,
        modelo: elo.autor.modelo,
        resultado: 'falhou',
        motivo:
          erro instanceof ErroDoProvedor
            ? erro.message
            : erro instanceof Error
              ? erro.name
              : 'falha desconhecida',
        milissegundos: Date.now() - inicio,
      });
      // Falha no meio de uma continuação: o próximo continua o mesmo trecho.
    }
  }

  registrarTrocas(opcoes.rotulo, tentativas);
  return { origem: 'lyra', tentativas };
}

/** Log das trocas (sem pedido nem resposta, que podem ter dados pessoais). */
function registrarTrocas(
  rotulo: string | undefined,
  tentativas: TentativaNaCadeia[]
) {
  const trocas = tentativas.filter((t) => t.resultado !== 'ok');
  if (trocas.length === 0) return;
  console.warn(
    `[ia:cadeia${rotulo ? `:${rotulo}` : ''}] ${trocas
      .map(
        (t) =>
          `${t.provedor} · ${t.modelo}: ${t.resultado}${t.motivo ? ` (${t.motivo})` : ''}`
      )
      .join('; ')}`
  );
}
