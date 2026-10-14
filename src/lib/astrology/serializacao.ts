import type { DiaVedico } from './perfil-astrologico';
import type { MapaNatal } from './mapa-natal';
import type { Intervalo } from './panchang';
import { grausEMinutos } from './sideral';
import { horaLocal } from './tempo';

/**
 * Formatos de resposta do mapa natal e do dia védico: datas em ISO e também
 * já em hora local do lugar ("HH:mm"), graus como "12°34'".
 */

export function mapaParaJson(mapa: MapaNatal) {
  return {
    nascimentoUtc: mapa.nascimentoUtc.toISOString(),
    horaConhecida: mapa.horaConhecida,
    lagna: mapa.lagna
      ? {
          signo: mapa.lagna.nomeDoSigno,
          rashi: mapa.lagna.rashi,
          grau: grausEMinutos(mapa.lagna.grauNoSigno),
          nakshatra: mapa.lagna.nomeDoNakshatra,
          pada: mapa.lagna.pada,
          regente: mapa.lagna.nomeDoRegente,
        }
      : null,
    planetas: mapa.planetas.map((p) => ({
      graha: p.graha,
      nome: p.nome,
      signo: p.nomeDoSigno,
      rashi: p.rashi,
      grau: grausEMinutos(p.grauNoSigno),
      nakshatra: p.nomeDoNakshatra,
      pada: p.pada,
      casa: p.casa,
      retrogrado: p.retrogrado,
    })),
    lua: {
      signo: mapa.lua.nomeDoSigno,
      nakshatra: mapa.lua.nomeDoNakshatra,
      pada: mapa.lua.pada,
    },
    dasha: mapa.dasha
      ? {
          mahadasha: {
            nome: mapa.dasha.mahadasha.nome,
            inicio: mapa.dasha.mahadasha.inicio.toISOString(),
            fim: mapa.dasha.mahadasha.fim.toISOString(),
          },
          antardasha: {
            nome: mapa.dasha.antardasha.nome,
            inicio: mapa.dasha.antardasha.inicio.toISOString(),
            fim: mapa.dasha.antardasha.fim.toISOString(),
          },
          proximaAntardasha: mapa.dasha.proximaAntardasha
            ? {
                nome: mapa.dasha.proximaAntardasha.nome,
                inicio: mapa.dasha.proximaAntardasha.inicio.toISOString(),
              }
            : null,
        }
      : null,
  };
}

export type MapaNatalJson = ReturnType<typeof mapaParaJson>;

export function diaParaJson(dia: DiaVedico) {
  const { fuso } = dia.local;
  const intervalo = (i: Intervalo) => ({
    inicio: i.inicio.toISOString(),
    fim: i.fim.toISOString(),
    horario: `${horaLocal(i.inicio, fuso)}–${horaLocal(i.fim, fuso)}`,
  });
  const p = dia.panchang;
  return {
    local: { rotulo: dia.local.rotulo, fuso },
    data: p.data,
    nascerDoSol: horaLocal(p.nascerDoSol, fuso),
    porDoSol: horaLocal(p.porDoSol, fuso),
    vara: p.vara.nome,
    tithi: {
      nome: p.tithi.nome,
      paksha: p.tithi.paksha,
      termina: horaLocal(p.tithi.termina, fuso),
      terminaEm: p.tithi.termina.toISOString(),
    },
    nakshatra: {
      nome: p.nakshatra.nome,
      termina: horaLocal(p.nakshatra.termina, fuso),
      terminaEm: p.nakshatra.termina.toISOString(),
    },
    yoga: { nome: p.yoga.nome, qualidade: p.yoga.qualidade },
    karana: { nome: p.karana.nome, qualidade: p.karana.qualidade },
    signoDaLua: p.signoDaLua.nome,
    brahmaMuhurta: intervalo(p.brahmaMuhurta),
    abhijitMuhurta: {
      ...intervalo(p.abhijitMuhurta),
      valido: p.abhijitMuhurta.valido,
    },
    rahuKalam: intervalo(p.rahuKalam),
    yamaganda: intervalo(p.yamaganda),
    gulikaKalam: intervalo(p.gulikaKalam),
    choghadiya: {
      dia: p.choghadiyaDoDia.map((c) => ({
        nome: c.nome,
        qualidade: c.qualidade,
        significado: c.significado,
        ...intervalo(c),
      })),
      noite: p.choghadiyaDaNoite.map((c) => ({
        nome: c.nome,
        qualidade: c.qualidade,
        significado: c.significado,
        ...intervalo(c),
      })),
    },
    pessoal: dia.pessoal
      ? {
          tara: dia.pessoal.tara,
          taraDepois: dia.pessoal.taraDepois
            ? {
                ...dia.pessoal.taraDepois,
                aPartirDe: horaLocal(dia.pessoal.taraDepois.aPartirDe, fuso),
              }
            : null,
          chandra: dia.pessoal.chandra,
        }
      : null,
  };
}

export type DiaVedicoJson = ReturnType<typeof diaParaJson>;
