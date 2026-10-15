import { z } from 'zod';

import { HttpError } from '@/lib/http-error';

import type { ConexaoDeIa } from './cliente-de-ia';
import type { ProvedorDaPlataforma } from './provedor-da-plataforma';
import { presetPorId, TIPOS_DE_PROVEDOR } from './provedores-catalogo';

/** Corpo das rotas administrativas do provedor de IA. */
export const provedorSchema = z
  .object({
    tipo: z.enum(TIPOS_DE_PROVEDOR),
    preset: z.string().trim().max(32).nullable(),
    baseUrl: z.string().trim().max(500).nullable(),
    modelo: z.string().trim().max(200).nullable(),
    /** Ausente: mantém a chave salva. `null`: apaga. Texto: nova chave. */
    chave: z.string().trim().max(500).nullable().optional(),
    tempoMaximoSegundos: z.number().int().min(10).max(600),
    temperatura: z.number().min(0).max(2),
  })
  .strict();

export type ProvedorInformado = z.infer<typeof provedorSchema>;

/**
 * Conexão para testar ou listar modelos com os valores do formulário (ainda
 * não salvos). Sem chave informada, usa a chave salva quando o provedor é o
 * mesmo: a chave nunca precisa voltar ao navegador.
 */
export function conexaoInformada(
  informado: ProvedorInformado,
  salvo: ProvedorDaPlataforma,
  exigirModelo: boolean
): ConexaoDeIa {
  if (informado.tipo === 'lyra_local') {
    throw new HttpError(
      'O motor da Lyra não usa modelo generativo: não há conexão para testar.',
      400
    );
  }
  const preset = presetPorId(informado.preset);
  if (informado.preset && !preset) {
    throw new HttpError('Provedor desconhecido.', 400);
  }
  const mesmoProvedor =
    salvo.tipo === informado.tipo && salvo.preset === informado.preset;
  const chave =
    informado.chave === undefined
      ? mesmoProvedor
        ? salvo.chave
        : null
      : informado.chave || null;
  const modelo = informado.modelo?.trim() ?? '';
  if (exigirModelo && !modelo) {
    throw new HttpError('Escolha ou informe o modelo.', 400);
  }
  return {
    tipo: informado.tipo,
    baseUrl: informado.baseUrl || null,
    modelo,
    chave,
    tempoMaximoSegundos: informado.tempoMaximoSegundos,
    temperatura: informado.temperatura,
  };
}
