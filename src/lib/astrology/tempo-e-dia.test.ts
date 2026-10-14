import { describe, expect, it } from 'vitest';

import { chandraBala, taraBala } from './dia-pessoal';
import { calcularPanchang } from './panchang';
import {
  dataLocal,
  deslocamentoEmMinutos,
  horaLocal,
  localParaUtc,
} from './tempo';

describe('horário local → UTC (fusos IANA com histórico de verão)', () => {
  it.each([
    // São Paulo tinha horário de verão em 1990 (UTC−2) e não tem mais.
    ['1990-12-01', '10:30', 'America/Sao_Paulo', '1990-12-01T12:30:00.000Z'],
    ['2026-10-12', '10:30', 'America/Sao_Paulo', '2026-10-12T13:30:00.000Z'],
    ['1985-07-15', '06:45', 'Asia/Kolkata', '1985-07-15T01:15:00.000Z'],
    // Horário inexistente (início do verão em Nova York): usa o deslocamento
    // anterior à mudança.
    ['2026-03-08', '02:30', 'America/New_York', '2026-03-08T07:30:00.000Z'],
    // Horário repetido (fim do verão): primeira ocorrência (EDT).
    ['2026-11-01', '01:30', 'America/New_York', '2026-11-01T05:30:00.000Z'],
  ])('%s %s em %s', (data, hora, fuso, esperado) => {
    expect(localParaUtc(data, hora, fuso).toISOString()).toBe(esperado);
  });

  it('data, hora e deslocamento locais', () => {
    const instante = new Date('2026-10-12T02:15:00Z');
    expect(dataLocal(instante, 'America/Sao_Paulo')).toBe('2026-10-11');
    expect(horaLocal(instante, 'America/Sao_Paulo')).toBe('23:15');
    expect(deslocamentoEmMinutos(instante, 'Asia/Kolkata')).toBe(330);
  });
});

describe('períodos do dia (São Paulo, segunda 12/10/2026)', () => {
  const p = calcularPanchang({
    data: '2026-10-12',
    latitude: -23.5475,
    longitude: -46.6361,
    fuso: 'America/Sao_Paulo',
  });
  const oitavo = (p.porDoSol.getTime() - p.nascerDoSol.getTime()) / 8;
  const parte = (n: number) => p.nascerDoSol.getTime() + (n - 1) * oitavo;

  it('Rahu Kalam (2ª parte), Yamaganda (4ª) e Gulika (6ª) na segunda', () => {
    expect(p.rahuKalam.inicio.getTime()).toBeCloseTo(parte(2), -2);
    expect(p.yamaganda.inicio.getTime()).toBeCloseTo(parte(4), -2);
    expect(p.gulikaKalam.inicio.getTime()).toBeCloseTo(parte(6), -2);
  });

  it('Choghadiya da segunda: dia começa em Amrit e a noite em Char', () => {
    expect(p.choghadiyaDoDia.map((c) => c.nome)).toEqual([
      'Amrit',
      'Kaal',
      'Shubh',
      'Rog',
      'Udveg',
      'Char',
      'Labh',
      'Amrit',
    ]);
    expect(p.choghadiyaDaNoite.map((c) => c.nome)).toEqual([
      'Char',
      'Rog',
      'Kaal',
      'Labh',
      'Udveg',
      'Shubh',
      'Amrit',
      'Char',
    ]);
    expect(p.choghadiyaDoDia[0].inicio).toEqual(p.nascerDoSol);
    expect(p.choghadiyaDoDia[7].fim.getTime()).toBeCloseTo(
      p.porDoSol.getTime(),
      -1
    );
    expect(p.choghadiyaDaNoite[7].fim.getTime()).toBeCloseTo(
      p.proximoNascerDoSol.getTime(),
      -1
    );
  });

  it('Abhijit no meio do dia e Brahma Muhurta antes do nascer', () => {
    const meioDoDia = (p.nascerDoSol.getTime() + p.porDoSol.getTime()) / 2;
    expect(p.abhijitMuhurta.inicio.getTime()).toBeLessThan(meioDoDia);
    expect(p.abhijitMuhurta.fim.getTime()).toBeGreaterThan(meioDoDia);
    expect(p.abhijitMuhurta.valido).toBe(true);
    expect(p.brahmaMuhurta.fim.getTime()).toBeLessThan(p.nascerDoSol.getTime());
  });

  it('fim do tithi e do nakshatra depois do nascer do sol', () => {
    expect(p.tithi.termina.getTime()).toBeGreaterThan(p.nascerDoSol.getTime());
    expect(p.nakshatra.termina.getTime()).toBeGreaterThan(
      p.nascerDoSol.getTime()
    );
    expect(p.tithi.nome).toBe('Dvitiya');
    expect(p.nakshatra.nome).toBe('Swati');
  });
});

describe('dia pessoal', () => {
  it('Tara Bala conta a partir do nakshatra natal', () => {
    // Natal Krittika (2); dia Swati (14): 13ª contagem → 4ª tara (Kshema).
    expect(taraBala(2, 14)).toMatchObject({
      nome: 'Kshema',
      qualidade: 'favoravel',
      nakshatraDoDia: 'Swati',
    });
    expect(taraBala(10, 10).nome).toBe('Janma');
    expect(taraBala(0, 6).nome).toBe('Naidhana');
  });

  it('Chandrashtama: Lua do dia na 8ª casa da Lua natal', () => {
    // Lua natal em Touro (1); Lua em Sagitário (8) = 8ª casa.
    expect(chandraBala(1, 8)).toMatchObject({
      casa: 8,
      chandrashtama: true,
      qualidade: 'desfavoravel',
    });
    expect(chandraBala(1, 6)).toMatchObject({
      casa: 6,
      qualidade: 'favoravel',
    });
    expect(chandraBala(1, 2).qualidade).toBe('neutro');
  });
});
