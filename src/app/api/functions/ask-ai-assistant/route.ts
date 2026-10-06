import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  buildSkillsContext,
  generateLocalAssistantReply,
  type AiSkillDocument,
} from '@/lib/ai/chat-engine';
import { getAstrologicalContext } from '@/lib/astrology/engine';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { listaDeTextos } from '@/lib/json-values';
import { queryRows } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { consumeUsageQuota } from '@/lib/plans/service';

export const runtime = 'nodejs';

const perguntaSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'Pergunta obrigatória.')
    .max(2000, 'A pergunta pode ter no máximo 2000 caracteres.'),
  // Chave do Gemini do próprio usuário (BYOK); vazia = só o motor local.
  userApiKey: z.string().trim().max(200).optional(),
});

const TEMPO_MAXIMO_LLM_MS = 20_000;

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const { query, userApiKey } = await lerJson(request, perguntaSchema);

    // A cota é consumida antes de qualquer processamento: quem já atingiu o
    // limite não aciona banco nem LLM (antes, o consumo acontecia só no fim).
    await consumeUsageQuota({ session, featureKey: 'ai_chat_messages' });

    const [profile] = await queryRows<{
      first_name: string | null;
      goals: unknown;
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

    // Documentos/skills configurados no admin que orientam o que a IA deve
    // saber, fazer e executar no app. Apenas os ativos, por prioridade.
    const skills = await queryRows<AiSkillDocument>(
      `
        SELECT title, category, content
        FROM ai_knowledge_documents
        WHERE is_active = TRUE
        ORDER BY priority DESC, created_at ASC
        LIMIT 50
      `
    );

    const fallbackResponse = generateLocalAssistantReply(query, {
      profile: profile
        ? {
            first_name: profile.first_name,
            goals: listaDeTextos(profile.goals),
          }
        : null,
      latestMetric: latestMetric ?? null,
      astrology: getAstrologicalContext(new Date(), profile ?? undefined),
      skills,
    });

    let finalResponse = fallbackResponse;

    // BYOK: a chave vai no cabeçalho x-goog-api-key (nunca na URL, que aparece
    // em logs de proxy); o motor local é a resposta se o LLM falhar.
    if (userApiKey) {
      try {
        const aiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const skillsContext = buildSkillsContext(skills);
        const systemPrompt = `Você é o Lyra MetaCare, um assistente de bem-estar integrativo. Não substitui avaliação profissional de saúde.
${
  skillsContext
    ? `${skillsContext}
---
`
    : ''
}Abaixo está a análise determinística Védica-Quântica sobre os biomarcadores reais do usuário:
---
${fallbackResponse}
---
Use esta análise como base e siga estritamente as habilidades, skills e treinamentos configurados acima para responder à pergunta do usuário de forma humana, empática e embasada. Responda APENAS com a sua resposta direta.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(aiModel)}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': userApiKey,
            },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'user', parts: [{ text: query }] },
              ],
              generationConfig: { temperature: 0.3 },
            }),
            signal: AbortSignal.timeout(TEMPO_MAXIMO_LLM_MS),
          }
        );

        if (geminiRes.ok) {
          const geminiData = (await geminiRes.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };
          const llmText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (llmText) {
            finalResponse = llmText;
          }
        } else {
          console.error(
            `[ask-ai-assistant] Gemini respondeu HTTP ${geminiRes.status}; usando o motor local.`
          );
        }
      } catch (err) {
        console.error(
          '[ask-ai-assistant] Falha na chamada ao Gemini; usando o motor local:',
          err instanceof Error ? err.message : err
        );
      }
    }

    return NextResponse.json({ response: finalResponse });
  } catch (error) {
    return respostaDeErro(error, 'Falha no assistente local.');
  }
}
