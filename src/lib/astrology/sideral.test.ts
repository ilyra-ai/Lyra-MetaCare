import { describe, expect, it } from 'vitest';

import { calcularMapaNatal } from './mapa-natal';
import { calcularPanchang } from './panchang';
import {
  ascendenteSideral,
  ayanamshaLahiri,
  longitudeSideral,
} from './sideral';

/**
 * Valores de referência calculados com o Swiss Ephemeris 2.10.03
 * (pyswisseph, efemérides Moshier, `SIDM_LAHIRI`, Rahu = nodo médio, Lagna
 * por `houses_ex` sideral), fonte independente do astronomy-engine usado no
 * app. Tolerâncias: 0,02° nas longitudes, 0,01° no ayanamsha, 0,05° no
 * Lagna e 2 minutos no nascer e pôr do sol.
 */
const REFERENCIAS = {
  sp_1990: {
    instante: new Date('1990-12-01T12:30:00Z'),
    latitude: -23.5475,
    longitude: -46.6361,
    ayanamsha: 23.73019974,
    lagna: 283.2392,
    planetas: {
      sol: 225.3188,
      lua: 33.796,
      marte: 40.2534,
      mercurio: 245.6554,
      jupiter: 109.8593,
      venus: 232.7243,
      saturno: 268.6392,
      rahu: 277.0138,
    },
    retrogrados: ['marte', 'jupiter'],
  },
  delhi_1985: {
    instante: new Date('1985-07-15T01:15:00Z'),
    latitude: 28.6519,
    longitude: 77.2315,
    ayanamsha: 23.65503486,
    lagna: 103.3264,
    planetas: {
      sol: 88.8557,
      lua: 54.0396,
      marte: 89.7877,
      mercurio: 115.3686,
      jupiter: 290.9045,
      venus: 45.8079,
      saturno: 207.9095,
      rahu: 21.168,
    },
    retrogrados: ['jupiter', 'saturno'],
  },
} as const;

function diferencaAngular(a: number, b: number) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

describe.each(Object.entries(REFERENCIAS))(
  'posições sidéreas (%s) contra o Swiss Ephemeris',
  (_nome, ref) => {
    it('ayanamsha Lahiri', () => {
      expect(
        Math.abs(ayanamshaLahiri(ref.instante) - ref.ayanamsha)
      ).toBeLessThan(0.01);
    });

    it.each(Object.entries(ref.planetas))('%s', (graha, esperado) => {
      const calculado = longitudeSideral(
        graha as keyof typeof ref.planetas,
        ref.instante
      );
      expect(diferencaAngular(calculado, esperado)).toBeLessThan(0.02);
    });

    it('Lagna', () => {
      expect(
        diferencaAngular(
          ascendenteSideral(ref.instante, ref.latitude, ref.longitude),
          ref.lagna
        )
      ).toBeLessThan(0.05);
    });
  }
);

