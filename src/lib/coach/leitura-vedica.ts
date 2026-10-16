import { horasDoDia, REGENTE_DO_DIA } from '@/lib/astrology/horas';
import type { Intervalo, Panchang } from '@/lib/astrology/panchang';
import type { DiaVedico } from '@/lib/astrology/perfil-astrologico';
import type { MapaNatal } from '@/lib/astrology/mapa-natal';
import { taraBala } from '@/lib/astrology/dia-pessoal';
import {
  ascendenteSideral,
  longitudeSideral,
  NAKSHATRAS,
  posicao,
  SIGNOS,
} from '@/lib/astrology/sideral';
import { horaLocal, partesLocais } from '@/lib/astrology/tempo';

import { grupoDoTithi, NAKSHATRA_INFO, NATUREZA } from './conhecimento';
import {
  CLIMA_DA_NATUREZA,
  diaDaLua,
  mesEAno,
  sintoniaDosElementos,
} from './linguagem-simples';
import {
  CASA_DA_LUA,
  DIA_DA_SEMANA,
  doshaDoRelogio,
  ELEMENTO_INFO,
  GRAHA_INFO,
  grahaPorNome,
  SIGNO_INFO,
  transitoDeJupiter,
  transitoDeSaturno,
} from './leitura-conhecimento';
import type {
  Dica,
  LeituraDoPeriodo,
  LeituraVedica,
  Periodo,
  Qualidade,
} from './tipos';

/**
 * Leitura védica do dia: os fatos astrológicos de cada período (Lua,
 * ascendente, horas planetárias, relógio dos doshas, Tara, trânsitos a partir
 * da Lua natal e dasha) e o texto escrito pelo motor da Lyra a partir deles.
 * Os mesmos fatos são a única entrada enviada ao modelo de IA configurado:
 * não há nome, e-mail, data, hora ou cidade de nascimento, métricas, ciclo nem
 * sinais do corpo.
 */

function primeiraMaiuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function sobreposicao(a: Intervalo, b: Intervalo) {
  return Math.max(
    0,
    Math.min(a.fim.getTime(), b.fim.getTime()) -
      Math.max(a.inicio.getTime(), b.inicio.getTime())
  );
}

function casaContada(de: number, ate: number) {
  return ((ate - de + 12) % 12) + 1;
}

export interface PeriodoDaEntrada {
  chave: Periodo['chave'];
  nome: string;
  horario: string;
  qualidade: Qualidade;
  nota: number;
  destaques: string[];
  cautelas: string[];
  lua: {
    signo: string;
    elemento: string;
    emocao: string;
    nakshatra: string;
    divindade: string;
    /** O que a Lua do período favorece, em linguagem simples. */
    favorece: string;
    tara: {
      nome: string;
      qualidade: Qualidade;
      tema: string;
      conselho: string;
      sentido: string;
    } | null;
    casaAPartirDaLuaNatal: number | null;
  };
  ascendente: { signo: string; elemento: string; corpo: string };
  horasPlanetarias: Array<{ graha: string; horario: string }>;
  regenteDoPeriodo: {
    graha: string;
    tema: string;
    pratica: string;
    mantra: string;
  };
  relogioDoAyurveda: { dosha: string; faixa: string; sentido: string };
}

