import { NextResponse } from 'next/server';

import { generateLocalAssistantReply } from '@/lib/ai/chat-engine';
import { ErroDoProvedor, gerarTexto } from '@/lib/ai/cliente-de-ia';
import { generateLocalWellnessPlan } from '@/lib/ai/plan-engine';
import { montarCadeia } from '@/lib/ai/cadeia-de-modelos';
import { lerConfiguracaoDeIa } from '@/lib/ai/provedores-da-plataforma';
import { calculateLongevityScores } from '@/lib/ai/score-engine';
import { getAstrologicalContext } from '@/lib/astrology/engine';
import { mensagemDeErro, statusDeErro } from '@/lib/http/api';
import { requireAdminSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

/**
 * Testa, um a um, os modelos da ordem de uso salva (a mesma do "Seu dia"),
 * até o motor da Lyra (tarefa 54). `ok` diz se a cadeia responde: algum
 * modelo respondeu, ou não há modelo e o motor da Lyra é quem escreve.
 */
async function testarCadeiaSalva() {
  const cadeia = montarCadeia(await lerConfiguracaoDeIa());
  const modelos = [];
  for (const elo of cadeia) {
    if (elo.tipo === 'lyra') break;
    const inicio = performance.now();
    try {
      const resposta = await gerarTexto(elo.conexao, {
        sistema: 'Responda apenas com a palavra OK.',
        usuario: 'Teste de conexão administrativa.',
        maximoDeTokens: 16,
      });
      modelos.push({
        provedor: elo.autor.provedor,
        modelo: elo.autor.modelo,
        ok: true,
        milissegundos: Math.round(performance.now() - inicio),
        resposta: resposta.slice(0, 120),
      });
    } catch (erro) {
      modelos.push({
        provedor: elo.autor.provedor,
        modelo: elo.autor.modelo,
        ok: false,
        milissegundos: Math.round(performance.now() - inicio),
        erro:
          erro instanceof ErroDoProvedor
            ? erro.message
            : 'Falha inesperada ao consultar o provedor.',
      });
    }
  }
  return {
    configurado: modelos.length > 0,
    ok: modelos.length === 0 || modelos.some((m) => m.ok),
    modelos,
    mensagem:
      modelos.length === 0
        ? 'Só o motor da Lyra: nenhum modelo generativo antes dele na ordem de uso.'
        : modelos.some((m) => m.ok)
          ? 'A ordem de uso responde; os modelos com falha são pulados.'
          : 'Nenhum modelo da ordem respondeu: o motor da Lyra responde no lugar.',
  };
}

/**
 * Autoteste administrativo: executa os motores locais com um conjunto fixo
 * de entradas de referência (para conferir que calculam em runtime) e testa
 * o provedor de IA salvo.
 */
export async function POST() {
  try {
    await requireAdminSession();

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
        provedor: await testarCadeiaSalva(),
      },
      message:
        'Motores locais testados em runtime e modelos da ordem de uso consultados em tempo real.',
    });
  } catch (error) {
    // 401/403 preservados (antes toda falha virava 500).
    return NextResponse.json(
      {
        success: false,
        error: mensagemDeErro(error, 'Falha ao consultar os motores locais.'),
      },
      { status: statusDeErro(error) }
    );
  }
}
