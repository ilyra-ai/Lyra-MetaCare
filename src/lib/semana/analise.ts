import type { Qualidade } from '@/lib/astrology/panchang';

/**
 * Retrospectiva "Sua semana" (tarefa 44): resumo dos últimos 7 dias, metas
 * dia a dia e percepções. Módulo puro: recebe os registros reais da pessoa e
 * só afirma uma relação quando os próprios registros a sustentam (mínimo de
 * dias em cada grupo e diferença relevante), sempre dizendo em quantos dias
 * ela se baseia. É um retrato da semana, não uma conclusão estatística.
 */

export interface DiaDaSemana {
  data: string;
  /** "seg", "ter"... */
  diaDaSemana: string;
  prontidao: number | null;
  sonoMinutos: number | null;
  meditacaoMinutos: number | null;
  respiracaoMinutos: number;
  reflexao: {
    emocional: number;
    corpo: number;
    espiritual: number;
    frase: string | null;
  } | null;
  /**
   * Tom do dia para a pessoa pelo mapa (Tara Bala): `tema` em linguagem
   * simples ("resistências"); `nome` é o tradicional.
   */
  tara: { nome: string; tema: string; qualidade: Qualidade } | null;
  /** Valores das métricas das metas (unidade da coluna). */
  metricas: Record<string, number | null>;
}

export interface MetaDaSemana {
  titulo: string;
  coluna: string;
  /** Alvo na unidade da meta. */
  alvo: number;
  /** Converte o valor da coluna para a unidade da meta. */
  escala: number;
  direcao: 'up' | 'down';
}

export interface ResultadoDaMeta {
  titulo: string;
  diasCumpridos: number;
  diasComRegistro: number;
}

export interface Percepcao {
  texto: string;
  /** De onde vem (para o "Por quê?"). */
  base: string;
}

export interface Resumo {
  diasComRegistro: number;
  prontidaoMedia: number | null;
  /** Diferença para a semana anterior, só com dados nas duas. */
  prontidaoVariacao: number | null;
  sonoMedioMinutos: number | null;
  sonoVariacaoMinutos: number | null;
  respiracaoMinutos: number;
  reflexoes: number;
  mediasDaReflexao: {
    emocional: number;
    corpo: number;
    espiritual: number;
  } | null;
}

/** Mínimo de dias em cada grupo para comparar dois grupos de dias. */
export const MINIMO_POR_GRUPO = 2;
/** Diferença mínima de prontidão (pontos) para valer uma percepção. */
export const DIFERENCA_DE_PRONTIDAO = 5;
/** Diferença mínima na reflexão (escala de 1 a 5). */
export const DIFERENCA_DE_REFLEXAO = 0.5;
/** Sono considerado "noite boa" (7 h). */
export const SONO_DE_REFERENCIA = 7 * 60;

function media(valores: number[]) {
  if (valores.length === 0) return null;
  return valores.reduce((soma, v) => soma + v, 0) / valores.length;
}

function arredondar(valor: number | null, casas = 0) {
  if (valor === null) return null;
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}

function numeros(valores: Array<number | null>) {
  return valores.filter((v): v is number => v !== null);
}

/**
 * Minutos de prática do dia. A respiração guiada já é somada ao
 * `meditation_minutes` do dia ao ser registrada (e o check-in informa o total
 * de meditação e respiração), então esse campo é o total; os minutos de
 * respiração só valem sozinhos se o dia não tiver o campo preenchido.
 */
export function praticaDoDia(
  dia: Pick<DiaDaSemana, 'meditacaoMinutos' | 'respiracaoMinutos'>
) {
  return dia.meditacaoMinutos ?? dia.respiracaoMinutos;
}

function temRegistro(dia: DiaDaSemana) {
  return (
    dia.prontidao !== null ||
    dia.sonoMinutos !== null ||
    dia.meditacaoMinutos !== null ||
    dia.respiracaoMinutos > 0 ||
    dia.reflexao !== null ||
    Object.values(dia.metricas).some((v) => v !== null)
  );
}

