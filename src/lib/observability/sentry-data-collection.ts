import type * as Sentry from '@sentry/nextjs';

// O tipo DataCollection vive em @sentry/core, que não é dependência direta do
// projeto; ele é derivado aqui das opções aceitas pelo Sentry.init do SDK
// efetivamente instalado (@sentry/nextjs).
type DataCollection = NonNullable<
  NonNullable<Parameters<typeof Sentry.init>[0]>['dataCollection']
>;

/**
 * Política de coleta de dados do Sentry para o Lyra MetaCare.
 *
 * A plataforma manipula dados de saúde e de perfil (sinais vitais, ciclo,
 * avaliações, conversas com a IA). O padrão do Sentry 11 coleta usuário,
 * cookies, cabeçalhos, corpos HTTP, parâmetros de URL, dados de consultas ao
 * banco, entradas/saídas de IA e variáveis locais de stack frames. Aqui tudo
 * isso é desativado: os eventos levam apenas a mensagem, o stack trace e os
 * metadados estruturais necessários para diagnosticar a falha.
 */
export const sentryDataCollection: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
  graphQL: {
    document: false,
    variables: false,
  },
  genAI: {
    inputs: false,
    outputs: false,
  },
  databaseQueryData: false,
  queues: false,
  stackFrameVariables: false,
};
