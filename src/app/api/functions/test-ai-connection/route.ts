import { NextResponse } from 'next/server';

import { generateLocalAssistantReply } from '@/lib/ai/chat-engine';
import { generateLocalWellnessPlan } from '@/lib/ai/plan-engine';
import { calculateLongevityScores } from '@/lib/ai/score-engine';
import { getAstrologicalContext } from '@/lib/astrology/engine';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const session = await requireServerSession();
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores.' },
        { status: 403 }
      );
    }

    const astrology = getAstrologicalContext();
    const scoreCheck = calculateLongevityScores({
      hrv_ms: 58,
      sleep_duration_minutes: 455,
      deep_sleep_minutes: 110,
      resting_heart_rate: 57,
      active_minutes: 52,
      steps: 9180,
      vo2_max: 41,
      sedentary_hours: 6.5,
      protein_g_per_kg: 1.6,
      water_liters: 2.7,
      blood_glucose_mgdl: 92,
      sodium_potassium_ratio: 1.8,
      stress_score: 28,
    });
    const planCheck = generateLocalWellnessPlan({
      metrics: {
        hrv_ms: 58,
        sleep_duration_minutes: 455,
        steps: 9180,
        blood_glucose_mgdl: 92,
        weight_kg: 74,
      },
      astrology,
      goals: ['sleep_better', 'manage_blood_glucose'],
    });
    const assistantCheck = generateLocalAssistantReply('resumo do meu dia', {
      profile: {
        first_name: 'Admin',
        goals: ['sleep_better', 'manage_blood_glucose'],
      },
      latestMetric: {
        steps: 9180,
        sleep_duration_minutes: 455,
        hrv_ms: 58,
        readiness_score: 82,
        blood_glucose_mgdl: 92,
      },
      astrology,
    });

    return NextResponse.json({
      success: true,
      models: [
        {
          id: 'lyra-local-orchestrator-v1',
          label: 'Lyra Local Orchestrator v1',
        },
        { id: 'lyra-local-readiness-v1', label: 'Readiness Local v1' },
        { id: 'lyra-local-chat-v1', label: 'Assistente Local v1' },
      ],
      checks: {
        score_engine: {
          ok: Number.isFinite(scoreCheck.longevityScore),
          longevity_score: scoreCheck.longevityScore,
          readiness_score: scoreCheck.readinessScore,
        },
        plan_engine: {
          ok: Boolean(
            planCheck.summary && Object.keys(planCheck.pillars).length > 0
          ),
          summary: planCheck.summary,
        },
        chat_engine: {
          ok: assistantCheck.length > 0,
          preview: assistantCheck,
        },
      },
      message:
        'Motores locais testados em runtime e prontos para uso no backend MySQL/Next.js.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Falha ao consultar motores locais.',
      },
      { status: 500 }
    );
  }
}