export interface EntradaDaLeitura {
  data: string;
  diaDaSemana: string;
  regenteDoDia: { graha: string; tema: string; mantra: string; cor: string };
  ceu: {
    tithi: string;
    paksha: string;
    /** "6º dia da Lua crescente", "Lua cheia". */
    diaDaLua: string;
    grupoDoTithi: string;
    nakshatra: string;
    natureza: {
      nome: string;
      /** Clima em palavras simples ("de limpeza e corte"). */
      clima: string;
      favorece: string;
      evite: string;
    };
    divindade: string;
    yoga: { nome: string; qualidade: Qualidade };
    karana: { nome: string; qualidade: Qualidade };
    signoDaLua: string;
    nascerDoSol: string;
    porDoSol: string;
    rahuKalam: string;
    abhijitMuhurta: string | null;
    brahmaMuhurta: string;
    ekadashi: boolean;
    trocaDeNakshatra: string | null;
  };
  /** Sem data e cidade de nascimento no perfil, não há mapa natal. */
  mapa: {
    lagna: string | null;
    lua: {
      signo: string;
      nakshatra: string;
      /** O jeito de sentir da Lua de nascimento. */
      jeito: string;
      /** Como a Lua de hoje conversa com esse jeito de sentir. */
      sintoniaComHoje: string;
    };
    dasha: {
      mahadasha: string;
      antardasha: string;
      temaDoMahadasha: string;
      temaDoAntardasha: string;
      /** "2031": fim da fase longa (Mahadasha). */
      fimDoMahadasha: string;
      /** "março de 2027": fim da subfase (Antardasha). */
      fimDoAntardasha: string;
    } | null;
    tara: {
      nome: string;
      qualidade: Qualidade;
      tema: string;
      conselho: string;
      sentido: string;
    };
    chandra: { casa: number; sentido: string; chandrashtama: boolean };
    jupiter: { casa: number; favoravel: boolean; sentido: string };
    saturno: { casa: number; favoravel: boolean; sentido: string };
  } | null;
  periodos: PeriodoDaEntrada[];
  melhorJanela: { nome: string; horario: string } | null;
}

export interface FatosDoDia {
  data: string;
  fuso: string;
  latitude: number;
  longitude: number;
  hoje: Panchang;
  ontem: Panchang;
  dia: DiaVedico;
  mapa: MapaNatal | null;
  periodos: Periodo[];
  melhorJanela: (Intervalo & { nome: string }) | null;
}

