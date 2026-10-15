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
    tara: { nome: string; qualidade: Qualidade; sentido: string } | null;
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
    grupoDoTithi: string;
    nakshatra: string;
    natureza: { nome: string; favorece: string; evite: string };
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
    lua: { signo: string; nakshatra: string };
    dasha: {
      mahadasha: string;
      antardasha: string;
      temaDoMahadasha: string;
      temaDoAntardasha: string;
    } | null;
    tara: { nome: string; qualidade: Qualidade; sentido: string };
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
        tara: tara
          ? {
              nome: tara.nome,
              qualidade: tara.qualidade,
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
    mapaDaEntrada = {
      lagna: mapa.lagna ? mapa.lagna.nomeDoSigno : null,
      lua: { signo: mapa.lua.nomeDoSigno, nakshatra: mapa.lua.nomeDoNakshatra },
      dasha: mapa.dasha
        ? {
            mahadasha: GRAHA_INFO[mapa.dasha.mahadasha.graha].nome,
            antardasha: GRAHA_INFO[mapa.dasha.antardasha.graha].nome,
            temaDoMahadasha: GRAHA_INFO[mapa.dasha.mahadasha.graha].tema,
            temaDoAntardasha: GRAHA_INFO[mapa.dasha.antardasha.graha].tema,
          }
        : null,
      tara: {
        nome: dia.pessoal.tara.nome,
        qualidade: dia.pessoal.tara.qualidade,
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

  const troca =
    hoje.nakshatra.termina < hoje.proximoNascerDoSol
      ? `às ${hora(hoje.nakshatra.termina)} a Lua entra em ${NAKSHATRAS[(hoje.nakshatra.indice + 1) % 27]}`
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
      grupoDoTithi: `${grupo.nome} (${grupo.sentido})`,
      nakshatra: hoje.nakshatra.nome,
      natureza: {
        nome: sentido.nome,
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

const SOBRE_A_QUALIDADE: Record<Qualidade, string> = {
  favoravel:
    'O Choghadiya está a favor das emoções: bom momento para conversas e gestos de afeto.',
  neutro: 'As emoções ficam estáveis: siga no seu ritmo.',
  desfavoravel:
    'O Choghadiya pede cautela: respire antes de responder e adie discussões.',
};

function deGraha(nome: string) {
  return grahaPorNome(nome)?.de ?? `de ${nome}`;
}

function taraDoPeriodo(p: PeriodoDaEntrada) {
  return p.lua.tara
    ? ` No seu mapa, a Lua passa por Tara ${p.lua.tara.nome} (${p.lua.tara.sentido}).`
    : '';
}

function emocional(p: PeriodoDaEntrada, entrada: EntradaDaLeitura): string {
  const lua = `a Lua em ${p.lua.signo}, signo de ${p.lua.elemento}, no nakshatra ${p.lua.nakshatra}, traz ${p.lua.emocao}`;
  switch (p.chave) {
    case 'madrugada':
      return `Durante o sono, ${lua}; os sonhos e o descanso refletem esse tom.${taraDoPeriodo(p)}`;
    case 'manha':
      return `Ao despertar, ${lua}. ${SOBRE_A_QUALIDADE[p.qualidade]}${taraDoPeriodo(p)}`;
    case 'tarde': {
      const casa =
        p.lua.casaAPartirDaLuaNatal !== null
          ? ` Para você, é ${CASA_DA_LUA[p.lua.casaAPartirDaLuaNatal - 1]}.`
          : '';
      return `À tarde, a hora ${deGraha(p.regenteDoPeriodo.graha)} traz o tema de ${p.regenteDoPeriodo.tema}. ${SOBRE_A_QUALIDADE[p.qualidade]}${casa}`;
    }
    default: {
      const fase =
        entrada.ceu.paksha === 'Shukla Paksha'
          ? 'a Lua crescente (Shukla Paksha) pede expressão e encontros'
          : 'a Lua minguante (Krishna Paksha) pede recolhimento e balanço do dia';
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
  const ascendente = `O ascendente do período está em ${p.ascendente.signo}, que rege ${p.ascendente.corpo}${elemento ? `; ${elemento.corpo}` : ''}.`;
  const relogio = `Pelo relógio do Ayurveda (${p.relogioDoAyurveda.faixa}), ${p.relogioDoAyurveda.sentido}.`;
  if (p.chave === 'madrugada') {
    return `Fase de reparo do corpo: quarto escuro, fresco e silencioso. ${relogio} ${ascendente}`;
  }
  const cautela =
    p.qualidade === 'desfavoravel'
      ? ' Com o Choghadiya desfavorável, poupe o corpo de esforços extremos.'
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
  const hora = `Predomina a hora ${deGraha(p.regenteDoPeriodo.graha)}, que pede ${p.regenteDoPeriodo.pratica} (mantra "${p.regenteDoPeriodo.mantra}").`;
  switch (p.chave) {
    case 'madrugada':
      return `Brahma Muhurta (${entrada.ceu.brahmaMuhurta}) é o momento mais sutil do dia para meditar e firmar a intenção. ${hora}`;
    case 'manha':
      return `${hora} O nakshatra ${p.lua.nakshatra} é regido por ${p.lua.divindade}; uma intenção nessa direção abre bem o dia.`;
    case 'tarde':
      return `${hora} Uma pausa de 3 minutos de respiração consciente reconecta o propósito no meio do dia.`;
    default:
      return `No pôr do sol (${entrada.ceu.porDoSol}), a Sandhya convida a uma pausa de gratidão. ${hora}`;
  }
}

function pontosPositivos(entrada: EntradaDaLeitura): string[] {
  const pontos: string[] = [];
  if (entrada.mapa?.tara.qualidade === 'favoravel') {
    pontos.push(
      `Tara ${entrada.mapa.tara.nome} (${entrada.mapa.tara.sentido}).`
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
      `Janela forte para começos e decisões: ${entrada.melhorJanela.nome}, ${entrada.melhorJanela.horario}.`
    );
  }
  pontos.push(
    `Lua em ${entrada.ceu.nakshatra}, nakshatra ${entrada.ceu.natureza.nome.toLowerCase()}, que favorece ${entrada.ceu.natureza.favorece}.`
  );
  if (entrada.ceu.yoga.qualidade !== 'desfavoravel') {
    pontos.push(`Yoga ${entrada.ceu.yoga.nome}, que sustenta o dia.`);
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
      'Chandrashtama: a Lua passa pelo 8º signo a partir da sua Lua natal; prudência e nada de riscos.'
    );
  }
  pontos.push(
    `Rahu Kalam das ${entrada.ceu.rahuKalam.replace('–', ' às ')}: evite começos e assinaturas.`
  );
  if (entrada.mapa?.tara.qualidade === 'desfavoravel') {
    pontos.push(
      `Tara ${entrada.mapa.tara.nome} (${entrada.mapa.tara.sentido}).`
    );
  }
  if (entrada.ceu.karana.qualidade === 'desfavoravel') {
    pontos.push(
      `Karana ${entrada.ceu.karana.nome}: meio tithi tradicionalmente evitado para começos.`
    );
  }
  if (entrada.ceu.yoga.qualidade === 'desfavoravel') {
    pontos.push(
      `Yoga ${entrada.ceu.yoga.nome}: prefira a rotina às novidades.`
    );
  }
  if (entrada.ceu.grupoDoTithi.startsWith('Rikta')) {
    pontos.push(
      `Tithi ${entrada.ceu.tithi} (Rikta): dia de concluir, não de começar.`
    );
  }
  if (entrada.mapa && !entrada.mapa.saturno.favoravel) {
    pontos.push(`${entrada.mapa.saturno.sentido}.`);
  }
  pontos.push(
    `A natureza do nakshatra pede evitar ${entrada.ceu.natureza.evite}.`
  );
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

function dicas(entrada: EntradaDaLeitura): Dica[] {
  const lista: Dica[] = [];
  if (entrada.mapa?.dasha) {
    const dasha = entrada.mapa.dasha;
    const antar = grahaPorNome(dasha.antardasha);
    lista.push({
      texto: `Reserve um momento para o tema do seu Antardasha (${dasha.temaDoAntardasha})${antar ? `, com ${antar.pratica}` : ''}.`,
      porque: `Você está no Mahadasha ${deGraha(dasha.mahadasha)} (${dasha.temaDoMahadasha}) e no Antardasha ${deGraha(dasha.antardasha)}, que dão o tom destes meses.`,
    });
  }
  lista.push({
    texto: `Repita 9 ou 108 vezes o mantra do dia, "${entrada.regenteDoDia.mantra}", e use ${entrada.regenteDoDia.cor} se quiser marcar a intenção.`,
    porque: `${entrada.diaDaSemana} está sob a regência ${deGraha(entrada.regenteDoDia.graha)} (${entrada.regenteDoDia.tema}).`,
  });
  lista.push({
    texto: `Intenção do dia: ${entrada.ceu.natureza.favorece}.`,
    porque: `A Lua está em ${entrada.ceu.nakshatra}, nakshatra ${entrada.ceu.natureza.nome.toLowerCase()} regido por ${entrada.ceu.divindade}.`,
  });
  if (entrada.mapa) {
    lista.push({
      texto: entrada.mapa.jupiter.favoravel
        ? 'Aproveite a fase de Júpiter para estudar, pedir orientação ou dar um passo de crescimento.'
        : 'Cresça devagar: estudo e paciência rendem mais que pressa nesta fase de Júpiter.',
      porque: `${entrada.mapa.jupiter.sentido}.`,
    });
  }
  if (entrada.ceu.ekadashi) {
    lista.push({
      texto:
        'Ekadashi: a tradição sugere refeições mais leves e mais tempo de prática espiritual (opcional, sem contraindicação).',
      porque: `Hoje é o 11º tithi da ${entrada.ceu.paksha}.`,
    });
  }
  if (entrada.melhorJanela) {
    lista.push({
      texto: `Guarde ${entrada.melhorJanela.horario} para o que mais importa hoje.`,
      porque: `${entrada.melhorJanela.nome}, fora das janelas de cautela do Panchang.`,
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

function resumoGeral(entrada: EntradaDaLeitura): string {
  const frases = [
    `${entrada.diaDaSemana}, sob a regência ${deGraha(entrada.regenteDoDia.graha)}, favorece ${entrada.regenteDoDia.tema}. A Lua está em ${entrada.ceu.nakshatra}, no signo de ${entrada.ceu.signoDaLua}, e o tithi é ${entrada.ceu.tithi} da ${entrada.ceu.paksha}.`,
  ];
  if (entrada.mapa) {
    frases.push(
      `No seu mapa, é um dia Tara ${entrada.mapa.tara.nome} (${entrada.mapa.tara.sentido}), com ${entrada.mapa.chandra.sentido}.`
    );
    if (entrada.mapa.dasha) {
      frases.push(
        `O Antardasha ${deGraha(entrada.mapa.dasha.antardasha)}, dentro do Mahadasha ${deGraha(entrada.mapa.dasha.mahadasha)}, colore o dia com ${entrada.mapa.dasha.temaDoAntardasha}.`
      );
    }
  }
  frases.push(
    entrada.melhorJanela
      ? `Use ${entrada.melhorJanela.horario} para o que importa e evite começos no Rahu Kalam (${entrada.ceu.rahuKalam}).`
      : `Evite começos no Rahu Kalam (${entrada.ceu.rahuKalam}).`
  );
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
