import { NextResponse } from 'next/server';
import { z } from 'zod';

import { cidadePorId } from '@/lib/geo/cidades';
import { HttpError } from '@/lib/http-error';
import { lerJson, respostaDeErro } from '@/lib/http/api';
import { executeStatement } from '@/lib/mysql/pool';
import { requireServerSession } from '@/lib/mysql/server-auth';

export const runtime = 'nodejs';

const pedidoSchema = z
  .object({
    tipo: z.enum(['nascimento', 'moradia']),
    // null limpa o local escolhido.
    cidadeId: z.number().int().positive().nullable(),
  })
  .strict();

const COLUNAS = {
  nascimento: {
    rotulo: 'birth_location',
    id: 'birth_city_id',
    latitude: 'birth_latitude',
    longitude: 'birth_longitude',
    fuso: 'birth_timezone',
  },
  moradia: {
    rotulo: 'residence_location',
    id: 'residence_city_id',
    latitude: 'residence_latitude',
    longitude: 'residence_longitude',
    fuso: 'residence_timezone',
  },
} as const;

/**
 * Grava o local de nascimento ou de moradia do próprio perfil a partir da
 * base de cidades: nome exibido, coordenadas e fuso vêm do servidor, nunca do
 * navegador, e mudam sempre juntos.
 */
export async function PATCH(request: Request) {
  try {
    const session = await requireServerSession();
    const { tipo, cidadeId } = await lerJson(request, pedidoSchema);
    const colunas = COLUNAS[tipo];

    const cidade = cidadeId === null ? null : cidadePorId(cidadeId);
    if (cidadeId !== null && !cidade) {
      throw new HttpError('Cidade não encontrada na base de cidades.', 404);
    }

    const resultado = await executeStatement(
      `UPDATE profiles
          SET ${colunas.rotulo} = ?, ${colunas.id} = ?, ${colunas.latitude} = ?,
              ${colunas.longitude} = ?, ${colunas.fuso} = ?,
              updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [
        cidade?.rotulo ?? null,
        cidade?.id ?? null,
        cidade?.latitude ?? null,
        cidade?.longitude ?? null,
        cidade?.fuso ?? null,
        session.user.id,
      ]
    );
    if (resultado.affectedRows === 0) {
      throw new HttpError('Perfil não encontrado.', 404);
    }

    return NextResponse.json({
      tipo,
      local: cidade
        ? { id: cidade.id, rotulo: cidade.rotulo, fuso: cidade.fuso }
        : null,
    });
  } catch (error) {
    return respostaDeErro(error, 'Falha ao gravar o local.');
  }
}