export function montarEntradaDaLeitura(fatos: FatosDoDia): EntradaDaLeitura {
  const { hoje, ontem, dia, mapa, fuso } = fatos;
  const hora = (instante: Date) => horaLocal(instante, fuso);
  const faixa = (intervalo: Intervalo) =>
    `${hora(intervalo.inicio)}–${hora(intervalo.fim)}`;

  const natureza = NAKSHATRA_INFO[hoje.nakshatra.indice];
  const sentido = NATUREZA[natureza.natureza];
  const numeroNoPaksha = (hoje.tithi.indice % 15) + 1;
  const grupo = grupoDoTithi(numeroNoPaksha);
  const regenteDoDia = GRAHA_INFO[REGENTE_DO_DIA[hoje.vara.indice]];
  const meioDoDia = new Date(
    (hoje.nascerDoSol.getTime() + hoje.porDoSol.getTime()) / 2
  );

  const horas = [...horasDoDia(ontem), ...horasDoDia(hoje)];

  const periodos = fatos.periodos.map((periodo): PeriodoDaEntrada => {
    const intervalo = {
      inicio: new Date(periodo.inicio),
      fim: new Date(periodo.fim),
    };
    const meio = new Date(
      (intervalo.inicio.getTime() + intervalo.fim.getTime()) / 2
    );
    const lua = posicao(longitudeSideral('lua', meio));
    const ascendente = posicao(
      ascendenteSideral(meio, fatos.latitude, fatos.longitude)
    );
    const tempoPorGraha = new Map<string, number>();
    const horasDoPeriodo: Array<{ graha: string; horario: string }> = [];
    for (const h of horas) {
      const tempo = sobreposicao(h, intervalo);
      if (tempo < 60_000) continue;
      tempoPorGraha.set(h.graha, (tempoPorGraha.get(h.graha) ?? 0) + tempo);
      horasDoPeriodo.push({
        graha: GRAHA_INFO[h.graha].nome,
        horario: faixa({
          inicio: new Date(
            Math.max(h.inicio.getTime(), intervalo.inicio.getTime())
          ),
          fim: new Date(Math.min(h.fim.getTime(), intervalo.fim.getTime())),
        }),
      });
    }
    const dominante = [...tempoPorGraha.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] as keyof typeof GRAHA_INFO | undefined;
    const regente = GRAHA_INFO[dominante ?? REGENTE_DO_DIA[hoje.vara.indice]];
    const infoDaLua = SIGNO_INFO[lua.signo];
    const infoDoAscendente = SIGNO_INFO[ascendente.signo];
    const tara = mapa ? taraBala(mapa.lua.nakshatra, lua.nakshatra) : null;
    return {
      chave: periodo.chave,
      nome: periodo.nome,
      horario: periodo.horario,
      qualidade: periodo.qualidade,
      nota: periodo.nota,
      destaques: periodo.destaques.map((j) => `${j.nome} ${j.horario}`),
      cautelas: periodo.cuidados.map((j) => `${j.nome} ${j.horario}`),
      lua: {
        signo: SIGNOS[lua.signo],
        elemento: ELEMENTO_INFO[infoDaLua.elemento].nome,
        emocao: infoDaLua.emocao,
        nakshatra: NAKSHATRAS[lua.nakshatra],
        divindade: NAKSHATRA_INFO[lua.nakshatra].divindade,
        favorece: NATUREZA[NAKSHATRA_INFO[lua.nakshatra].natureza].favorece,
        tara: tara
          ? {
              nome: tara.nome,
              qualidade: tara.qualidade,
              tema: tara.tema,
              conselho: tara.conselho,
              sentido: tara.sentido,
            }
          : null,
        casaAPartirDaLuaNatal: mapa
          ? casaContada(mapa.lua.signo, lua.signo)
          : null,
      },
      ascendente: {
        signo: SIGNOS[ascendente.signo],
        elemento: ELEMENTO_INFO[infoDoAscendente.elemento].nome,
        corpo: infoDoAscendente.corpo,
      },
      horasPlanetarias: horasDoPeriodo,
      regenteDoPeriodo: {
        graha: regente.nome,
        tema: regente.tema,
        pratica: regente.pratica,
        mantra: regente.mantra,
      },
      relogioDoAyurveda: (() => {
        const relogio = doshaDoRelogio(partesLocais(meio, fuso).hora);
        return {
          dosha: relogio.dosha,
          faixa: relogio.faixa,
          sentido: relogio.sentido,
        };
      })(),
    };
  });

  let mapaDaEntrada: EntradaDaLeitura['mapa'] = null;
  if (mapa && dia.pessoal) {
    const jupiter = posicao(longitudeSideral('jupiter', meioDoDia));
    const saturno = posicao(longitudeSideral('saturno', meioDoDia));
    const casaJupiter = casaContada(mapa.lua.signo, jupiter.signo);
    const casaSaturno = casaContada(mapa.lua.signo, saturno.signo);
    const casaDaLua = dia.pessoal.chandra.casa;
    const luaNatal = SIGNO_INFO[mapa.lua.signo];
    mapaDaEntrada = {
      lagna: mapa.lagna ? mapa.lagna.nomeDoSigno : null,
      lua: {
        signo: mapa.lua.nomeDoSigno,
        nakshatra: mapa.lua.nomeDoNakshatra,
        jeito: luaNatal.emocao,
        sintoniaComHoje: sintoniaDosElementos(
          luaNatal.elemento,
          SIGNO_INFO[hoje.signoDaLua.indice].elemento
        ),
      },
      dasha: mapa.dasha
        ? {
            mahadasha: GRAHA_INFO[mapa.dasha.mahadasha.graha].nome,
            antardasha: GRAHA_INFO[mapa.dasha.antardasha.graha].nome,
            temaDoMahadasha: GRAHA_INFO[mapa.dasha.mahadasha.graha].tema,
            temaDoAntardasha: GRAHA_INFO[mapa.dasha.antardasha.graha].tema,
            fimDoMahadasha: String(mapa.dasha.mahadasha.fim.getUTCFullYear()),
            fimDoAntardasha: mesEAno(mapa.dasha.antardasha.fim),
          }
        : null,
      tara: {
        nome: dia.pessoal.tara.nome,
        qualidade: dia.pessoal.tara.qualidade,
        tema: dia.pessoal.tara.tema,
        conselho: dia.pessoal.tara.conselho,
        sentido: dia.pessoal.tara.sentido,
      },
      chandra: {
        casa: casaDaLua,
        sentido: CASA_DA_LUA[casaDaLua - 1],
        chandrashtama: dia.pessoal.chandra.chandrashtama,
      },
      jupiter: { casa: casaJupiter, ...transitoDeJupiter(casaJupiter) },
      saturno: { casa: casaSaturno, ...transitoDeSaturno(casaSaturno) },
    };
  }

  // A virada da Lua no meio do dia, contada pelo efeito para a pessoa.
  const taraDepois = dia.pessoal?.taraDepois ?? null;
  const troca =
    hoje.nakshatra.termina < hoje.proximoNascerDoSol
      ? `às ${hora(hoje.nakshatra.termina)} a Lua muda de clima${
          taraDepois
            ? `, e para você o tom passa a ser de ${taraDepois.tema}`
            : ''
        }`
      : null;

  return {
    data: fatos.data,
    diaDaSemana: DIA_DA_SEMANA[hoje.vara.indice],
    regenteDoDia: {
      graha: regenteDoDia.nome,
      tema: regenteDoDia.tema,
      mantra: regenteDoDia.mantra,
      cor: regenteDoDia.cor,
    },
    ceu: {
      tithi: hoje.tithi.nome,
      paksha: hoje.tithi.paksha,
      diaDaLua: diaDaLua(hoje.tithi.indice),
      grupoDoTithi: `${grupo.nome} (${grupo.sentido})`,
      nakshatra: hoje.nakshatra.nome,
      natureza: {
        nome: sentido.nome,
        clima: CLIMA_DA_NATUREZA[natureza.natureza].clima,
        favorece: sentido.favorece,
        evite: sentido.evite,
      },
      divindade: natureza.divindade,
      yoga: { nome: hoje.yoga.nome, qualidade: hoje.yoga.qualidade },
      karana: { nome: hoje.karana.nome, qualidade: hoje.karana.qualidade },
      signoDaLua: hoje.signoDaLua.nome,
      nascerDoSol: hora(hoje.nascerDoSol),
      porDoSol: hora(hoje.porDoSol),
      rahuKalam: faixa(hoje.rahuKalam),
      abhijitMuhurta: hoje.abhijitMuhurta.valido
        ? faixa(hoje.abhijitMuhurta)
        : null,
      brahmaMuhurta: faixa(hoje.brahmaMuhurta),
      ekadashi: numeroNoPaksha === 11,
      trocaDeNakshatra: troca,
    },
    mapa: mapaDaEntrada,
    periodos,
    melhorJanela: fatos.melhorJanela
      ? { nome: fatos.melhorJanela.nome, horario: faixa(fatos.melhorJanela) }
      : null,
  };
}

