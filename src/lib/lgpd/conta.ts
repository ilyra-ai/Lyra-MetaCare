import { rm } from 'node:fs/promises';

import type { PoolConnection, RowDataPacket } from 'mysql2/promise';

import { getStripeProviderName } from '@/lib/billing/config';
import { HttpError } from '@/lib/http-error';
import {
  TIPOS_DE_CONSENTIMENTO,
  VERSAO_POR_TIPO,
  type TipoDeConsentimento,
} from '@/lib/lgpd/documentos';
import { executeStatement, queryRows, withTransaction } from '@/lib/mysql/pool';
import { registrarErroInterno } from '@/lib/observability/log-seguro';
import { STORAGE_BUCKETS, resolveStoragePath } from '@/lib/storage/local';

// ---------------------------------------------------------------------------
// Consentimento
// ---------------------------------------------------------------------------

export interface RegistroDeConsentimento {
  consent_type: TipoDeConsentimento;
  document_version: string;
  accepted_at: string;
}

/**
 * Registra o aceite da versão vigente de cada documento. Repetir o mesmo
 * aceite não duplica nada (índice único por usuário, tipo e versão).
 */
export async function registrarConsentimentos(options: {
  userId: string;
  tipos: readonly TipoDeConsentimento[];
  userAgent: string | null;
  connection?: PoolConnection;
}) {
  for (const tipo of options.tipos) {
    const parametros = [
      crypto.randomUUID(),
      options.userId,
      tipo,
      VERSAO_POR_TIPO[tipo],
      options.userAgent ? options.userAgent.slice(0, 255) : null,
    ];
    const sql = `
      INSERT IGNORE INTO consent_records (
        id, user_id, consent_type, document_version, user_agent
      )
      VALUES (?, ?, ?, ?, ?)
    `;
    if (options.connection) {
      await options.connection.execute(sql, parametros);
    } else {
      await executeStatement(sql, parametros);
    }
  }
}

export async function listarConsentimentos(
  userId: string
): Promise<RegistroDeConsentimento[]> {
  const linhas = await queryRows<RegistroDeConsentimento>(
    `
      SELECT consent_type, document_version, accepted_at
      FROM consent_records
      WHERE user_id = ?
      ORDER BY accepted_at ASC, consent_type ASC
    `,
    [userId]
  );
  return linhas.filter((linha) =>
    (TIPOS_DE_CONSENTIMENTO as readonly string[]).includes(linha.consent_type)
  );
}

// ---------------------------------------------------------------------------
// Histórico de compras do titular e registros fiscais (administrador)
// ---------------------------------------------------------------------------

export interface CompraDoTitular {
  id: string;
  invoice_number: string | null;
  description: string | null;
  plan_key: string | null;
  billing_interval: string | null;
  currency_code: string;
  amount_total: number;
  amount_tax: number;
  paid_at: string;
  hosted_invoice_url: string | null;
}

export async function listarComprasDoTitular(
  userId: string
): Promise<CompraDoTitular[]> {
  const linhas = await queryRows<CompraDoTitular>(
    `
      SELECT
        id, invoice_number, description, plan_key, billing_interval,
        currency_code, amount_total, amount_tax, paid_at, hosted_invoice_url
      FROM fiscal_records
      WHERE user_id = ?
      ORDER BY paid_at DESC
    `,
    [userId]
  );
  return linhas.map((linha) => ({
    ...linha,
    amount_total: Number(linha.amount_total),
    amount_tax: Number(linha.amount_tax),
  }));
}

export interface RegistroFiscal {
  id: string;
  provider: string;
  external_invoice_id: string;
  invoice_number: string | null;
  // Indica só se a conta ainda existe: o administrador vê o dado fiscal, não
  // o perfil nem a saúde da pessoa.
  conta_ativa: boolean;
  external_customer_id: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_tax_id_type: string | null;
  buyer_tax_id: string | null;
  buyer_address: unknown;
  description: string | null;
  plan_key: string | null;
  billing_interval: string | null;
  currency_code: string;
  amount_subtotal: number;
  amount_tax: number;
  amount_total: number;
  period_start: string | null;
  period_end: string | null;
  paid_at: string;
  created_at: string;
}

