import { NextResponse } from 'next/server';

import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const session = await requireServerSession();
    if (session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acesso restrito a administradores.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      models: [
        { id: 'lyra-local-orchestrator-v1', label: 'Lyra Local Orchestrator v1' },
        { id: 'lyra-local-readiness-v1', label: 'Readiness Local v1' },
        { id: 'lyra-local-chat-v1', label: 'Assistente Local v1' }
      ],
      message: 'Motores locais disponíveis e prontos para uso no backend MySQL/Next.js.'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Falha ao consultar motores locais.' },
      { status: 500 }
    );
  }
}
