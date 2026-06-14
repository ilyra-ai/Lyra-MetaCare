import { describe, it, expect } from 'vitest';

import { generateProactiveActions, type AgentContext } from './agent-engine';
import type { EarlyWarningResult } from '@/lib/health/early-warning-engine';

const emptyEarlyWarning: EarlyWarningResult = {
  signals: [],
  baselineDays: 7,
  hasBaseline: true,
  overall: 'estavel',
};

function baseContext(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    firstName: 'Ana',
    readinessScore: 80,
    earlyWarning: emptyEarlyWarning,
    biologicalAge: null,
    cycle: null,
    today: {
      steps: 9000,
      active_minutes: 40,
      water_liters: 2.5,
      meditation_minutes: 10,
      sleep_duration_minutes: 460,
    },
    ...overrides,
  };
}

describe('generateProactiveActions', () => {
  it('retorna reforço de equilíbrio quando tudo está alinhado', () => {
    const actions = generateProactiveActions(baseContext());
    expect(actions).toHaveLength(1);
    expect(actions[0].category).toBe('equilibrio');
    expect(actions[0].severity).toBe('positivo');
  });

  it('prioriza sinais de detecção precoce no topo', () => {
    const earlyWarning: EarlyWarningResult = {
      ...emptyEarlyWarning,
      overall: 'atencao',
      signals: [
        {
          key: 'immune_response',
          title: 'Possível resposta imunológica precoce',
          severity: 'alerta',
          action: 'desacelere',
          actionLabel: 'Desacelere',
          detail: 'Sinais combinados.',
          contributors: ['FC +6 bpm', 'HRV -20%'],
        },
      ],
    };
    const actions = generateProactiveActions(baseContext({ earlyWarning }));
    expect(actions[0].id).toBe('early_immune_response');
    expect(actions[0].severity).toBe('critico');
    expect(actions[0].priority).toBeGreaterThanOrEqual(90);
  });

  it('gera ação de ciclo alinhada à fase quando rastreável', () => {
    const actions = generateProactiveActions(
      baseContext({
        cycle: {
          trackable: true,
          lifeStage: 'ciclo_regular',
          cycleDay: 9,
          cycleLength: 28,
          periodLength: 5,
          phase: 'folicular',
          phaseLabel: 'Fase folicular',
          phaseEmoji: '🌒',
          daysUntilNextPeriod: 20,
          nextPeriodDate: '2026-06-29',
          ovulationDay: 14,
          fertileWindowStartDay: 9,
          fertileWindowEndDay: 15,
          isFertileToday: true,
          recommendation: {
            energy: 'alta',
            training: 'treino intenso',
            nutrition: 'proteína',
            sleep: 'regular',
            tone: 'motivador',
          },
          summary: 'Dia 9',
        },
      })
    );
    expect(actions.some((a) => a.category === 'ciclo')).toBe(true);
  });

  it('alerta quando a idade biológica está acima da real', () => {
    const actions = generateProactiveActions(
      baseContext({
        biologicalAge: {
          chronologicalAge: 40,
          biologicalAge: 43,
          ageDelta: 3,
          paceOfAging: 1.15,
          vitalityScore: 38,
          drivers: [
            {
              key: 'hrv',
              label: 'HRV',
              impactYears: -1,
              status: 'otimo',
              detail: '70 ms',
            },
            {
              key: 'glucose',
              label: 'Glicose',
              impactYears: 3,
              status: 'critico',
              detail: '140 mg/dL',
            },
          ],
          confidence: 'media',
          availableMarkers: 4,
          methodology: 'proxy',
        },
      })
    );
    const bioAction = actions.find((a) => a.id === 'bioage_focus');
    expect(bioAction).toBeDefined();
    expect(bioAction?.detail).toContain('Glicose');
  });

  it('sugere movimento e hidratação quando estão baixos', () => {
    const actions = generateProactiveActions(
      baseContext({
        today: {
          steps: 2000,
          active_minutes: 5,
          water_liters: 0.8,
          meditation_minutes: 0,
          sleep_duration_minutes: 460,
        },
      })
    );
    expect(actions.some((a) => a.category === 'movimento')).toBe(true);
    expect(actions.some((a) => a.category === 'hidratacao')).toBe(true);
    expect(actions.some((a) => a.category === 'mente')).toBe(true);
  });

  it('respeita o limite de ações retornadas', () => {
    const actions = generateProactiveActions(
      baseContext({
        readinessScore: 30,
        today: {
          steps: 1000,
          active_minutes: 2,
          water_liters: 0.5,
          meditation_minutes: 0,
          sleep_duration_minutes: 300,
        },
      }),
      3
    );
    expect(actions.length).toBeLessThanOrEqual(3);
  });
});