describe('mapa natal', () => {
  it('São Paulo, 01/12/1990 10:30 (horário de verão, UTC−2)', () => {
    const mapa = calcularMapaNatal(
      {
        data: '1990-12-01',
        hora: '10:30',
        latitude: -23.5475,
        longitude: -46.6361,
        fuso: 'America/Sao_Paulo',
      },
      new Date('2026-10-12T12:00:00Z')
    );
    expect(mapa.nascimentoUtc.toISOString()).toBe('1990-12-01T12:30:00.000Z');
    // Lagna 283,24° = Capricórnio 13°; Lua 33,80° = Touro 3°48', Krittika
    // (26°40' a 40°) pada 3 (33°20' a 36°40').
    expect(mapa.lagna).toMatchObject({
      nomeDoSigno: 'Capricórnio',
      regente: 'saturno',
    });
    expect(mapa.lua).toMatchObject({
      nomeDoSigno: 'Touro',
      nomeDoNakshatra: 'Krittika',
      pada: 3,
      casa: 5,
    });
    expect(mapa.senhorDoNakshatraNatal).toBe('sol');
    // Vimshottari com a Lua do Swiss Ephemeris (mesma convenção de 365,25
    // dias): Rahu de 16/09/2010 a 15/09/2028, Lua de 27/02/2026 a 29/08/2027.
    // A diferença de 0,008° na Lua desloca as datas em cerca de 1 dia:
    // tolerância de 2 dias.
    const perto = (d: Date | undefined, esperado: string) =>
      expect(
        Math.abs((d?.getTime() ?? 0) - Date.parse(`${esperado}T12:00:00Z`))
      ).toBeLessThan(2 * 86_400_000);
    expect(mapa.dasha?.mahadasha.graha).toBe('rahu');
    perto(mapa.dasha?.mahadasha.inicio, '2010-09-16');
    perto(mapa.dasha?.mahadasha.fim, '2028-09-15');
    expect(mapa.dasha?.antardasha.graha).toBe('lua');
    perto(mapa.dasha?.antardasha.inicio, '2026-02-27');
    perto(mapa.dasha?.antardasha.fim, '2027-08-29');
    expect(mapa.dasha?.proximaAntardasha?.graha).toBe('marte');
    const retrogrados = mapa.planetas
      .filter((p) => p.retrogrado && p.graha !== 'rahu' && p.graha !== 'ketu')
      .map((p) => p.graha);
    expect(retrogrados.sort()).toEqual(
      [...REFERENCIAS.sp_1990.retrogrados].sort()
    );
    const ketu = mapa.planetas.find((p) => p.graha === 'ketu');
    const rahu = mapa.planetas.find((p) => p.graha === 'rahu');
    expect(
      diferencaAngular((rahu?.longitude ?? 0) + 180, ketu?.longitude ?? 0)
    ).toBeLessThan(1e-9);
  });

  it('sem hora de nascimento não calcula Lagna nem casas', () => {
    const mapa = calcularMapaNatal({
      data: '1985-07-15',
      hora: null,
      latitude: 28.6519,
      longitude: 77.2315,
      fuso: 'Asia/Kolkata',
    });
    expect(mapa.horaConhecida).toBe(false);
    expect(mapa.lagna).toBeNull();
    expect(mapa.planetas.every((p) => p.casa === null)).toBe(true);
  });
});

describe('Panchang contra o Swiss Ephemeris', () => {
  it.each([
    {
      nome: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.6361,
      fuso: 'America/Sao_Paulo',
      nascer: '2026-10-12T08:36:07Z',
      por: '2026-10-12T21:10:14Z',
      tithi: 1,
      nakshatra: 14,
      yoga: 0,
      karana: 3,
    },
    {
      nome: 'Nova Délhi',
      latitude: 28.6519,
      longitude: 77.2315,
      fuso: 'Asia/Kolkata',
      nascer: '2026-10-12T00:49:46Z',
      por: '2026-10-12T12:25:04Z',
      tithi: 1,
      nakshatra: 14,
      yoga: 0,
      karana: 2,
    },
  ])('$nome em 12/10/2026', (ref) => {
    const p = calcularPanchang({
      data: '2026-10-12',
      latitude: ref.latitude,
      longitude: ref.longitude,
      fuso: ref.fuso,
    });
    expect(
      Math.abs(p.nascerDoSol.getTime() - new Date(ref.nascer).getTime())
    ).toBeLessThan(120_000);
    expect(
      Math.abs(p.porDoSol.getTime() - new Date(ref.por).getTime())
    ).toBeLessThan(120_000);
    expect(p.tithi.indice).toBe(ref.tithi);
    expect(p.nakshatra.indice).toBe(ref.nakshatra);
    expect(p.yoga.indice).toBe(ref.yoga);
    expect(p.karana.indice).toBe(ref.karana);
    // 12/10/2026 é segunda-feira.
    expect(p.vara.indice).toBe(1);
  });
});
