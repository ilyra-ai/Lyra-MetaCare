import { timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

import { executarRotinaCompleta } from '@/lib/coach/rotina';
import { HttpError } from '@/lib/http-error';
import { respostaDeErro } from '@/lib/http/api';

export const runtime = 'nodejs';

/** Tamanho mínimo do segredo do agendador externo. */
const TAMANHO_MINIMO_DO_SEGREDO = 32;

function segredoConfigurado() {
  const segredo = process.env.COACH_ROTINA_SEGREDO?.trim() ?? '';
  return segredo.length >= TAMANHO_MINIMO_DO_SEGREDO ? segredo : null;
}

function mesmoSegredo(recebido: string, esperado: string) {
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Disparo da rotina diária do coach por um agendador externo (cron da
 * hospedagem), para ambientes sem processo Node.js contínuo. Exige
 * `Authorization: Bearer <COACH_ROTINA_SEGREDO>`; sem o segredo configurado
 * a rota não existe (404).
 */
export async function POST(request: Request) {
  try {
    const segredo = segredoConfigurado();
    if (!segredo) {
      throw new HttpError('Rota não encontrada.', 404);
    }
    const cabecalho = request.headers.get('authorization') ?? '';
    const recebido = cabecalho.startsWith('Bearer ')
      ? cabecalho.slice('Bearer '.length).trim()
      : '';
    if (!recebido || !mesmoSegredo(recebido, segredo)) {
      throw new HttpError('Não autorizado.', 401);
    }
    const resultado = await executarRotinaCompleta();
    return NextResponse.json(resultado);
  } catch (error) {
    return respostaDeErro(error, 'Falha ao executar a rotina do coach.');
  }
}
