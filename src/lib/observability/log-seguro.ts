/**
 * Registro de erros internos sem dados pessoais ou de saúde.
 *
 * Os erros do mysql2 carregam a propriedade `sql` com a consulta já
 * interpolada (o `queryRows` usa `query`, que formata os valores no cliente),
 * e algumas mensagens do MySQL repetem o valor recusado. Registrar o objeto
 * inteiro com `console.error(error)` gravava no log e-mails, métricas de
 * saúde, respostas de avaliações e textos do usuário. Aqui o log leva só o
 * que é necessário para diagnosticar: tipo, código e pilha de chamadas.
 */

interface ErroMysql {
  code?: unknown;
  errno?: unknown;
  sqlState?: unknown;
}

function ehErroMysql(error: Error): error is Error & ErroMysql {
  return 'sqlState' in error || 'sqlMessage' in error || 'sql' in error;
}

/** Pilha de chamadas sem a primeira linha (que repete a mensagem). */
function framesDaPilha(error: Error): string | undefined {
  return error.stack
    ?.split('\n')
    .filter((linha) => linha.trimStart().startsWith('at '))
    .join('\n');
}

export function resumoDeErro(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return { tipo: typeof error };
  }
  if (ehErroMysql(error)) {
    return {
      nome: error.name,
      mensagem: `Erro do MySQL ${String(error.code ?? 'desconhecido')}`,
      codigo: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      pilha: framesDaPilha(error),
    };
  }
  return {
    nome: error.name,
    mensagem: error.message,
    ...('code' in error ? { codigo: error.code } : {}),
    pilha: framesDaPilha(error),
  };
}

export function registrarErroInterno(contexto: string, error: unknown) {
  console.error(`[${contexto}]`, resumoDeErro(error));
}