// ---------------------------------------------------------------- texto local
//
// Linguagem simples (tarefa 49): cada fato do mapa é contado pelo que ele
// significa para a pessoa, sem termos técnicos nem nomes em sânscrito.

const SOBRE_A_QUALIDADE: Record<Qualidade, string> = {
  favoravel:
    'Os horários deste período estão a favor das emoções: bom momento para conversas e gestos de afeto.',
  neutro: 'As emoções ficam estáveis: siga no seu ritmo.',
  desfavoravel:
    'Este período pede cautela: respire antes de responder e adie discussões.',
};

function deGraha(nome: string) {
  return grahaPorNome(nome)?.de ?? `de ${nome}`;
}

function taraDoPeriodo(p: PeriodoDaEntrada) {
  return p.lua.tara
    ? ` Para você, é um momento de ${p.lua.tara.tema}: ${p.lua.tara.conselho}.`
    : '';
}

function emocional(p: PeriodoDaEntrada, entrada: EntradaDaLeitura): string {
  const lua = `a Lua em ${p.lua.signo} traz ${p.lua.emocao}`;
  switch (p.chave) {
    case 'madrugada':
      return `Durante o sono, ${lua}; os sonhos e o descanso refletem esse tom.${taraDoPeriodo(p)}`;
    case 'manha':
      return `Ao despertar, ${lua}. ${SOBRE_A_QUALIDADE[p.qualidade]}${taraDoPeriodo(p)}`;
    case 'tarde': {
      const casa =
        p.lua.casaAPartirDaLuaNatal !== null
          ? ` Para você, ${CASA_DA_LUA[p.lua.casaAPartirDaLuaNatal - 1]}.`
          : '';
      return `À tarde, predomina a energia ${deGraha(p.regenteDoPeriodo.graha)}, ligada a ${p.regenteDoPeriodo.tema}. ${SOBRE_A_QUALIDADE[p.qualidade]}${casa}`;
    }
    default: {
      const fase = entrada.ceu.diaDaLua.includes('crescente')
        ? 'a Lua crescente pede expressão e encontros'
        : entrada.ceu.diaDaLua === 'Lua cheia'
          ? 'a Lua cheia deixa as emoções à flor da pele'
          : entrada.ceu.diaDaLua === 'Lua nova'
            ? 'a Lua nova pede silêncio e novas intenções'
            : 'a Lua minguante pede recolhimento e balanço do dia';
      const troca = entrada.ceu.trocaDeNakshatra
        ? ` Fique atento à virada: ${entrada.ceu.trocaDeNakshatra}.`
        : '';
      return `À noite, ${fase}, e ${lua}.${troca}`;
    }
  }
}

