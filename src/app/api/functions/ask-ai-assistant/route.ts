import { NextResponse } from 'next/server';

import { generateLocalAssistantReply } from '@/lib/ai/chat-engine';
import { getAstrologicalContext } from '@/lib/astrology/engine';
import { getHttpErrorStatus } from '@/lib/http-error';
import { queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { consumeUsageQuota } from '@/lib/plans/service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const { query, userApiKey } = (await request.json()) as { query: string; userApiKey?: string };
    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Pergunta obrigatória.' },
        { status: 400 }
      );
    }

    const [profile] = await queryRows<{
      first_name: string | null;
      goals: string | null;
      birth_date: string | null;
      birth_time: string | null;
      birth_location: string | null;
    }>(
      'SELECT first_name, goals, birth_date, birth_time, birth_location FROM profiles WHERE id = ? LIMIT 1',
      [session.user.id]
    );
    const [latestMetric] = await queryRows<{
      steps: number | null;
      sleep_duration_minutes: number | null;
      hrv_ms: number | null;
      readiness_score: number | null;
      blood_glucose_mgdl: number | null;
    }>(
      `
        SELECT steps, sleep_duration_minutes, hrv_ms, readiness_score, blood_glucose_mgdl
        FROM daily_metrics
        WHERE user_id = ?
        ORDER BY date DESC
        LIMIT 1
      `,
      [session.user.id]
    );

    const fallbackResponse = generateLocalAssistantReply(query, {
      profile: profile
        ? {
            first_name: profile.first_name,
            goals: profile.goals ? JSON.parse(profile.goals) : null,
          }
        : null,
      latestMetric: latestMetric ?? null,
      astrology: getAstrologicalContext(new Date(), profile ?? undefined),
    });

    let finalResponse = fallbackResponse;

    // Se o usuário providenciou a chave on-device (BYOK - Bring Your Own Key)
    if (userApiKey && userApiKey.trim() !== '') {
      try {
        const aiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const systemPrompt = `Você é o Lyra MetaCare, um assistente médico integrativo (PhD). 
Abaixo está a análise determinística Védica-Quântica sobre os biomarcadores reais do usuário:
---
${fallbackResponse}
---
Use esta análise como base para responder à pergunta do usuário de forma humana, empática e clinicamente embasada. Responda APENAS com a sua resposta direta.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${userApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'user', parts: [{ text: query }] }
              ],
              generationConfig: { temperature: 0.3 }
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const llmText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (llmText) {
            finalResponse = llmText;
          }
        }
      } catch (err) {
        console.error('Falha na integração LLM transparente (BYOK):', err);
        // Fallback natural para a engine determinística
      }
    }

    await consumeUsageQuota({
      session,
      featureKey: 'ai_chat_messages',
    });

    return NextResponse.json({ response: finalResponse });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Falha no assistente local.',
      },
      { status: getHttpErrorStatus(error) }
    );
  }
}