export function formatarSono(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

function dias(n: number) {
  return `${n} ${n === 1 ? 'dia' : 'dias'}`;
}

export function resumir(
  semana: DiaDaSemana[],
  anterior: DiaDaSemana[]
): Resumo {
  const prontidoes = numeros(semana.map((d) => d.prontidao));
  const prontidoesAntes = numeros(anterior.map((d) => d.prontidao));
  const sonos = numeros(semana.map((d) => d.sonoMinutos));
  const sonosAntes = numeros(anterior.map((d) => d.sonoMinutos));
  const prontidaoMedia = media(prontidoes);
  const sonoMedio = media(sonos);
  const reflexoes = semana.flatMap((d) => (d.reflexao ? [d.reflexao] : []));
  const comparavel = (agora: number[], antes: number[]) =>
    agora.length >= MINIMO_POR_GRUPO && antes.length >= MINIMO_POR_GRUPO;
  return {
    diasComRegistro: semana.filter(temRegistro).length,
    prontidaoMedia: arredondar(prontidaoMedia),
    prontidaoVariacao: comparavel(prontidoes, prontidoesAntes)
      ? arredondar((prontidaoMedia ?? 0) - (media(prontidoesAntes) ?? 0))
      : null,
    sonoMedioMinutos: arredondar(sonoMedio),
    sonoVariacaoMinutos: comparavel(sonos, sonosAntes)
      ? arredondar((sonoMedio ?? 0) - (media(sonosAntes) ?? 0))
      : null,
    respiracaoMinutos: semana.reduce((s, d) => s + d.respiracaoMinutos, 0),
    reflexoes: reflexoes.length,
    mediasDaReflexao:
      reflexoes.length > 0
        ? {
            emocional: arredondar(media(reflexoes.map((r) => r.emocional)), 1)!,
            corpo: arredondar(media(reflexoes.map((r) => r.corpo)), 1)!,
            espiritual: arredondar(
              media(reflexoes.map((r) => r.espiritual)),
              1
            )!,
          }
        : null,
  };
}

export function avaliarMetas(
  semana: DiaDaSemana[],
  metas: MetaDaSemana[]
): ResultadoDaMeta[] {
  return metas.map((meta) => {
    let diasComRegistro = 0;
    let diasCumpridos = 0;
    for (const dia of semana) {
      const bruto = dia.metricas[meta.coluna];
      if (bruto === null || bruto === undefined) continue;
      diasComRegistro += 1;
      const valor = bruto * meta.escala;
      const cumpriu =
        meta.direcao === 'up' ? valor >= meta.alvo : valor <= meta.alvo;
      if (cumpriu) diasCumpridos += 1;
    }
    return { titulo: meta.titulo, diasCumpridos, diasComRegistro };
  });
}

/** Compara a média de `valor` entre os dias que atendem e os que não atendem `criterio`. */
function compararGrupos(
  semana: DiaDaSemana[],
  criterio: (dia: DiaDaSemana) => boolean | null,
  valor: (dia: DiaDaSemana) => number | null
) {
  const sim: number[] = [];
  const nao: number[] = [];
  for (const dia of semana) {
    const v = valor(dia);
    const c = criterio(dia);
    if (v === null || c === null) continue;
    (c ? sim : nao).push(v);
  }
  if (sim.length < MINIMO_POR_GRUPO || nao.length < MINIMO_POR_GRUPO) {
    return null;
  }
  return {
    sim: media(sim)!,
    nao: media(nao)!,
    nSim: sim.length,
    nNao: nao.length,
  };
}

export function perceber(semana: DiaDaSemana[]): Percepcao[] {
  const percepcoes: Percepcao[] = [];

  const tara = compararGrupos(
    semana,
    (d) => (d.tara ? d.tara.qualidade === 'favoravel' : null),
    (d) => d.prontidao
  );
  if (tara && Math.abs(tara.sim - tara.nao) >= DIFERENCA_DE_PRONTIDAO) {
    const melhor = tara.sim > tara.nao;
    percepcoes.push({
      texto: melhor
        ? `Nos dias de Tara favorável (★), a sua prontidão média foi ${Math.round(tara.sim)}, contra ${Math.round(tara.nao)} nos demais.`
        : `Nesta semana, a prontidão foi menor nos dias de Tara favorável (★): ${Math.round(tara.sim)}, contra ${Math.round(tara.nao)} nos demais. O céu favorável não compensou o descanso.`,
      base: `${dias(tara.nSim)} de Tara favorável e ${dias(tara.nNao)} sem, todos com prontidão registrada.`,
    });
  }

  const sono = compararGrupos(
    semana,
    (d) =>
      d.sonoMinutos === null ? null : d.sonoMinutos >= SONO_DE_REFERENCIA,
    (d) => d.prontidao
  );
  if (sono && Math.abs(sono.sim - sono.nao) >= DIFERENCA_DE_PRONTIDAO) {
    percepcoes.push({
      texto:
        sono.sim > sono.nao
          ? `Depois de noites com 7 h ou mais de sono, a sua prontidão média foi ${Math.round(sono.sim)}; depois de noites mais curtas, ${Math.round(sono.nao)}.`
          : `Nesta semana, as noites com 7 h ou mais de sono não vieram com prontidão maior (${Math.round(sono.sim)} contra ${Math.round(sono.nao)}): vale olhar estresse e treino.`,
      base: `${dias(sono.nSim)} com 7 h ou mais e ${dias(sono.nNao)} com menos, todos com prontidão registrada.`,
    });
  }

  const pratica = compararGrupos(
    semana,
    (d) => (d.reflexao === null ? null : praticaDoDia(d) > 0),
    (d) => d.reflexao?.emocional ?? null
  );
  if (pratica && Math.abs(pratica.sim - pratica.nao) >= DIFERENCA_DE_REFLEXAO) {
    const formatar = (v: number) => v.toFixed(1).replace('.', ',');
    percepcoes.push({
      texto:
        pratica.sim > pratica.nao
          ? `Nos dias com meditação ou respiração, a sua nota emocional na reflexão foi ${formatar(pratica.sim)}, contra ${formatar(pratica.nao)} nos dias sem prática.`
          : `Nesta semana, os dias com meditação ou respiração tiveram nota emocional menor (${formatar(pratica.sim)} contra ${formatar(pratica.nao)}): talvez você tenha praticado justamente nos dias difíceis.`,
      base: `${dias(pratica.nSim)} com prática e ${dias(pratica.nNao)} sem, todos com reflexão da noite.`,
    });
  }

  return percepcoes;
}
