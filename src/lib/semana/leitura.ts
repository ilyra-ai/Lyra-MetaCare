import type { MapaNatal } from '@/lib/astrology/mapa-natal';
import { LocalSemNascerDoSolError } from '@/lib/astrology/panchang';
import {
  diaVedicoDoPerfil,
  type PerfilAstrologico,
} from '@/lib/astrology/perfil-astrologico';
import { longitudeSideral, posicao } from '@/lib/astrology/sideral';
import { NAKSHATRA_INFO, NATUREZA } from '@/lib/coach/conhecimento';
import {
  transitoDeJupiter,
  transitoDeSaturno,
} from '@/lib/coach/leitura-conhecimento';
import { dashaSimples, faseDaVida } from '@/lib/coach/leitura-vedica';
import {
  AREA_DO_MAPA,
  CLIMA_DA_NATUREZA,
  diaDaLua,
  TEMA_DA_AREA,
} from '@/lib/coach/linguagem-simples';
import type { Qualidade } from '@/lib/coach/tipos';

/**
 * Leitura da semana pelo motor da Lyra (tarefa 50): o céu de cada dia para a
 * pessoa (tom do dia pelo mapa, área do mapa por onde a Lua passa, Lua do dia
 * e fases da Lua), um resumo da semana que passou, a semana que vem com os
 * melhores dias e os que pedem cuidado, a fase da vida e os trânsitos lentos.
 * Tudo calculado do mapa e do céu reais, em linguagem simples, sem depender
 * de registros nem de modelo de IA.
 */

export interface CeuDoDia {
  data: string;
  /** Signo da Lua ao nascer do sol. */
  luaEm: string;
  /** Clima da Lua em palavras simples ("de limpeza e corte"). */
  clima: string;
  favorece: string;
  /** "6º dia da Lua crescente", "Lua cheia". */
  diaDaLua: string;
  /** Só com mapa natal. */
  paraVoce: {
    tema: string;
    conselho: string;
    qualidade: Qualidade;
    /** Para o que o dia é bom pela área do mapa ("parcerias e acordos"). */
    area: string;
    /** Nome curto da área ("parcerias"). */
    areaCurta: string;
    /** A Lua no ponto mais sensível do mapa (cerca de 2,5 dias por mês). */
    pontoSensivel: boolean;
  } | null;
}

export interface LeituraDaSemana {
  /** O que falta para a leitura ficar completa (null quando nada falta). */
  faltando: string | null;
  temMapa: boolean;
  resumo: string;
  passados: CeuDoDia[];
  proxima: {
    resumo: string;
    dias: CeuDoDia[];
  };
  /** Fase da vida e trânsitos de Júpiter e Saturno (só com mapa). */
  fase: string | null;
  transitos: string[];
}

const NOME_DO_DIA = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  timeZone: 'UTC',
});

function nomeDoDia(data: string) {
  return NOME_DO_DIA.format(new Date(`${data}T12:00:00Z`));
}

/** "na segunda-feira", "no sábado". */
function naData(data: string) {
  const nome = nomeDoDia(data);
  return `${nome === 'sábado' || nome === 'domingo' ? 'no' : 'na'} ${nome}`;
}

function primeiraMaiuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "segunda-feira e quarta-feira" / "segunda, terça e quinta-feira". */
function listar(itens: string[]) {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`;
}

function casaContada(de: number, ate: number) {
  return ((ate - de + 12) % 12) + 1;
}

export function ceuDoDia(
  perfil: PerfilAstrologico,
  mapa: MapaNatal | null,
  data: string
): CeuDoDia | null {
  let dia;
  try {
    dia = diaVedicoDoPerfil(perfil, mapa, data);
  } catch (error) {
    // Latitudes extremas sem nascer do sol na data: sem céu para o dia.
    if (error instanceof LocalSemNascerDoSolError) return null;
    throw error;
  }
  if (!dia) return null;
  const { panchang, pessoal } = dia;
  const natureza = NAKSHATRA_INFO[panchang.nakshatra.indice].natureza;
  return {
    data,
    luaEm: panchang.signoDaLua.nome,
    clima: CLIMA_DA_NATUREZA[natureza].clima,
    favorece: NATUREZA[natureza].favorece,
    diaDaLua: diaDaLua(panchang.tithi.indice),
    paraVoce: pessoal
      ? {
          tema: pessoal.tara.tema,
          conselho: pessoal.tara.conselho,
          qualidade: pessoal.tara.qualidade,
          area: TEMA_DA_AREA[pessoal.chandra.casa - 1],
          areaCurta: AREA_DO_MAPA[pessoal.chandra.casa - 1],
          pontoSensivel: pessoal.chandra.chandrashtama,
        }
      : null,
  };
}

function diasComFaseDaLua(dias: CeuDoDia[]) {
  return dias
    .filter((d) => d.diaDaLua === 'Lua cheia' || d.diaDaLua === 'Lua nova')
    .map(
      (d) =>
        `${d.diaDaLua} ${naData(d.data)} (${d.diaDaLua === 'Lua cheia' ? 'emoções à flor da pele' : 'bom para novas intenções'})`
    );
}

function resumoDosPassados(dias: CeuDoDia[], temMapa: boolean) {
  if (dias.length === 0) return '';
  if (!temMapa) {
    const signos = [...new Set(dias.map((d) => d.luaEm))];
    const fases = diasComFaseDaLua(dias);
    return [
      `Nos últimos 7 dias, a Lua passou por ${listar(signos)}.`,
      fases.length ? `${primeiraMaiuscula(listar(fases))}.` : '',
      'Com a data e a cidade de nascimento no perfil, a leitura passa a falar do seu mapa.',
    ]
      .filter(Boolean)
      .join(' ');
  }
  // O ponto sensível do mapa vale como cuidado mesmo num dia de tom bom.
  const cuidado = dias.filter(
    (d) => d.paraVoce?.qualidade === 'desfavoravel' || d.paraVoce?.pontoSensivel
  );
  const favoraveis = dias.filter(
    (d) => d.paraVoce?.qualidade === 'favoravel' && !d.paraVoce.pontoSensivel
  );
  const neutros = dias.length - favoraveis.length - cuidado.length;
  const contagem = `Pelo seu mapa, a semana que passou teve ${favoraveis.length} ${favoraveis.length === 1 ? 'dia a seu favor' : 'dias a seu favor'}, ${neutros} ${neutros === 1 ? 'neutro' : 'neutros'} e ${cuidado.length} pedindo cuidado.`;
  const melhores = favoraveis.length
    ? `Os melhores foram ${listar(favoraveis.map((d) => `${nomeDoDia(d.data)} (${d.paraVoce?.tema})`))}.`
    : '';
  const areas = [
    ...new Set(
      dias
        .map((d) => d.paraVoce?.areaCurta)
        .filter((a): a is string => Boolean(a) && a !== 'prudência')
    ),
  ];
  const caminho = areas.length
    ? `A Lua passou pelas áreas do seu mapa ligadas a ${listar(areas)}.`
    : '';
  return [contagem, melhores, caminho].filter(Boolean).join(' ');
}

function resumoDaProxima(dias: CeuDoDia[], temMapa: boolean) {
  if (dias.length === 0) return '';
  const fases = diasComFaseDaLua(dias);
  const textoDasFases = fases.length
    ? `${primeiraMaiuscula(listar(fases))}.`
    : '';
  if (!temMapa) {
    return [
      `Na semana que vem, a Lua passa por ${listar([...new Set(dias.map((d) => d.luaEm))])}.`,
      textoDasFases,
    ]
      .filter(Boolean)
      .join(' ');
  }
  const sensiveis = dias.filter((d) => d.paraVoce?.pontoSensivel);
  const favoraveis = dias.filter(
    (d) => d.paraVoce?.qualidade === 'favoravel' && !d.paraVoce.pontoSensivel
  );
  const cuidado = dias.filter(
    (d) => d.paraVoce?.qualidade === 'desfavoravel' && !d.paraVoce.pontoSensivel
  );
  const frases = [
    favoraveis.length
      ? `Os dias mais a seu favor são ${listar(favoraveis.map((d) => `${nomeDoDia(d.data)} (${d.paraVoce?.tema}; bom para ${d.paraVoce?.area})`))}.`
      : 'A semana que vem não tem dias especialmente favoráveis no seu mapa: priorize a rotina e o que já está em andamento.',
    cuidado.length
      ? `Pedem mais cuidado ${listar(cuidado.map((d) => `${nomeDoDia(d.data)} (${d.paraVoce?.tema})`))}.`
      : '',
    sensiveis.length
      ? `${primeiraMaiuscula(listar(sensiveis.map((d) => naData(d.data))))}, a Lua passa pelo ponto mais sensível do seu mapa: prudência, sem confrontos nem riscos.`
      : '',
    textoDasFases,
  ];
  return frases.filter(Boolean).join(' ');
}

export function lerLeituraDaSemana(opcoes: {
  perfil: PerfilAstrologico;
  mapa: MapaNatal | null;
  passados: string[];
  proximos: string[];
  agora: Date;
}): LeituraDaSemana {
  const { perfil, mapa } = opcoes;
  if (!perfil.localDoDia) {
    return {
      faltando:
        'Para a Lyra ler a sua semana, informe no perfil a cidade onde você mora e a data, a hora e a cidade de nascimento.',
      temMapa: false,
      resumo: '',
      passados: [],
      proxima: { resumo: '', dias: [] },
      fase: null,
      transitos: [],
    };
  }
  const montar = (datas: string[]) =>
    datas
      .map((data) => ceuDoDia(perfil, mapa, data))
      .filter((d): d is CeuDoDia => d !== null);
  const passados = montar(opcoes.passados);
  const proximos = montar(opcoes.proximos);
  const temMapa = mapa !== null;

  const transitos: string[] = [];
  if (mapa) {
    const jupiter = posicao(longitudeSideral('jupiter', opcoes.agora));
    const saturno = posicao(longitudeSideral('saturno', opcoes.agora));
    transitos.push(
      `${transitoDeJupiter(casaContada(mapa.lua.signo, jupiter.signo)).sentido}.`,
      `${transitoDeSaturno(casaContada(mapa.lua.signo, saturno.signo)).sentido}.`
    );
  }

  return {
    faltando: temMapa
      ? null
      : 'Com a data, a hora e a cidade de nascimento no perfil, a leitura da semana passa a falar do seu mapa.',
    temMapa,
    resumo: resumoDosPassados(passados, temMapa),
    passados,
    proxima: { resumo: resumoDaProxima(proximos, temMapa), dias: proximos },
    fase: mapa?.dasha ? faseDaVida(dashaSimples(mapa.dasha)) : null,
    transitos,
  };
}
