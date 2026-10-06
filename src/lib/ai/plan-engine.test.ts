import { describe, expect, it } from 'vitest';

import { getAstrologicalContext } from '@/lib/astrology/engine';

import { generateLocalWellnessPlan } from './plan-engine';

const ASTROLOGIA = getAstrologicalContext(new Date('2026-10-06T12:00:00Z'));

function plano(
  metricas: Partial<{
    hrv_ms: number | null;
    sleep_duration_minutes: number | null;
    steps: number | null;
    blood_glucose_mgdl: number | null;
    weight_kg: number | null;
  }>,
  goals: string[] = []
) {
  return generateLocalWellnessPlan({
    metrics: {
      hrv_ms: null,
      sleep_duration_minutes: null,
      steps: null,
      blood_glucose_mgdl: null,
      weight_kg: null,
      ...metricas,
    },
    astrology: ASTROLOGIA,
    goals,
  });
}

function titulos(
  resultado: ReturnType<typeof plano>,
  pilar: 'nutrition' | 'exercise' | 'sleep'
) {
  return resultado.pillars[pilar].items.map((item) => item.title);
}

describe('plano local de bem-estar', () => {
  it('prioriza recuperação com HRV baixa ou sono curto', () => {
    const recuperacao = plano({ hrv_ms: 32, sleep_duration_minutes: 360 });
    expect(titulos(recuperacao, 'exercise')).toContain('Reduzir intensidade');
    expect(titulos(recuperacao, 'sleep')).toContain(
      'Janela de sono prioritária'
    );
    expect(recuperacao.summary).toMatch(/prioriza recuperação/);

    const pronto = plano({ hrv_ms: 70, sleep_duration_minutes: 480 });
    expect(titulos(pronto, 'exercise')).toContain('Treino principal do dia');
    expect(titulos(pronto, 'sleep')).toContain('Preservar regularidade');
  });

  it('modula a carga glicêmica acima de 110 mg/dL', () => {
    expect(titulos(plano({ blood_glucose_mgdl: 130 }), 'nutrition')).toContain(
      'Modular carga glicêmica'
    );
    expect(titulos(plano({ blood_glucose_mgdl: 95 }), 'nutrition')).toContain(
      'Ancorar proteína cedo'
    );
  });

  it('acrescenta o monitoramento de glicose quando é objetivo do usuário', () => {
    expect(
      titulos(
        plano({ blood_glucose_mgdl: 95 }, ['manage_blood_glucose']),
        'nutrition'
      )
    ).toContain('Monitorar glicose de contexto');
    // Com glicose já alta, a orientação principal cobre o objetivo.
    expect(
      titulos(
        plano({ blood_glucose_mgdl: 140 }, ['manage_blood_glucose']),
        'nutrition'
      )
    ).not.toContain('Monitorar glicose de contexto');
  });

  it('métricas ausentes não disparam alertas', () => {
    const vazio = plano({});
    expect(titulos(vazio, 'exercise')).toEqual([
      'Treino principal do dia',
      'Consolidar volume',
    ]);
  });

  it('inclui o contexto lunar no resumo e ids únicos nos itens', () => {
    const resultado = plano({ steps: 3000 });
    expect(resultado.summary).toContain(ASTROLOGIA.moonSign);
    expect(resultado.summary).toContain(ASTROLOGIA.nakshatra);
    const ids = Object.values(resultado.pillars).flatMap((pilar) =>
      pilar.items.map((item) => item.id)
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(titulos(resultado, 'exercise')).toContain('Quebrar sedentarismo');
  });
});