export async function listarRegistrosFiscais(options: {
  page: number;
  pageSize: number;
  de?: string | null;
  ate?: string | null;
}) {
  const filtros: string[] = [];
  const parametros: unknown[] = [];
  if (options.de) {
    filtros.push('paid_at >= ?');
    parametros.push(`${options.de} 00:00:00`);
  }
  if (options.ate) {
    filtros.push('paid_at <= ?');
    parametros.push(`${options.ate} 23:59:59`);
  }
  const where = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

  const [linhas, totais] = await Promise.all([
    queryRows<RowDataPacket>(
      `
        SELECT
          id, provider, external_invoice_id, invoice_number,
          user_id IS NOT NULL AS conta_ativa,
          external_customer_id, buyer_name, buyer_email, buyer_tax_id_type,
          buyer_tax_id, buyer_address, description, plan_key, billing_interval,
          currency_code, amount_subtotal, amount_tax, amount_total,
          period_start, period_end, paid_at, created_at
        FROM fiscal_records
        ${where}
        ORDER BY paid_at DESC, id ASC
        LIMIT ? OFFSET ?
      `,
      [...parametros, options.pageSize, options.page * options.pageSize]
    ),
    queryRows<{ currency_code: string; registros: number; total: number }>(
      `
        SELECT currency_code, COUNT(*) AS registros, SUM(amount_total) AS total
        FROM fiscal_records
        ${where}
        GROUP BY currency_code
        ORDER BY currency_code
      `,
      parametros
    ),
  ]);

  const registros: RegistroFiscal[] = linhas.map((linha) => ({
    id: String(linha.id),
    provider: String(linha.provider),
    external_invoice_id: String(linha.external_invoice_id),
    invoice_number: linha.invoice_number ?? null,
    conta_ativa: Number(linha.conta_ativa) === 1,
    external_customer_id: linha.external_customer_id ?? null,
    buyer_name: linha.buyer_name ?? null,
    buyer_email: linha.buyer_email ?? null,
    buyer_tax_id_type: linha.buyer_tax_id_type ?? null,
    buyer_tax_id: linha.buyer_tax_id ?? null,
    buyer_address: linha.buyer_address ?? null,
    description: linha.description ?? null,
    plan_key: linha.plan_key ?? null,
    billing_interval: linha.billing_interval ?? null,
    currency_code: String(linha.currency_code),
    amount_subtotal: Number(linha.amount_subtotal),
    amount_tax: Number(linha.amount_tax),
    amount_total: Number(linha.amount_total),
    period_start: linha.period_start ?? null,
    period_end: linha.period_end ?? null,
    paid_at: String(linha.paid_at),
    created_at: String(linha.created_at),
  }));

  return {
    registros,
    total: totais.reduce((soma, linha) => soma + Number(linha.registros), 0),
    totaisPorMoeda: totais.map((linha) => ({
      moeda: linha.currency_code,
      registros: Number(linha.registros),
      total: Number(linha.total),
    })),
    page: options.page,
    pageSize: options.pageSize,
  };
}

// ---------------------------------------------------------------------------
// Portabilidade (art. 18, II e V): exportação dos dados do titular
// ---------------------------------------------------------------------------

// Tabelas com dados do titular, pela coluna que aponta para a conta. A senha
// (hash) nunca é exportada.
const TABELAS_DO_TITULAR = [
  ['daily_metrics', 'user_id'],
  ['goals', 'user_id'],
  ['habits', 'user_id'],
  ['ai_plans', 'user_id'],
  ['appointments', 'user_id'],
  ['professionals', 'user_id'],
  ['user_assessments', 'user_id'],
  ['user_streaks', 'user_id'],
  ['daily_briefings', 'user_id'],
  ['daily_reflections', 'user_id'],
  ['breathing_sessions', 'user_id'],
  ['user_notifications', 'user_id'],
  ['feature_usage_counters', 'user_id'],
  ['subscription_audit_events', 'user_id'],
] as const;

