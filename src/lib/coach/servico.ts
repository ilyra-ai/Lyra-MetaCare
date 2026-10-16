import { createHash, randomUUID } from 'node:crypto';

import { obterPlanoAtualizado } from '@/lib/ai/plano-do-dia';
import { LocalSemNascerDoSolError } from '@/lib/astrology/panchang';
import { dataLocal, partesLocais } from '@/lib/astrology/tempo';
import { HttpError } from '@/lib/http-error';
import { atualizarMetasESequencias } from '@/lib/metas/servico';
import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { criarNotificacao } from '@/lib/notificacoes/servico';
import { registrarErroInterno } from '@/lib/observability/log-seguro';
import { recursoHabilitado } from '@/lib/plans/service';

import {
  assinaturaDoProvedor,
  conexaoDoProvedor,
  lerProvedorDaPlataforma,
  provedorPublico,
} from '@/lib/ai/provedor-da-plataforma';
import { presetPorId } from '@/lib/ai/provedores-catalogo';

import { hashDasEntradas, lerContextoDoCoach } from './contexto';
import { gerarDiaLocal } from './gerador-local';
import { escreverLeituraComIa } from './leitura-ia';
import type { EntradaDaLeitura } from './leitura-vedica';
import type { BriefingDoDia, EstadoDoCoach, LeituraVedica } from './tipos';

/**
 * Serviço do coach diário: lê ou gera o "Seu dia" da pessoa, refaz quando as
 * entradas mudam (check-in, pulseira, cidade), cria as notificações do sino e
 * alimenta a rotina automática.
 */

/** Dias que os briefings ficam guardados. */
export const RETENCAO_DOS_BRIEFINGS_DIAS = 90;

/** Hora local a partir da qual a rotina prepara o dia (antes do Brahma Muhurta). */
export const HORA_DA_ROTINA = 3;

export const ROTA_DO_DIA = '/dia';

interface LinhaDoBriefing {
  content: unknown;
  inputs_hash: string;
  feedback: number | null;
}

/** Intervalo mínimo para tentar de novo a leitura pela IA após uma falha. */
const NOVA_TENTATIVA_DA_IA_MS = 30 * 60_000;

function briefingValido(valor: unknown): valor is BriefingDoDia {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    // Versão 3 (tarefa 49): os briefings guardados antes da linguagem
    // simples são refeitos na próxima leitura.
    (valor as { versao?: unknown }).versao === 3 &&
    Array.isArray((valor as { periodos?: unknown }).periodos) &&
    typeof (valor as { leitura?: unknown }).leitura === 'object'
  );
}

function diaAnterior(data: string) {
  const instante = new Date(`${data}T12:00:00Z`);
  instante.setUTCDate(instante.getUTCDate() - 1);
  return instante.toISOString().slice(0, 10);
}

/** Leitura da véspera, para o modelo não repetir o texto. */
async function leituraDeOntem(
  userId: string,
  data: string
): Promise<LeituraVedica | null> {
  const [linha] = await queryRows<{ content: unknown }>(
    `SELECT content FROM daily_briefings
      WHERE user_id = ? AND briefing_date = ? LIMIT 1`,
    [userId, diaAnterior(data)]
  );
  const ontem = linha ? conteudo(linha.content) : null;
  return briefingValido(ontem) ? ontem.leitura : null;
}

function conteudo(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;
  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
}

function feedbackDe(valor: number | null): 1 | -1 | null {
  return valor === 1 ? 1 : valor === -1 ? -1 : null;
}

function chaveDoAlerta(data: string, texto: string) {
  return `alerta:${data}:${createHash('sha256').update(texto).digest('hex').slice(0, 24)}`;
}

async function notificar(userId: string, briefing: BriefingDoDia) {
  await criarNotificacao({
    userId,
    tipo: 'coach_dia',
    titulo: 'Seu dia está pronto',
    corpo: briefing.manchete,
    link: ROTA_DO_DIA,
    chave: `dia:${briefing.data}`,
  });
  for (const alerta of briefing.alertas) {
    await criarNotificacao({
      userId,
      tipo: 'coach_alerta',
      titulo: alerta.texto,
      corpo: alerta.porque,
      link: ROTA_DO_DIA,
      chave: chaveDoAlerta(briefing.data, alerta.texto),
    });
  }
}