function fisico(p: PeriodoDaEntrada, entrada: EntradaDaLeitura): string {
  const elemento = Object.values(ELEMENTO_INFO).find(
    (e) => e.nome === p.ascendente.elemento
  );
  const ascendente = `Neste período, o signo que nasce no horizonte é ${p.ascendente.signo}, que rege ${p.ascendente.corpo}${elemento ? `: ${elemento.corpo}` : ''}.`;
  const relogio = `Pelo relógio natural do corpo (${p.relogioDoAyurveda.faixa}), ${p.relogioDoAyurveda.sentido}.`;
  if (p.chave === 'madrugada') {
    return `Fase de reparo do corpo: quarto escuro, fresco e silencioso. ${relogio} ${ascendente}`;
  }
  const cautela =
    p.qualidade === 'desfavoravel'
      ? ' Como este período pede cautela, poupe o corpo de esforços extremos.'
      : p.qualidade === 'favoravel' && p.chave === 'manha'
        ? ' Bom trecho para o treino do dia.'
        : '';
  const refeicao =
    p.chave === 'noite'
      ? ` Depois do pôr do sol (${entrada.ceu.porDoSol}), prefira um jantar leve.`
      : '';
  return `${ascendente} ${relogio}${cautela}${refeicao}`;
}

function espiritual(p: PeriodoDaEntrada, entrada: EntradaDaLeitura): string {
  const hora = `Predomina a energia ${deGraha(p.regenteDoPeriodo.graha)}, que pede ${p.regenteDoPeriodo.pratica}.`;
  switch (p.chave) {
    case 'madrugada':
      return `A hora do silêncio, antes do amanhecer (${entrada.ceu.brahmaMuhurta}), é o momento mais sutil do dia para meditar e firmar a intenção. ${hora}`;
    case 'manha':
      return `${hora} A Lua desta manhã favorece ${p.lua.favorece}: uma intenção nessa direção abre bem o dia.`;
    case 'tarde':
      return `${hora} Uma pausa de 3 minutos de respiração consciente reconecta o propósito no meio do dia.`;
    default:
      return `O pôr do sol (${entrada.ceu.porDoSol}) convida a uma pausa de gratidão pela passagem do dia. ${hora}`;
  }
}

function pontosPositivos(entrada: EntradaDaLeitura): string[] {
  const pontos: string[] = [];
  if (entrada.mapa?.tara.qualidade === 'favoravel') {
    pontos.push(
      `Para você, hoje é um dia de ${entrada.mapa.tara.tema}: ${entrada.mapa.tara.conselho}.`
    );
  }
  if (
    entrada.mapa &&
    !entrada.mapa.chandra.chandrashtama &&
    [1, 3, 6, 7, 10, 11].includes(entrada.mapa.chandra.casa)
  ) {
    pontos.push(`${primeiraMaiuscula(entrada.mapa.chandra.sentido)}.`);
  }
  if (entrada.melhorJanela) {
    pontos.push(
      `Horário forte para começos e decisões: ${entrada.melhorJanela.horario}.`
    );
  }
  pontos.push(
    `A Lua de hoje, de clima ${entrada.ceu.natureza.clima}, favorece ${entrada.ceu.natureza.favorece}.`
  );
  if (entrada.ceu.yoga.qualidade !== 'desfavoravel') {
    pontos.push(
      'A combinação do Sol com a Lua hoje é favorável e ajuda a sustentar o que você fizer.'
    );
  }
  if (entrada.mapa?.jupiter.favoravel) {
    pontos.push(`${entrada.mapa.jupiter.sentido}.`);
  }
  if (entrada.mapa?.saturno.favoravel) {
    pontos.push(`${entrada.mapa.saturno.sentido}.`);
  }
  const melhor = [...entrada.periodos]
    .filter((p) => p.chave !== 'madrugada')
    .sort((a, b) => b.nota - a.nota)[0];
  if (melhor && melhor.qualidade !== 'desfavoravel') {
    pontos.push(
      `A ${melhor.nome.toLowerCase()} é o melhor período do dia (${melhor.horario}).`
    );
  }
  return pontos.slice(0, 5);
}

