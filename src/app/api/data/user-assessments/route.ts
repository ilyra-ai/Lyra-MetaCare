import { NextResponse } from 'next/server';

import { getHttpErrorStatus } from '@/lib/http-error';
import { executeQuery } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';
import { AssessmentType, calculateWHO5Score, classifyNPS } from '@/lib/kpi/assessment-engine';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await requireServerSession();
    
    const body = await request.json();
    const { type, payload } = body as {
      type: AssessmentType;
      payload: any;
    };

    if (!type || !payload) {
      return NextResponse.json({ error: 'Payload ou tipo inválido.' }, { status: 400 });
    }

    let scoreValue = 0;
    let notes = payload.notes || '';
    let rawResponses = JSON.stringify(payload);

    if (type === 'mood') {
      scoreValue = Number(payload.moodValue);
    } else if (type === 'who5') {
      const answers: number[] = Object.values(payload.answers).map(Number);
      const result = calculateWHO5Score(answers);
      scoreValue = result.percentageScore; // Save percentage
      notes = result.insight;
    } else if (type === 'nps') {
      scoreValue = Number(payload.score);
      const classification = classifyNPS(scoreValue);
      rawResponses = JSON.stringify({ ...payload, classification });
    } else {
      return NextResponse.json({ error: 'Tipo de avaliação desconhecido.' }, { status: 400 });
    }

    await executeQuery(
      `
      INSERT INTO user_assessments (
        user_id,
        assessment_type,
        score_value,
        raw_responses,
        notes,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        session.user.id,
        type,
        scoreValue,
        rawResponses,
        notes
      ]
    );

    return NextResponse.json({ success: true, scoreValue, notes });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao salvar a avaliação.' },
      { status: getHttpErrorStatus(error) }
    );
  }
}
