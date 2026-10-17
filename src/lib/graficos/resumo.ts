/**
 * Resumo em texto de séries de gráfico (tarefa 57), para a alternativa
 * acessível dos gráficos (`ChartFigure`): o leitor de tela recebe os mesmos
 * números que o gráfico mostra.
 */

const NUMERO = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export interface SerieDoResumo {
  nome: string;
  valores: ReadonlyArray<number | null>;
  /** Unidade depois do número ("ms", "kg", "/100"). */
  unidade?: string;
}

function comUnidade(valor: number, unidade?: string) {
  const texto = NUMERO.format(valor);
  if (!unidade) return texto;
  return unidade.startsWith('/') ? `${texto}${unidade}` : `${texto} ${unidade}`;
}

/** "ICQ: de 52/100 a 71/100, último 66/100; 2 de 7 dias sem dado." */
export function resumoDaSerie(serie: SerieDoResumo) {
  const medidos = serie.valores.filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v)
  );
  if (medidos.length === 0) {
    return `${serie.nome}: sem dados no período.`;
  }
  const minimo = Math.min(...medidos);
  const maximo = Math.max(...medidos);
  const ultimo = medidos[medidos.length - 1];
  const faltam = serie.valores.length - medidos.length;
  const faixa =
    minimo === maximo
      ? comUnidade(minimo, serie.unidade)
      : `de ${comUnidade(minimo, serie.unidade)} a ${comUnidade(maximo, serie.unidade)}`;
  const lacunas =
    faltam > 0 ? `; ${faltam} de ${serie.valores.length} dias sem dado` : '';
  return `${serie.nome}: ${faixa}, último ${comUnidade(ultimo, serie.unidade)}${lacunas}.`;
}

/** Junta o título do gráfico e o resumo de cada série. */
export function resumoDoGrafico(
  titulo: string,
  series: ReadonlyArray<SerieDoResumo>
) {
  return [`${titulo}.`, ...series.map(resumoDaSerie)].join(' ');
}
