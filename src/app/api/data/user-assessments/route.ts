import { NextResponse } from 'next/server';
import { z } from 'zod';

import { lerJson, respostaDeErro } from '@/lib/http/api';
import { executeStatement } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { calculateWHO5Score, classifyNPS } from '@/lib/kpi/assessment-engine';

export const runtime = 'nodejs';

// Valores numéricos chegam como string (RadioGroup) ou número; ambos são
// aceitos e convertidos, mas apenas dentro das escalas válidas de cada
// instrumento.
const escala = (min: number, max: number) =>
  z.coerce.number<number | string>().int().min(min).max(max);

const assessmentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('mood'),
    payload: z.object({
      moodValue: escala(1, 5),
      notes: z.string().trim().max(2000).optional(),
    }),
  }),
  z.object({
    type: z.literal('who5'),
    payload: z.object({
      // Cinco respostas (perguntas 1 a 5) na escala WHO-5 de 0 a 5. No Zod 4,
      // um record com chaves enum é exaustivo: todas as 5 são obrigatórias e
      // chaves extras são rejeitadas.
      answers: z.record(z.enum(['1', '2', '3', '4', '5']), escala(0, 5)),
      notes: z.string().trim().max(2000).optional(),
    }),
  }),
  z.object({
    type: z.literal('nps'),
    payload: z.object({
      score: escala(0, 10),
      notes: z.string().trim().max(2000).optional(),
    }),
  }),
]);

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    const assessment = await lerJson(request, assessmentSchema);

    let scoreValue: number;
    let notes = assessment.payload.notes ?? '';
    let rawResponses: unknown = assessment.payload;

    switch (assessment.type) {
      case 'mood':
        scoreValue = assessment.payload.moodValue;
        break;
      case 'who5': {
        const answers = ['1', '2', '3', '4', '5'].map(
          (questionId) =>
            assessment.payload.answers[
              questionId as keyof typeof assessment.payload.answers
            ]
        );
        const result = calculateWHO5Score(answers);
        scoreValue = result.percentageScore;
        notes = result.insight;
        break;
      }
      case 'nps':
        scoreValue = assessment.payload.score;
        rawResponses = {
          ...assessment.payload,
          classification: classifyNPS(scoreValue),
        };
        break;
    }

    await executeStatement(
      `
      INSERT INTO user_assessments (
        id,
        user_id,
        assessment_type,
        score_value,
        raw_responses,
        notes,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        crypto.randomUUID(),
        session.user.id,
        assessment.type,
        scoreValue,
        JSON.stringify(rawResponses),
        notes,
      ]
    );

    return NextResponse.json({ success: true, scoreValue, notes });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao salvar a avaliação.');
  }
}