// Pedidos simultâneos do mesmo dia (cartão do painel, página e chat) esperam
// a mesma geração, em vez de chamar o modelo de IA várias vezes.
const geracoesEmAndamento = new Map<string, Promise<EstadoDoCoach>>();

/**
 * Briefing de hoje (data local do lugar do dia). Gera na primeira leitura do
 * dia e refaz quando as entradas mudaram desde a última geração. A leitura
 * védica é escrita pelo modelo de IA configurado pelo administrador (local
 * ou em nuvem) e, sem modelo ou em qualquer falha, pelo motor da Lyra.
 */
export async function obterBriefingDoDia(
  userId: string,
  agora: Date = new Date()
): Promise<EstadoDoCoach> {
  const chave = `${userId}:${agora.toISOString().slice(0, 13)}`;
  const andamento = geracoesEmAndamento.get(chave);
  if (andamento) return andamento;
  const promessa = prepararBriefingDoDia(userId, agora).finally(() =>
    geracoesEmAndamento.delete(chave)
  );
  geracoesEmAndamento.set(chave, promessa);
  return promessa;
}

async function prepararBriefingDoDia(
  userId: string,
  agora: Date
): Promise<EstadoDoCoach> {
  const resultado = await lerContextoDoCoach(userId, agora);
  if (resultado.estado === 'sem_local') {
    return { estado: 'sem_local', faltando: resultado.perfil.faltando };
  }
  const { contexto } = resultado;
  const provedor = await lerProvedorDaPlataforma();
  const conexao = conexaoDoProvedor(provedor);
  const hash = hashDasEntradas(contexto, assinaturaDoProvedor(provedor));

  const [existente] = await queryRows<LinhaDoBriefing>(
    `SELECT content, inputs_hash, feedback FROM daily_briefings
      WHERE user_id = ? AND briefing_date = ? LIMIT 1`,
    [userId, contexto.data]
  );
  const guardado = existente ? conteudo(existente.content) : null;
  if (existente && existente.inputs_hash === hash && briefingValido(guardado)) {
    // Com um modelo configurado, uma leitura que ficou com o motor da Lyra
    // (ex.: o servidor local estava desligado) é tentada de novo depois de
    // um intervalo.
    const tentarDeNovo =
      conexao !== null &&
      guardado.origem === 'local' &&
      agora.getTime() - new Date(guardado.geradoEm).getTime() >=
        NOVA_TENTATIVA_DA_IA_MS;
    if (!tentarDeNovo) {
      return {
        estado: 'pronto',
        briefing: guardado,
        feedback: feedbackDe(existente.feedback),
        atualizado: false,
      };
    }
  }

  let briefing: BriefingDoDia;
  let entradaDaLeitura: EntradaDaLeitura;
  try {
    ({ briefing, entradaDaLeitura } = gerarDiaLocal({ contexto, agora }));
  } catch (error) {
    if (error instanceof LocalSemNascerDoSolError) {
      return { estado: 'sem_nascer_do_sol' };
    }
    throw error;
  }

  if (conexao && provedor.modelo) {
    const publico = provedorPublico(provedor);
    const resultadoDaIa = await escreverLeituraComIa({
      conexao,
      autor: {
        provedor: presetPorId(provedor.preset)?.nome ?? provedor.tipo,
        modelo: provedor.modelo,
        local: publico.local,
      },
      entrada: entradaDaLeitura,
      base: briefing.leitura,
      ontem: await leituraDeOntem(userId, contexto.data),
    });
    if (resultadoDaIa.ok) {
      briefing = { ...briefing, origem: 'ia', leitura: resultadoDaIa.leitura };
    } else {
      console.error(
        `[coach:ia] Leitura do modelo descartada (${resultadoDaIa.motivo}); mantida a leitura da Lyra.`
      );
    }
  }

  await executeStatement(
    `INSERT INTO daily_briefings
       (id, user_id, briefing_date, content, source, inputs_hash)
     VALUES (?, ?, ?, ?, ?, ?)
     AS novo
     ON DUPLICATE KEY UPDATE
       content = novo.content,
       source = novo.source,
       inputs_hash = novo.inputs_hash`,
    [
      randomUUID(),
      userId,
      briefing.data,
      JSON.stringify(briefing),
      briefing.origem,
      hash,
    ]
  );
  await notificar(userId, briefing);

  return {
    estado: 'pronto',
    briefing,
    feedback: feedbackDe(existente?.feedback ?? null),
    atualizado: true,
  };
}

