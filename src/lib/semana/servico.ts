import { LocalSemNascerDoSolError } from '@/lib/astrology/panchang';
import {
  diaVedicoDoPerfil,
  lerPerfilAstrologico,
  mapaDoPerfil,
} from '@/lib/astrology/perfil-astrologico';
import { dataLocal } from '@/lib/astrology/tempo';
import {
  diasAntes,
  ehChaveDaMetrica,
  METRICAS_DAS_METAS,
} from '@/lib/metas/catalogo';
import { queryRows } from '@/lib/mysql/pool';
import { lerReflexoes } from '@/lib/reflexao/servico';

import {
  avaliarMetas,
  perceber,
  resumir,
  type DiaDaSemana,
  type MetaDaSemana,
  type Percepcao,
  type ResultadoDaMeta,
  type Resumo,
} from './analise';

/**
 * Retrospectiva "Sua semana" (tarefa 44): os últimos 7 dias locais da pessoa
 * (hoje e os 6 anteriores) com prontidão, sono, meditação, respiração,
 * reflexão da noite, metas automáticas e o Tara Bala de cada dia, mais a
 * semana anterior só para a variação. Tudo vem do banco e do mapa natal.
 */

export interface SemanaDaPessoa {
  inicio: string;
  fim: string;
  /** Cidade do dia (null sem cidade: datas no dia UTC). */
  lugar: string | null;
  /** O Tara depende do mapa natal (data e cidade de nascimento). */
  temMapa: boolean;
  dias: DiaDaSemana[];
  resumo: Resumo;
  metas: ResultadoDaMeta[];
  percepcoes: Percepcao[];
}

interface LinhaDaMetrica {
  date: string;
  [coluna: string]: string | number | null;
}

const COLUNAS_FIXAS = [
  'readiness_score',
  'sleep_duration_minutes',
  'meditation_minutes',
] as const;

const NOME_DO_DIA = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  timeZone: 'UTC',
});

function nomeDoDia(data: string) {
  return NOME_DO_DIA.format(new Date(`${data}T12:00:00Z`)).replace('.', '');
}

function numero(valor: unknown) {
  if (valor === null || valor === undefined) return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

async function metasDiarias(userId: string): Promise<MetaDaSemana[]> {
  const linhas = await queryRows<{
    title: string;
    target_value: number | string | null;
    metric_key: string | null;
    metric_direction: string | null;
  }>(
    `SELECT title, target_value, metric_key, metric_direction
       FROM goals
      WHERE user_id = ? AND metric_key IS NOT NULL
      ORDER BY created_at ASC`,
    [userId]
  );
  const metas: MetaDaSemana[] = [];
  for (const linha of linhas) {
    if (!ehChaveDaMetrica(linha.metric_key)) continue;
    const metrica = METRICAS_DAS_METAS[linha.metric_key];
    // Peso não é uma meta do dia (vale o registro mais recente).
    if (metrica.modo !== 'media7') continue;
    const alvo = numero(linha.target_value);
    if (alvo === null) continue;
    metas.push({
      titulo: linha.title,
      coluna: metrica.coluna,
      alvo,
      escala: metrica.escala,
      direcao: linha.metric_direction === 'down' ? 'down' : 'up',
    });
  }
  return metas;
}

export async function lerSemana(
  userId: string,
  agora = new Date()
): Promise<SemanaDaPessoa> {
  const perfil = await lerPerfilAstrologico(userId);
  const lugar = perfil.localDoDia;
  const hoje = dataLocal(agora, lugar?.fuso ?? 'UTC');
  const inicio = diasAntes(hoje, 6);
  const inicioAnterior = diasAntes(hoje, 13);
  const datas = Array.from({ length: 7 }, (_, i) => diasAntes(hoje, 6 - i));
  const datasAnteriores = Array.from({ length: 7 }, (_, i) =>
    diasAntes(hoje, 13 - i)
  );

  const metas = await metasDiarias(userId);
  const colunas = [
    ...new Set<string>([...COLUNAS_FIXAS, ...metas.map((m) => m.coluna)]),
  ];
  const linhas = await queryRows<LinhaDaMetrica>(
    `SELECT date, ${colunas.join(', ')}
       FROM daily_metrics
      WHERE user_id = ? AND date BETWEEN ? AND ?`,
    [userId, inicioAnterior, hoje]
  );
  const porData = new Map(linhas.map((l) => [String(l.date), l]));

  const reflexoes = new Map(
    (await lerReflexoes(userId, inicio, hoje)).map((r) => [r.data, r])
  );
  const respiracao = new Map(
    (
      await queryRows<{ session_date: string; minutos: number | string }>(
        `SELECT session_date, SUM(minutes_logged) AS minutos
           FROM breathing_sessions
          WHERE user_id = ? AND session_date BETWEEN ? AND ?
          GROUP BY session_date`,
        [userId, inicio, hoje]
      )
    ).map((l) => [String(l.session_date), Number(l.minutos)])
  );

  const mapa = mapaDoPerfil(perfil, agora);
  const taraDe = (data: string): DiaDaSemana['tara'] => {
    if (!lugar || !mapa) return null;
    try {
      const pessoal = diaVedicoDoPerfil(perfil, mapa, data)?.pessoal;
      return pessoal
        ? { nome: pessoal.tara.nome, qualidade: pessoal.tara.qualidade }
        : null;
    } catch (error) {
      if (error instanceof LocalSemNascerDoSolError) return null;
      throw error;
    }
  };

  const montarDia = (data: string, comCeu: boolean): DiaDaSemana => {
    const linha = porData.get(data);
    const reflexao = reflexoes.get(data);
    return {
      data,
      diaDaSemana: nomeDoDia(data),
      prontidao: numero(linha?.readiness_score),
      sonoMinutos: numero(linha?.sleep_duration_minutes),
      meditacaoMinutos: numero(linha?.meditation_minutes),
      respiracaoMinutos: comCeu ? (respiracao.get(data) ?? 0) : 0,
      reflexao:
        comCeu && reflexao
          ? {
              emocional: reflexao.emocional,
              corpo: reflexao.corpo,
              espiritual: reflexao.espiritual,
              frase: reflexao.frase,
            }
          : null,
      tara: comCeu ? taraDe(data) : null,
      metricas: Object.fromEntries(
        metas.map((m) => [m.coluna, numero(linha?.[m.coluna])])
      ),
    };
  };

  const dias = datas.map((data) => montarDia(data, true));
  const anteriores = datasAnteriores.map((data) => montarDia(data, false));

  return {
    inicio,
    fim: hoje,
    lugar: lugar?.rotulo ?? null,
    temMapa: Boolean(lugar && mapa),
    dias,
    resumo: resumir(dias, anteriores),
    metas: avaliarMetas(dias, metas),
    percepcoes: perceber(dias),
  };
}
