import { describe, expect, it } from 'vitest';

import { getAstrologicalContext } from './engine';

// Referências astronômicas públicas (efemérides da NASA/USNO):
// - Lua Cheia de 03/03/2026 às 11:38 UTC (eclipse lunar total);
// - Lua Nova de 17/02/2026 às 12:01 UTC (eclipse solar anular).
// O motor usa o astronomy-engine para as posições e a ayanamsha de Lahiri.

describe('contexto astrológico', () => {
  it('calcula a ayanamsha de Lahiri (≈ 23,85° em J2000, crescendo ~50,3"/ano)', () => {
    const j2000 = getAstrologicalContext(new Date(Date.UTC(2000, 0, 1, 12)));
    expect(j2000.ayanamshaDegrees).toBeCloseTo(23.853, 3);
    const em2026 = getAstrologicalContext(new Date(Date.UTC(2026, 0, 1, 12)));
    expect(em2026.ayanamshaDegrees - j2000.ayanamshaDegrees).toBeCloseTo(
      26 * 0.01397,
      2
    );
  });

  it('reconhece a Lua Cheia (fase ≈ 0,5, Purnima) e a Lua Nova (fase ≈ 0)', () => {
    // Quatro horas antes do instante exato da Lua Cheia: último tithi do
    // Shukla Paksha (Purnima).
    const cheia = getAstrologicalContext(new Date('2026-03-03T07:38:00Z'));
    expect(cheia.moonPhase).toBeGreaterThan(0.48);
    expect(cheia.moonPhase).toBeLessThan(0.5);
    expect(cheia.tithi).toBe('Purnima (Shukla Paksha)');
    expect(cheia.paksha).toBe('Shukla Paksha');
    expect(cheia.impactOnHealth.sleep).toMatch(/Lua Cheia/);

    const nova = getAstrologicalContext(new Date('2026-02-17T08:00:00Z'));
    expect(nova.moonPhase).toBeGreaterThan(0.98);
    expect(nova.tithi).toBe('Amavasya (Krishna Paksha)');
    expect(nova.impactOnHealth.sleep).toMatch(/Lua Nova/);
  });

  it('sempre devolve signos, nakshatra e tithi válidos', () => {
    const inicio = Date.UTC(2026, 0, 1);
    for (let dia = 0; dia < 60; dia += 1) {
      const contexto = getAstrologicalContext(
        new Date(inicio + dia * 86_400_000 + 7 * 3_600_000)
      );
      expect(contexto.moonPhase).toBeGreaterThanOrEqual(0);
      expect(contexto.moonPhase).toBeLessThan(1);
      expect(contexto.moonSign).toBeTruthy();
      expect(contexto.sunSign).toBeTruthy();
      expect(contexto.nakshatra).toBeTruthy();
      expect(contexto.tithi).toMatch(/\((Shukla|Krishna) Paksha\)$/);
    }
  });

  it('segue as sankrantis siderais (Peixes ~14/03, Áries ~14/04)', () => {
    expect(
      getAstrologicalContext(new Date('2026-03-05T12:00:00Z')).sunSign
    ).toBe('Aquário');
    expect(
      getAstrologicalContext(new Date('2026-03-25T12:00:00Z')).sunSign
    ).toBe('Peixes');
    expect(
      getAstrologicalContext(new Date('2026-04-25T12:00:00Z')).sunSign
    ).toBe('Áries');
  });

  it('só informa a dasha quando há o instante de nascimento em UTC', () => {
    expect(getAstrologicalContext(new Date()).currentDasha).toBeUndefined();
    expect(
      getAstrologicalContext(new Date(), {
        birth_timestamp_utc: '1990-05-20T07:30:00Z',
      }).currentDasha
    ).toContain('1990-05-20T07:30:00Z');
  });
});