export async function exportarDadosDoTitular(userId: string) {
  const contas = await queryRows<RowDataPacket>(
    'SELECT id, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  if (!contas[0]) {
    throw new HttpError('Conta não encontrada.', 404);
  }

  const perfil = await queryRows<RowDataPacket>(
    'SELECT * FROM profiles WHERE id = ? LIMIT 1',
    [userId]
  );

  const tabelas: Record<string, RowDataPacket[]> = {};
  for (const [tabela, coluna] of TABELAS_DO_TITULAR) {
    tabelas[tabela] = await queryRows<RowDataPacket>(
      `SELECT * FROM ${tabela} WHERE ${coluna} = ? ORDER BY created_at ASC`,
      [userId]
    );
  }

  const assinaturas = await queryRows<RowDataPacket>(
    `
      SELECT us.*, sp.plan_key, sp.name AS plan_name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON sp.id = us.plan_id
      WHERE us.user_id = ?
      ORDER BY us.created_at ASC
    `,
    [userId]
  );
  const clientesDeCobranca = await queryRows<RowDataPacket>(
    `
      SELECT provider, external_customer_id, email_snapshot, created_at
      FROM billing_customers
      WHERE user_id = ?
    `,
    [userId]
  );

  return {
    formato: 'lyra-metacare/exportacao-lgpd',
    versao: 1,
    gerado_em: new Date().toISOString(),
    conta: contas[0],
    perfil: perfil[0] ?? null,
    consentimentos: await listarConsentimentos(userId),
    compras: await listarComprasDoTitular(userId),
    assinaturas,
    clientes_de_cobranca: clientesDeCobranca,
    ...tabelas,
  };
}

// ---------------------------------------------------------------------------
// Eliminação (art. 18, VI): exclusão da conta com retenção fiscal
// ---------------------------------------------------------------------------

/**
 * Exclui a conta e todos os dados pessoais dela. Ficam só os registros
 * fiscais (obrigação legal), desvinculados da conta pela FK
 * `ON DELETE SET NULL`, sem nenhum dado de saúde.
 *
 * Recusas:
 * - assinatura paga ativa e renovável: excluir a conta não cancela a
 *   cobrança na Stripe, então ela precisa ser cancelada antes (portal);
 * - último administrador: a plataforma ficaria sem ninguém para geri-la.
 */
export async function excluirConta(userId: string) {
  await withTransaction(async (connection) => {
    const [contas] = await connection.query<RowDataPacket[]>(
      `
        SELECT u.id, p.role
        FROM users u
        LEFT JOIN profiles p ON p.id = u.id
        WHERE u.id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [userId]
    );
    const conta = contas[0];
    if (!conta) {
      throw new HttpError('Conta não encontrada.', 404);
    }

    const [assinaturasPagas] = await connection.query<RowDataPacket[]>(
      `
        SELECT id
        FROM user_subscriptions
        WHERE user_id = ?
          AND source = ?
          AND status = 'active'
          AND cancel_at_period_end = 0
          AND (ended_at IS NULL OR ended_at > UTC_TIMESTAMP())
        LIMIT 1
      `,
      [userId, getStripeProviderName()]
    );
    if (assinaturasPagas.length > 0) {
      throw new HttpError(
        'Há uma assinatura paga ativa. Cancele a renovação no portal de cobrança antes de excluir a conta, para não haver nova cobrança.',
        409
      );
    }

    if (conta.role === 'admin') {
      const [admins] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS total FROM profiles WHERE role = 'admin' FOR UPDATE"
      );
      if (Number(admins[0]?.total ?? 0) <= 1) {
        throw new HttpError(
          'Esta é a única conta de administrador. Promova outra pessoa a administradora antes de excluí-la.',
          409
        );
      }
    }

    // Perfil, métricas, metas, hábitos, planos, agenda, avaliações,
    // assinaturas, consentimentos e contadores saem em cascata; os registros
    // fiscais ficam, com user_id = NULL.
    await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
  });

  await removerArquivosDoTitular(userId);
}

/** Apaga as imagens enviadas pela pessoa (pasta `<bucket>/<userId>`). */
async function removerArquivosDoTitular(userId: string) {
  for (const bucket of STORAGE_BUCKETS) {
    try {
      const { absolute } = resolveStoragePath(bucket, [userId]);
      await rm(absolute, { recursive: true, force: true });
    } catch (erro: unknown) {
      // A conta já foi excluída; uma falha aqui fica registrada para limpeza
      // manual e não pode desfazer a exclusão.
      registrarErroInterno(`lgpd: remover arquivos de ${bucket}`, erro);
    }
  }
}
