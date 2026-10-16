import { z } from 'zod';

import { HttpError } from '@/lib/http-error';

import type { ConexaoDeIa } from './cliente-de-ia';
import {
  POSICOES_DA_ORDEM,
  type ConfiguracaoDeIa,
} from './provedores-da-plataforma';
import { presetPorId } from './provedores-catalogo';

const modeloSchema = z.string().trim().min(1).max(200);

/** Um provedor como vem do formulário (tarefa 54). */
export const provedorSchema = z
  .object({
    preset: z.string().trim().min(1).max(32),
    baseUrl: z.string().trim().max(500).nullable(),
    /** Ausente: mantém a chave salva. `null`: apaga. Texto: nova chave. */
    chave: z.string().trim().max(500).nullable().optional(),
    modelos: z.array(modeloSchema).max(50),
    tempoMaximoSegundos: z.number().int().min(10).max(600),
    temperatura: z.number().min(0).max(2),
  })
  .strict();

export type ProvedorInformado = z.infer<typeof provedorSchema>;

const eloSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('lyra') }).strict(),
  z
    .object({
      tipo: z.literal('modelo'),
      preset: z.string().trim().min(1).max(32),
      modelo: modeloSchema,
    })
    .strict(),
]);

/** Corpo do PUT /api/admin/ia: os provedores escolhidos e a ordem de uso. */
export const configuracaoSchema = z
  .object({
    provedores: z.array(provedorSchema).max(30),
    ordem: z.array(eloSchema).min(1).max(POSICOES_DA_ORDEM),
  })
  .strict();

/** Corpo das rotas de listar modelos e testar: um provedor e um modelo. */
export const provedorParaTesteSchema = provedorSchema
  .omit({ modelos: true })
  .extend({ modelo: modeloSchema.nullable().optional() })
  .strict();

export type ProvedorParaTeste = z.infer<typeof provedorParaTesteSchema>;

/**
 * Conexão para testar ou listar modelos com os valores do formulário (ainda
 * não salvos). Sem chave informada, usa a chave salva do mesmo provedor: a
 * chave nunca precisa voltar ao navegador.
 */
export function conexaoInformada(
  informado: ProvedorParaTeste,
  salvo: ConfiguracaoDeIa,
  exigirModelo: boolean
): ConexaoDeIa {
  const preset = presetPorId(informado.preset);
  if (!preset) {
    throw new HttpError('Provedor desconhecido.', 400);
  }
  if (preset.tipo === 'lyra_local') {
    throw new HttpError(
      'O motor da Lyra não usa modelo generativo: não há conexão para testar.',
      400
    );
  }
  const provedorSalvo = salvo.provedores.find(
    (p) => p.preset === informado.preset
  );
  const chave =
    informado.chave === undefined
      ? (provedorSalvo?.chave ?? null)
      : informado.chave || null;
  const modelo = informado.modelo?.trim() ?? '';
  if (exigirModelo && !modelo) {
    throw new HttpError('Escolha ou informe o modelo.', 400);
  }
  return {
    tipo: preset.tipo,
    baseUrl:
      preset.tipo === 'openai_compativel' ? informado.baseUrl || null : null,
    modelo,
    chave,
    tempoMaximoSegundos: informado.tempoMaximoSegundos,
    temperatura: informado.temperatura,
  };
}
