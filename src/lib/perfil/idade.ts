import { differenceInYears, parseISO } from 'date-fns';

/**
 * Idade de hoje (tarefa 58). A data de nascimento tem prioridade: a coluna
 * `age` é gravada no dia do cadastro e fica defasada a cada aniversário, o
 * que deixava errado o limite de frequência cardíaca (90% da FC máxima).
 * Sem data de nascimento, vale a idade informada; sem as duas, `null`.
 */
export function idadeAtual(
  dataDeNascimento: string | null,
  idadeInformada: number | null,
  hoje: Date = new Date()
): number | null {
  if (dataDeNascimento) {
    const data = parseISO(dataDeNascimento.slice(0, 10));
    if (!Number.isNaN(data.getTime())) {
      const idade = differenceInYears(hoje, data);
      if (idade >= 0 && idade <= 130) return idade;
    }
  }
  return typeof idadeInformada === 'number' && idadeInformada > 0
    ? idadeInformada
    : null;
}