/** "Isso te ajudou?" do briefing de uma data (hoje ou até 7 dias atrás). */
export async function registrarFeedback(
  userId: string,
  data: string,
  util: boolean
) {
  const resultado = await executeStatement(
    `UPDATE daily_briefings
        SET feedback = ?, feedback_at = UTC_TIMESTAMP()
      WHERE user_id = ? AND briefing_date = ?
        AND briefing_date >= UTC_DATE() - INTERVAL 8 DAY`,
    [util ? 1 : -1, userId, data]
  );
  if (resultado.affectedRows === 0) {
    throw new HttpError('Não há briefing desta data para avaliar.', 404);
  }
}

interface PessoaDaRotina {
  id: string;
  role: string | null;
  fuso: string | null;
  ultima: string | null;
}

export interface ResultadoDaRotina {
  verificados: number;
  gerados: number;
  falhas: number;
  briefingsApagados: number;
}

/**
 * Rotina automática: prepara o briefing do dia de quem tem local definido e
 * ainda não tem o de hoje (a partir das 3 h locais) e apaga os briefings
 * mais antigos que a retenção. Falha de uma pessoa não interrompe as demais.
 */
export async function executarRotinaDoCoach(
  agora: Date = new Date(),
  limite = 500
): Promise<ResultadoDaRotina> {
  const pessoas = await queryRows<PessoaDaRotina>(
    `SELECT p.id, p.role,
            CASE WHEN p.residence_latitude IS NOT NULL
                 THEN p.residence_timezone ELSE p.birth_timezone END AS fuso,
            (SELECT MAX(b.briefing_date) FROM daily_briefings b
              WHERE b.user_id = p.id) AS ultima
       FROM profiles p
      WHERE p.onboarding_completed = TRUE
        AND ((p.residence_latitude IS NOT NULL AND p.residence_timezone IS NOT NULL)
          OR (p.birth_latitude IS NOT NULL AND p.birth_timezone IS NOT NULL))`
  );

  let gerados = 0;
  let falhas = 0;
  for (const pessoa of pessoas) {
    if (gerados + falhas >= limite) break;
    if (!pessoa.fuso) continue;
    let hoje: string;
    let hora: number;
    try {
      hoje = dataLocal(agora, pessoa.fuso);
      hora = partesLocais(agora, pessoa.fuso).hora;
    } catch {
      continue;
    }
    if (hora < HORA_DA_ROTINA) continue;
    if (pessoa.ultima && String(pessoa.ultima).slice(0, 10) >= hoje) continue;
    try {
      // O coach é o feed de dicas de IA do plano: sem ele, nada é gerado.
      if (
        !(await recursoHabilitado(
          pessoa.id,
          pessoa.role ?? 'user',
          'ai_tips_feed'
        ))
      ) {
        continue;
      }
      const estado = await obterBriefingDoDia(pessoa.id, agora);
      if (estado.estado === 'pronto') gerados += 1;
      // Virada do dia: prazos de metas vencidos e sequências que não
      // continuaram ontem são atualizados mesmo sem novo check-in.
      await atualizarMetasESequencias(pessoa.id, agora);
      // Plano de IA de quem já tem um: refeito para o novo dia.
      if (
        await recursoHabilitado(
          pessoa.id,
          pessoa.role ?? 'user',
          'ai_plan_generations'
        )
      ) {
        await obterPlanoAtualizado(pessoa.id, agora);
      }
    } catch (error) {
      falhas += 1;
      registrarErroInterno('coach:rotina', error);
    }
  }

  const apagados = await executeStatement(
    `DELETE FROM daily_briefings
      WHERE briefing_date < UTC_DATE() - INTERVAL ? DAY`,
    [RETENCAO_DOS_BRIEFINGS_DIAS]
  );

  return {
    verificados: pessoas.length,
    gerados,
    falhas,
    briefingsApagados: apagados.affectedRows,
  };
}
