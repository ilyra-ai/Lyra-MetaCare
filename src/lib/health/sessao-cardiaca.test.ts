import { describe, expect, it } from 'vitest';

import { AgregadorDaSessao, lerMedicaoDeFrequencia } from './sessao-cardiaca';

function medicao(bytes: number[]) {
  return new DataView(Uint8Array.from(bytes).buffer);
}

describe('leitura da medição de frequência cardíaca (GATT 0x2A37)', () => {
  it('FC em 8 bits sem RR', () => {
    expect(lerMedicaoDeFrequencia(medicao([0x00, 72]))).toEqual({
      fc: 72,
      rr: [],
    });
  });

  it('FC em 16 bits com RR', () => {
    // RR 1024/1024 s = 1000 ms e 820/1024 s.
    const leitura = lerMedicaoDeFrequencia(
      medicao([0x11, 0x48, 0x00, 0x00, 0x04, 0x34, 0x03])
    );
    expect(leitura.fc).toBe(72);
    expect(leitura.rr[0]).toBe(1000);
    expect(leitura.rr[1]).toBeCloseTo(800.78, 2);
  });

  it('pula a energia gasta antes dos RR (bit 3)', () => {
    // flags 0x18: FC 8 bits + energia (2 bytes: 0x10 0x00) + RR 1000 ms.
    expect(
      lerMedicaoDeFrequencia(medicao([0x18, 60, 0x10, 0x00, 0x00, 0x04]))
    ).toEqual({ fc: 60, rr: [1000] });
  });

  it('recusa medição truncada', () => {
    expect(() => lerMedicaoDeFrequencia(medicao([0x01, 0x48]))).toThrow();
  });
});

describe('agregação da sessão', () => {
  it('sessão curta demais não gera resumo', () => {
    const agregador = new AgregadorDaSessao();
    for (let i = 0; i < 4; i++) {
      agregador.adicionar({ fc: 70, rr: [] }, i * 1000);
    }
    expect(agregador.resumo()).toBeNull();
  });

  it('calcula extremos, média, repouso (menor média de 60 s) e RMSSD', () => {
    const agregador = new AgregadorDaSessao();
    // 3 minutos, 1 amostra por segundo: 1º minuto a 80 bpm, 2º a 60, 3º a 90.
    for (let s = 0; s <= 180; s++) {
      const fc = s < 60 ? 80 : s < 120 ? 60 : 90;
      // RR alternando 1000 e 1010 ms: RMSSD = 10 ms.
      agregador.adicionar({ fc, rr: [s % 2 === 0 ? 1000 : 1010] }, s * 1000);
    }
    const resumo = agregador.resumo();
    expect(resumo).not.toBeNull();
    expect(resumo?.minutos).toBe(3);
    expect(resumo?.fcMinima).toBe(60);
    expect(resumo?.fcMaxima).toBe(90);
    expect(resumo?.fcRepousoEstimada).toBe(60);
    expect(resumo?.rmssd).toBe(10);
    // (60×80 + 60×60 + 61×90) / 181 amostras = 76,74.
    expect(resumo?.fcMedia).toBe(76.7);
  });

  it('descarta RR implausível e artefato acima de 20%', () => {
    const agregador = new AgregadorDaSessao();
    const rr = [1000, 1010, 2500, 1000, 1500, 1010];
    for (let s = 0; s < 40; s++) {
      agregador.adicionar({ fc: 60, rr: s === 0 ? rr : [] }, s * 1000);
    }
    // Diferenças válidas: 1000→1010 (10) e 1500→1010 é artefato; 2500 zera.
    expect(agregador.rmssdAoVivo()).toBeNull();
    agregador.zerar();
    expect(agregador.totalDeAmostras).toBe(0);
  });

  it('sem minuto completo não estima o repouso', () => {
    const agregador = new AgregadorDaSessao();
    for (let s = 0; s < 30; s++) {
      agregador.adicionar({ fc: 70, rr: [] }, s * 1000);
    }
    expect(agregador.resumo()?.fcRepousoEstimada).toBeNull();
    expect(agregador.resumo()?.rmssd).toBeNull();
  });
});
