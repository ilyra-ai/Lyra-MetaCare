import type { Prontidao } from './tipos';

/**
 * Prontidão do dia (0 a 100) a partir dos sinais reais registrados hoje,
 * comparados à linha de base pessoal dos dias anteriores quando ela existe.
 *
 * Diferente do escore geral do painel, aqui a ausência de dado NÃO vira um
 * valor neutro: cada componente só entra se foi medido, os pesos são
 * renormalizados pelos componentes presentes e, com menos de dois
 * componentes medidos no dia, a prontidão fica `null`.
 */

export interface SinaisDaProntidao {
  sleep_duration_minutes: number | null;
  hrv_ms: number | null;
  resting_heart_rate: number | null;
  energy_level: number | null;
  mood_score: number | null;
  stress_score: number | null;
}

interface Componente {
  chave: keyof SinaisDaProntidao;
  peso: number;
  nota: number;
  detalhe: string;
}

const PESOS: Record<keyof SinaisDaProntidao, number> = {
  sleep_duration_minutes: 0.3,
  hrv_ms: 0.25,
  resting_heart_rate: 0.15,
  energy_level: 0.12,
  stress_score: 0.1,
  mood_score: 0.08,
};

/** Dias de histórico necessários para comparar com a linha de base. */
export const DIAS_PARA_LINHA_DE_BASE = 3;

function limitar(valor: number, minimo = 0, maximo = 100) {
  return Math.max(minimo, Math.min(maximo, valor));
}

/** Interpolação linear por pontos (x crescente), saturando nas pontas. */
function interpolar(x: number, pontos: ReadonlyArray<[number, number]>) {
  if (x <= pontos[0][0]) return pontos[0][1];
  for (let i = 1; i < pontos.length; i++) {
    const [x1, y1] = pontos[i];
    if (x <= x1) {
      const [x0, y0] = pontos[i - 1];
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return pontos[pontos.length - 1][1];
}

function valido(valor: number | null | undefined): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function media(historico: SinaisDaProntidao[], chave: keyof SinaisDaProntidao) {
  const valores = historico
    .map((dia) => dia[chave])
    .filter((v): v is number => valido(v) && v > 0);
  if (valores.length < DIAS_PARA_LINHA_DE_BASE) return null;
  return valores.reduce((soma, v) => soma + v, 0) / valores.length;
}

export function formatarDuracao(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

export function rotuloDaProntidao(valor: number | null) {
  if (valor === null) return 'Sem dados suficientes hoje';
  if (valor >= 75) return 'Alta prontidão';
  if (valor >= 55) return 'Prontidão moderada';
  if (valor >= 40) return 'Vá com calma';
  return 'Dia de recuperação';
}

export function calcularProntidao(
  hoje: SinaisDaProntidao | null,
  historico: SinaisDaProntidao[]
): Prontidao {
  const componentes: Componente[] = [];
  if (!hoje) {
    return { valor: null, rotulo: rotuloDaProntidao(null), base: [] };
  }

  const sono = hoje.sleep_duration_minutes;
  if (valido(sono) && sono > 0) {
    componentes.push({
      chave: 'sleep_duration_minutes',
      peso: PESOS.sleep_duration_minutes,
      // 7 a 9 h é a faixa recomendada para adultos; abaixo de 4 h ou acima de
      // 11 h, a nota chega a zero.
      nota: interpolar(sono, [
        [240, 0],
        [420, 100],
        [540, 100],
        [660, 0],
      ]),
      detalhe: `Sono ${formatarDuracao(sono)}`,
    });
  }

  const vfc = hoje.hrv_ms;
  if (valido(vfc) && vfc > 0) {
    const base = media(historico, 'hrv_ms');
    componentes.push({
      chave: 'hrv_ms',
      peso: PESOS.hrv_ms,
      // Com linha de base: a VFC é muito individual, então vale a razão com
      // a média pessoal. Sem ela, faixa populacional de adultos.
      nota:
        base === null
          ? interpolar(vfc, [
              [15, 0],
              [45, 100],
              [90, 100],
              [120, 70],
            ])
          : interpolar(vfc / base, [
              [0.7, 15],
              [0.85, 50],
              [1, 85],
              [1.05, 100],
            ]),
      detalhe:
        base === null
          ? `VFC ${Math.round(vfc)} ms`
          : `VFC ${Math.round(vfc)} ms (sua média: ${Math.round(base)} ms)`,
    });
  }

  const fc = hoje.resting_heart_rate;
  if (valido(fc) && fc > 0) {
    const base = media(historico, 'resting_heart_rate');
    componentes.push({
      chave: 'resting_heart_rate',
      peso: PESOS.resting_heart_rate,
      nota:
        base === null
          ? interpolar(fc, [
              [62, 100],
              [95, 0],
            ])
          : interpolar(fc - base, [
              [-1, 100],
              [0, 85],
              [5, 50],
              [10, 15],
            ]),
      detalhe:
        base === null
          ? `FC de repouso ${Math.round(fc)} bpm`
          : `FC de repouso ${Math.round(fc)} bpm (sua média: ${Math.round(base)} bpm)`,
    });
  }

  if (valido(hoje.energy_level)) {
    componentes.push({
      chave: 'energy_level',
      peso: PESOS.energy_level,
      nota: limitar(((hoje.energy_level - 1) / 4) * 100),
      detalhe: `Energia ${hoje.energy_level}/5`,
    });
  }
  if (valido(hoje.stress_score)) {
    componentes.push({
      chave: 'stress_score',
      peso: PESOS.stress_score,
      nota: limitar(100 - hoje.stress_score),
      detalhe: `Estresse ${Math.round(hoje.stress_score)}/100`,
    });
  }
  if (valido(hoje.mood_score)) {
    componentes.push({
      chave: 'mood_score',
      peso: PESOS.mood_score,
      nota: limitar(((hoje.mood_score - 1) / 4) * 100),
      detalhe: `Humor ${Math.round(hoje.mood_score)}/5`,
    });
  }

  const base = componentes.map((c) => c.detalhe);
  if (componentes.length < 2) {
    return { valor: null, rotulo: rotuloDaProntidao(null), base };
  }
  const pesoTotal = componentes.reduce((soma, c) => soma + c.peso, 0);
  const valor = Math.round(
    componentes.reduce((soma, c) => soma + c.nota * c.peso, 0) / pesoTotal
  );
  return { valor, rotulo: rotuloDaProntidao(valor), base };
}