function pontosNegativos(entrada: EntradaDaLeitura): string[] {
  const pontos: string[] = [];
  if (entrada.mapa?.chandra.chandrashtama) {
    pontos.push(
      'A Lua passa pelo ponto mais sensível do seu mapa (cerca de dois dias e meio por mês): prudência e nada de riscos.'
    );
  }
  pontos.push(
    `Das ${entrada.ceu.rahuKalam.replace('–', ' às ')}, evite começar coisas importantes e assinar compromissos.`
  );
  if (entrada.mapa?.tara.qualidade === 'desfavoravel') {
    pontos.push(
      `Para você, hoje é um dia de ${entrada.mapa.tara.tema}: ${entrada.mapa.tara.conselho}.`
    );
  }
  if (entrada.ceu.karana.qualidade === 'desfavoravel') {
    pontos.push(
      'Em parte do dia, o calendário lunar desaconselha começos importantes.'
    );
  }
  if (entrada.ceu.yoga.qualidade === 'desfavoravel') {
    pontos.push(
      'A combinação do Sol com a Lua hoje é desfavorável: prefira a rotina às novidades.'
    );
  }
  if (entrada.ceu.grupoDoTithi.startsWith('Rikta')) {
    pontos.push(
      `Hoje é o ${entrada.ceu.diaDaLua}, um dia de concluir e organizar, não de começar.`
    );
  }
  if (entrada.mapa && !entrada.mapa.saturno.favoravel) {
    pontos.push(`${entrada.mapa.saturno.sentido}.`);
  }
  pontos.push(`A Lua de hoje pede evitar ${entrada.ceu.natureza.evite}.`);
  const pior = [...entrada.periodos]
    .filter((p) => p.chave !== 'madrugada')
    .sort((a, b) => a.nota - b.nota)[0];
  if (pior && pior.qualidade === 'desfavoravel') {
    pontos.push(
      `A ${pior.nome.toLowerCase()} pede mais cuidado (${pior.horario}): tarefas leves e conhecidas.`
    );
  }
  return pontos.slice(0, 5);
}

/**
 * A fase da vida (Vimshottari) em linguagem simples: Rahu e Ketu, pouco
 * conhecidos fora da astrologia védica, entram só pelo tema.
 */
function faseDaVida(
  dasha: NonNullable<NonNullable<EntradaDaLeitura['mapa']>['dasha']>
) {
  const conhecido = (nome: string) => nome !== 'Rahu' && nome !== 'Ketu';
  const regida = conhecido(dasha.mahadasha)
    ? `, regida por ${dasha.mahadasha}`
    : '';
  return `Nesta fase da sua vida${regida}, que vai até ${dasha.fimDoMahadasha}, o tema é ${dasha.temaDoMahadasha}; até ${dasha.fimDoAntardasha}, uma etapa de ${dasha.temaDoAntardasha} dá o tom dos seus dias.`;
}

function dicas(entrada: EntradaDaLeitura): Dica[] {
  const lista: Dica[] = [];
  if (entrada.mapa?.dasha) {
    const dasha = entrada.mapa.dasha;
    const antar = grahaPorNome(dasha.antardasha);
    lista.push({
      texto: `Reserve um momento para ${dasha.temaDoAntardasha}${antar ? `, com ${antar.pratica}` : ''}.`,
      porque: faseDaVida(dasha),
    });
  }
  lista.push({
    texto: `Se gostar de mantras, repita 9 ou 108 vezes "${entrada.regenteDoDia.mantra}"; para marcar a intenção, use ${entrada.regenteDoDia.cor}.`,
    porque: `${entrada.diaDaSemana} é o dia ${deGraha(entrada.regenteDoDia.graha)}, ligado a ${entrada.regenteDoDia.tema}.`,
  });
  lista.push({
    texto: `Intenção do dia: ${entrada.ceu.natureza.favorece}.`,
    porque: `A Lua de hoje está num trecho do céu de clima ${entrada.ceu.natureza.clima}, que favorece isso.`,
  });
  if (entrada.mapa) {
    lista.push({
      texto: entrada.mapa.jupiter.favoravel
        ? 'Aproveite o bom momento de Júpiter para estudar, pedir orientação ou dar um passo de crescimento.'
        : 'Cresça devagar: estudo e paciência rendem mais que pressa neste ano.',
      porque: `${entrada.mapa.jupiter.sentido}.`,
    });
  }
  if (entrada.ceu.ekadashi) {
    lista.push({
      texto:
        'Hoje é o 11º dia da Lua: a tradição sugere refeições mais leves e mais tempo de prática espiritual (opcional, sem contraindicação).',
      porque:
        'O 11º dia de cada fase da Lua é tradicionalmente dedicado à leveza e à interiorização.',
    });
  }
  if (entrada.melhorJanela) {
    lista.push({
      texto: `Guarde ${entrada.melhorJanela.horario} para o que mais importa hoje.`,
      porque:
        'É o trecho mais forte do dia para começar e decidir, fora dos horários de cautela.',
    });
  }
  return lista.slice(0, 6);
}

/** Garante pelo menos dois pontos positivos com o regente do dia. */
function comRegente(pontos: string[], entrada: EntradaDaLeitura) {
  if (pontos.length >= 2) return pontos;
  return [
    ...pontos,
    `Dia ${deGraha(entrada.regenteDoDia.graha)}, bom para ${entrada.regenteDoDia.tema}.`,
  ];
}

/**
 * Resumo do dia contado a partir do mapa da pessoa: o tom do dia para ela,
 * a área do mapa por onde a Lua passa, como a Lua de hoje conversa com a Lua
 * de nascimento, a fase da vida e os horários que mais pesam.
 */
function resumoGeral(entrada: EntradaDaLeitura): string {
  const rahu = entrada.ceu.rahuKalam.replace('–', ' às ');
  const horarios = entrada.melhorJanela
    ? `Use ${entrada.melhorJanela.horario} para o que mais importa e evite começar coisas importantes das ${rahu}.`
    : `Evite começar coisas importantes das ${rahu}.`;
  if (!entrada.mapa) {
    return [
      `${entrada.diaDaSemana} é o dia ${deGraha(entrada.regenteDoDia.graha)}, ligado a ${entrada.regenteDoDia.tema}.`,
      `A Lua em ${entrada.ceu.signoDaLua}, de clima ${entrada.ceu.natureza.clima}, favorece ${entrada.ceu.natureza.favorece}.`,
      horarios,
      'Com a sua data e a cidade de nascimento no perfil, a leitura passa a falar do seu mapa.',
    ].join(' ');
  }
  const { mapa } = entrada;
  const frases = [
    `Para você, hoje é um dia de ${mapa.tara.tema}: ${mapa.tara.conselho}.`,
    `${primeiraMaiuscula(mapa.chandra.sentido)}.`,
    `A sua Lua de nascimento, em ${mapa.lua.signo}, fala de ${mapa.lua.jeito}; a Lua de hoje, em ${entrada.ceu.signoDaLua}, ${mapa.lua.sintoniaComHoje}.`,
  ];
  if (mapa.dasha) frases.push(faseDaVida(mapa.dasha));
  frases.push(horarios);
  return frases.join(' ');
}

export function escreverLeituraLocal(entrada: EntradaDaLeitura): LeituraVedica {
  return {
    resumoGeral: resumoGeral(entrada),
    periodos: entrada.periodos.map((p): LeituraDoPeriodo => ({
      chave: p.chave,
      emocional: emocional(p, entrada),
      fisico: fisico(p, entrada),
      espiritual: espiritual(p, entrada),
    })),
    pontosPositivos: comRegente(pontosPositivos(entrada), entrada),
    pontosNegativos: pontosNegativos(entrada),
    dicas: dicas(entrada),
    autor: { tipo: 'lyra' },
  };
}
