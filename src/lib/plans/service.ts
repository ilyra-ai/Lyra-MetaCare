import type { PoolConnection, RowDataPacket } from 'mysql2/promise';

import { HttpError } from '@/lib/http-error';
import { queryRows, withTransaction } from '@/lib/mysql/pool';
import {
  AdminUserListItem,
  AdminUserListResponse,
  AccountSubscriptionSummary,
  PlanFeatureAccess,
  PlanFeatureKey,
  PlanKey,
  PlanMatrixPlan,
  PlanMatrixResponse,
  PlanMatrixUpdateInput,
  SubscriptionPlanSummary,
  UserSubscriptionAssignment,
} from '@/types/subscription';
import { AppSession } from '@/types/app-session';

type QueryableConnection = PoolConnection;

interface CurrentSubscriptionRow {
  subscription_id: string;
  status: string;
  billing_interval: string;
  source: string;
  starts_at: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: number;
  plan_id: string;
  plan_key: PlanKey;
  plan_name: string;
  tagline: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  currency_code: string;
  highlight_text: string | null;
  accent_from: string;
  accent_to: string;
  display_order: number;
  is_active: number;
  is_public: number;
  external_product_id: string | null;
  external_monthly_price_id: string | null;
  external_annual_price_id: string | null;
}

interface EntitlementRow {
  feature_key: PlanFeatureKey;
  feature_name: string;
  feature_description: string;
  category: PlanFeatureAccess['category'];
  feature_type: PlanFeatureAccess['featureType'];
  meter_kind: PlanFeatureAccess['meterKind'];
  unit: string | null;
  enabled: number;
  quota_value: number | null;
  reset_interval: string | null;
  sort_order: number;
}

interface PlanMatrixRow {
  plan_id: string;
  plan_key: PlanKey;
  plan_name: string;
  tagline: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  currency_code: string;
  highlight_text: string | null;
  accent_from: string;
  accent_to: string;
  display_order: number;
  is_active: number;
  is_public: number;
  external_product_id: string | null;
  external_monthly_price_id: string | null;
  external_annual_price_id: string | null;
  feature_key: PlanFeatureKey;
  feature_name: string;
  feature_description: string;
  category: PlanFeatureAccess['category'];
  feature_type: PlanFeatureAccess['featureType'];
  meter_kind: PlanFeatureAccess['meterKind'];
  unit: string | null;
  enabled: number;
  quota_value: number | null;
  reset_interval: string | null;
  sort_order: number;
}

interface UsageCounterRow {
  id: string;
  used_value: number;
}

interface UserIdentityRow {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

interface AdminUserListRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  onboarding_completed: number;
  created_at: string;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  activity_level: number | null;
  goals: string | string[] | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  role: string;
  plan_key: PlanKey | null;
  plan_name: string | null;
  billing_interval: string | null;
  subscription_status: string | null;
}

type AdminUserSortColumn = 'created_at' | 'first_name' | 'email';

const ADMIN_USER_SORT_COLUMNS: Record<AdminUserSortColumn, string> = {
  created_at: 'p.created_at',
  first_name: 'p.first_name',
  email: 'p.email',
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function formatUtcDate(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function formatUtcDateTime(date: Date) {
  return `${formatUtcDate(date)} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function toPlanSummary(row: CurrentSubscriptionRow): SubscriptionPlanSummary {
  return {
    id: row.plan_id,
    key: row.plan_key,
    name: row.plan_name,
    tagline: row.tagline,
    description: row.description,
    monthlyPrice: Number(row.monthly_price),
    annualPrice: Number(row.annual_price),
    currencyCode: row.currency_code,
    highlightText: row.highlight_text,
    accentFrom: row.accent_from,
    accentTo: row.accent_to,
    displayOrder: Number(row.display_order),
    isActive: row.is_active === 1,
    isPublic: row.is_public === 1,
    externalProductId: row.external_product_id,
    externalMonthlyPriceId: row.external_monthly_price_id,
    externalAnnualPriceId: row.external_annual_price_id,
  };
}

function parseJsonArrayValue(value: string | string[] | null) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : null;
  } catch {
    return null;
  }
}

async function queryWithConnection<TRow extends object>(
  connection: QueryableConnection,
  sql: string,
  params: readonly unknown[] = []
): Promise<TRow[]> {
  const [rows] = await connection.query<RowDataPacket[]>(
    sql,
    params as unknown[]
  );
  return rows as TRow[];
}

function buildPeriodBounds(resetInterval: string | null) {
  if (resetInterval !== 'monthly') {
    return null;
  }

  const now = new Date();
  const periodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
  );
  const periodEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0)
  );

  return {
    periodStart: formatUtcDateTime(periodStart),
    periodEnd: formatUtcDateTime(periodEnd),
  };
}

async function fetchCurrentSubscriptionRow(
  userId: string,
  connection?: QueryableConnection
): Promise<CurrentSubscriptionRow | null> {
  const sql = `
    SELECT
      us.id AS subscription_id,
      us.status,
      us.billing_interval,
      us.source,
      us.starts_at,
      us.current_period_start,
      us.current_period_end,
      us.cancel_at_period_end,
      p.id AS plan_id,
      p.plan_key,
      p.name AS plan_name,
      p.tagline,
      p.description,
      p.monthly_price,
      p.annual_price,
      p.currency_code,
      p.highlight_text,
      p.accent_from,
      p.accent_to,
      p.display_order,
      p.is_active,
      p.is_public,
      p.external_product_id,
      p.external_monthly_price_id,
      p.external_annual_price_id
    FROM user_subscriptions us
    INNER JOIN subscription_plans p ON p.id = us.plan_id
    WHERE us.user_id = ?
      AND us.status = 'active'
      AND (us.ended_at IS NULL OR us.ended_at > UTC_TIMESTAMP())
    ORDER BY us.current_period_end DESC, us.created_at DESC
    LIMIT 1
  `;

  const rows = connection
    ? await queryWithConnection<CurrentSubscriptionRow>(connection, sql, [
        userId,
      ])
    : await queryRows<CurrentSubscriptionRow>(sql, [userId]);

  return rows[0] ?? null;
}

async function insertSubscription(
  connection: QueryableConnection,
  userId: string,
  planId: string,
  source: string,
  billingInterval = 'monthly'
) {
  const now = formatUtcDateTime(new Date());
  const periodEnd =
    billingInterval === 'annual'
      ? `DATE_ADD('${now}', INTERVAL 1 YEAR)`
      : `DATE_ADD('${now}', INTERVAL 1 MONTH)`;

  await connection.execute(
    `
      INSERT INTO user_subscriptions (
        id,
        user_id,
        plan_id,
        status,
        billing_interval,
        source,
        starts_at,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        metadata
      )
      VALUES (
        ?, ?, ?, 'active', ?, ?, ?, ?, ${periodEnd}, FALSE, JSON_OBJECT('origin', ?)
      )
    `,
    [
      crypto.randomUUID(),
      userId,
      planId,
      billingInterval,
      source,
      now,
      now,
      source,
    ]
  );
}

async function fetchPlanIdByKey(
  planKey: PlanKey,
  connection?: QueryableConnection
): Promise<string> {
  const sql = 'SELECT id FROM subscription_plans WHERE plan_key = ? LIMIT 1';
  const rows = connection
    ? await queryWithConnection<{ id: string }>(connection, sql, [planKey])
    : await queryRows<{ id: string }>(sql, [planKey]);

  const planId = rows[0]?.id;
  if (!planId) {
    throw new HttpError(`Plano não encontrado: ${planKey}`, 404);
  }

  return planId;
}

export async function ensureUserSubscription(
  userId: string,
  preferredPlanKey: PlanKey,
  source = 'bootstrap'
) {
  const current = await fetchCurrentSubscriptionRow(userId);
  if (current) {
    return current;
  }

  await withTransaction(async (connection) => {
    const active = await fetchCurrentSubscriptionRow(userId, connection);
    if (active) {
      return active;
    }

    const planId = await fetchPlanIdByKey(preferredPlanKey, connection);
    await insertSubscription(connection, userId, planId, source);
    return null;
  });

  const ensured = await fetchCurrentSubscriptionRow(userId);
  if (!ensured) {
    throw new HttpError(
      'Não foi possível assegurar a assinatura do usuário.',
      500
    );
  }

  return ensured;
}

async function fetchEntitlementRows(
  planId: string,
  connection?: QueryableConnection
): Promise<EntitlementRow[]> {
  const sql = `
    SELECT
      f.feature_key,
      f.name AS feature_name,
      f.description AS feature_description,
      f.category,
      f.feature_type,
      f.meter_kind,
      f.unit,
      pe.enabled,
      pe.quota_value,
      pe.reset_interval,
      f.sort_order
    FROM plan_entitlements pe
    INNER JOIN plan_features f ON f.id = pe.feature_id
    WHERE pe.plan_id = ?
    ORDER BY f.sort_order ASC
  `;

  return connection
    ? queryWithConnection<EntitlementRow>(connection, sql, [planId])
    : queryRows<EntitlementRow>(sql, [planId]);
}

async function getUsageCounterValue(
  userId: string,
  featureKey: PlanFeatureKey,
  resetInterval: string | null,
  connection?: QueryableConnection
) {
  const period = buildPeriodBounds(resetInterval);
  if (!period) {
    return null;
  }

  const sql = `
    SELECT used_value
    FROM feature_usage_counters
    WHERE user_id = ?
      AND feature_key = ?
      AND period_start = ?
      AND period_end = ?
    LIMIT 1
  `;
  const rows = connection
    ? await queryWithConnection<UsageCounterRow>(connection, sql, [
        userId,
        featureKey,
        period.periodStart,
        period.periodEnd,
      ])
    : await queryRows<UsageCounterRow>(sql, [
        userId,
        featureKey,
        period.periodStart,
        period.periodEnd,
      ]);

  return Number(rows[0]?.used_value ?? 0);
}

async function getActiveRowUsage(
  userId: string,
  featureKey: PlanFeatureKey,
  connection?: QueryableConnection
) {
  if (featureKey === 'professionals_total') {
    const sql = 'SELECT COUNT(*) AS total FROM professionals WHERE user_id = ?';
    const rows = connection
      ? await queryWithConnection<{ total: number }>(connection, sql, [userId])
      : await queryRows<{ total: number }>(sql, [userId]);
    return Number(rows[0]?.total ?? 0);
  }

  if (featureKey === 'appointments_active') {
    const sql = `
      SELECT COUNT(*) AS total
      FROM appointments
      WHERE user_id = ?
        AND appointment_time >= UTC_TIMESTAMP()
    `;
    const rows = connection
      ? await queryWithConnection<{ total: number }>(connection, sql, [userId])
      : await queryRows<{ total: number }>(sql, [userId]);
    return Number(rows[0]?.total ?? 0);
  }

  return null;
}

async function buildFeatureAccessList(
  userId: string,
  planId: string,
  connection?: QueryableConnection
): Promise<PlanFeatureAccess[]> {
  const entitlementRows = await fetchEntitlementRows(planId, connection);
  const features = await Promise.all(
    entitlementRows.map(async (row) => {
      let usedValue: number | null = null;

      if (row.meter_kind === 'usage_counter') {
        usedValue = await getUsageCounterValue(
          userId,
          row.feature_key,
          row.reset_interval,
          connection
        );
      } else if (row.meter_kind === 'active_rows') {
        usedValue = await getActiveRowUsage(
          userId,
          row.feature_key,
          connection
        );
      }

      const quotaValue =
        row.quota_value === null ? null : Number(row.quota_value);
      const remainingValue =
        quotaValue !== null && usedValue !== null
          ? Math.max(0, quotaValue - usedValue)
          : null;

      return {
        key: row.feature_key,
        name: row.feature_name,
        description: row.feature_description,
        category: row.category,
        featureType: row.feature_type,
        meterKind: row.meter_kind,
        unit: row.unit,
        enabled: row.enabled === 1,
        quotaValue,
        resetInterval: row.reset_interval,
        usedValue,
        remainingValue,
        sortOrder: Number(row.sort_order),
      } satisfies PlanFeatureAccess;
    })
  );

  return features.sort((left, right) => left.sortOrder - right.sortOrder);
}

async function fetchFeatureAccess(
  userId: string,
  role: string,
  featureKey: PlanFeatureKey,
  connection?: QueryableConnection
) {
  const preferredPlan = role === 'admin' ? 'care' : 'free';
  const current =
    (await fetchCurrentSubscriptionRow(userId, connection)) ??
    (await ensureUserSubscription(userId, preferredPlan, 'auto_repair_plan'));

  const featureList = await buildFeatureAccessList(
    userId,
    current.plan_id,
    connection
  );
  const feature = featureList.find((item) => item.key === featureKey);

  if (!feature) {
    throw new HttpError(`Feature não encontrada: ${featureKey}`, 404);
  }

  return {
    feature,
    subscription: current,
  };
}

export async function getAccountSubscriptionSummary(
  userId: string,
  role: string
): Promise<AccountSubscriptionSummary> {
  const preferredPlan = role === 'admin' ? 'care' : 'free';
  const current =
    (await fetchCurrentSubscriptionRow(userId)) ??
    (await ensureUserSubscription(userId, preferredPlan, 'auto_repair_plan'));
  const features = await buildFeatureAccessList(userId, current.plan_id);

  return {
    subscriptionId: current.subscription_id,
    status: current.status,
    billingInterval: current.billing_interval,
    source: current.source,
    startsAt: current.starts_at,
    currentPeriodStart: current.current_period_start,
    currentPeriodEnd: current.current_period_end,
    cancelAtPeriodEnd: current.cancel_at_period_end === 1,
    plan: toPlanSummary(current),
    features,
  };
}

export async function getPlanMatrix(): Promise<PlanMatrixResponse> {
  const rows = await queryRows<PlanMatrixRow>(`
    SELECT
      p.id AS plan_id,
      p.plan_key,
      p.name AS plan_name,
      p.tagline,
      p.description,
      p.monthly_price,
      p.annual_price,
      p.currency_code,
      p.highlight_text,
      p.accent_from,
      p.accent_to,
      p.display_order,
      p.is_active,
      p.is_public,
      p.external_product_id,
      p.external_monthly_price_id,
      p.external_annual_price_id,
      f.feature_key,
      f.name AS feature_name,
      f.description AS feature_description,
      f.category,
      f.feature_type,
      f.meter_kind,
      f.unit,
      pe.enabled,
      pe.quota_value,
      pe.reset_interval,
      f.sort_order
    FROM subscription_plans p
    INNER JOIN plan_entitlements pe ON pe.plan_id = p.id
    INNER JOIN plan_features f ON f.id = pe.feature_id
    ORDER BY p.display_order ASC, f.sort_order ASC
  `);

  const plansMap = new Map<PlanKey, PlanMatrixPlan>();

  for (const row of rows) {
    const existing = plansMap.get(row.plan_key);
    if (!existing) {
      plansMap.set(row.plan_key, {
        id: row.plan_id,
        key: row.plan_key,
        name: row.plan_name,
        tagline: row.tagline,
        description: row.description,
        monthlyPrice: Number(row.monthly_price),
        annualPrice: Number(row.annual_price),
        currencyCode: row.currency_code,
        highlightText: row.highlight_text,
        accentFrom: row.accent_from,
        accentTo: row.accent_to,
        displayOrder: Number(row.display_order),
        isActive: row.is_active === 1,
        isPublic: row.is_public === 1,
        externalProductId: row.external_product_id,
        externalMonthlyPriceId: row.external_monthly_price_id,
        externalAnnualPriceId: row.external_annual_price_id,
        features: [],
      });
    }

    plansMap.get(row.plan_key)?.features.push({
      key: row.feature_key,
      name: row.feature_name,
      description: row.feature_description,
      category: row.category,
      featureType: row.feature_type,
      meterKind: row.meter_kind,
      unit: row.unit,
      enabled: row.enabled === 1,
      quotaValue: row.quota_value === null ? null : Number(row.quota_value),
      resetInterval: row.reset_interval,
      usedValue: null,
      remainingValue: null,
      sortOrder: Number(row.sort_order),
    });
  }

  return {
    plans: Array.from(plansMap.values()).sort(
      (left, right) => left.displayOrder - right.displayOrder
    ),
  };
}

export async function updatePlanMatrixByKey(
  planKey: PlanKey,
  input: PlanMatrixUpdateInput
) {
  await withTransaction(async (connection) => {
    const planId = await fetchPlanIdByKey(planKey, connection);

    await connection.execute(
      `
        UPDATE subscription_plans
        SET
          name = ?,
          tagline = ?,
          description = ?,
          monthly_price = ?,
          annual_price = ?,
          currency_code = ?,
          highlight_text = ?,
          accent_from = ?,
          accent_to = ?,
          is_active = ?,
          is_public = ?,
          external_product_id = ?,
          external_monthly_price_id = ?,
          external_annual_price_id = ?
        WHERE id = ?
      `,
      [
        input.name.trim(),
        input.tagline.trim(),
        input.description.trim(),
        Number(input.monthlyPrice),
        Number(input.annualPrice),
        input.currencyCode.trim().toUpperCase(),
        input.highlightText?.trim() || null,
        input.accentFrom.trim(),
        input.accentTo.trim(),
        input.isActive ? 1 : 0,
        input.isPublic ? 1 : 0,
        input.externalProductId?.trim() || null,
        input.externalMonthlyPriceId?.trim() || null,
        input.externalAnnualPriceId?.trim() || null,
        planId,
      ]
    );

    for (const feature of input.features) {
      const featureRows = await queryWithConnection<{ id: string }>(
        connection,
        'SELECT id FROM plan_features WHERE feature_key = ? LIMIT 1',
        [feature.key]
      );
      const featureId = featureRows[0]?.id;
      if (!featureId) {
        throw new HttpError(`Feature inexistente: ${feature.key}`, 400);
      }

      await connection.execute(
        `
          INSERT INTO plan_entitlements (
            id,
            plan_id,
            feature_id,
            enabled,
            quota_value,
            reset_interval
          )
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            enabled = VALUES(enabled),
            quota_value = VALUES(quota_value),
            reset_interval = VALUES(reset_interval)
        `,
        [
          crypto.randomUUID(),
          planId,
          featureId,
          feature.enabled ? 1 : 0,
          feature.quotaValue,
          feature.resetInterval,
        ]
      );
    }
  });

  return getPlanMatrix();
}

export async function assignPlanToUserByAdmin(options: {
  targetUserId: string;
  actorUserId: string;
  planKey: PlanKey;
  billingInterval?: 'monthly' | 'annual';
  source?: string;
}) {
  const billingInterval = options.billingInterval ?? 'monthly';
  const source = options.source ?? 'admin_console';

  await withTransaction(async (connection) => {
    const planId = await fetchPlanIdByKey(options.planKey, connection);
    const current = await fetchCurrentSubscriptionRow(
      options.targetUserId,
      connection
    );

    if (current) {
      await connection.execute(
        `
          UPDATE user_subscriptions
          SET
            status = 'replaced',
            ended_at = UTC_TIMESTAMP(),
            cancel_at_period_end = FALSE
          WHERE id = ?
        `,
        [current.subscription_id]
      );
    }

    const newSubscriptionId = crypto.randomUUID();
    const now = formatUtcDateTime(new Date());
    await connection.execute(
      `
        INSERT INTO user_subscriptions (
          id,
          user_id,
          plan_id,
          status,
          billing_interval,
          source,
          starts_at,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          metadata
        )
        VALUES (
          ?, ?, ?, 'active', ?, ?, ?, ?,
          ${billingInterval === 'annual' ? 'DATE_ADD(?, INTERVAL 1 YEAR)' : 'DATE_ADD(?, INTERVAL 1 MONTH)'},
          FALSE,
          JSON_OBJECT('assigned_by_admin', TRUE)
        )
      `,
      [
        newSubscriptionId,
        options.targetUserId,
        planId,
        billingInterval,
        source,
        now,
        now,
        now,
      ]
    );

    await connection.execute(
      `
        INSERT INTO subscription_audit_events (
          id,
          subscription_id,
          user_id,
          actor_user_id,
          event_type,
          source,
          payload
        )
        VALUES (?, ?, ?, ?, 'subscription_assigned', ?, JSON_OBJECT('plan_key', ?, 'billing_interval', ?))
      `,
      [
        crypto.randomUUID(),
        newSubscriptionId,
        options.targetUserId,
        options.actorUserId,
        source,
        options.planKey,
        billingInterval,
      ]
    );
  });

  return getUserSubscriptionAssignment(options.targetUserId);
}

export async function listAdminUsersWithSubscriptions(options: {
  search?: string;
  page?: number;
  pageSize?: number;
  sortColumn?: AdminUserSortColumn;
  ascending?: boolean;
}): Promise<AdminUserListResponse> {
  const page = Math.max(0, Math.trunc(options.page ?? 0));
  const pageSize = Math.min(
    100,
    Math.max(1, Math.trunc(options.pageSize ?? 10))
  );
  const sortColumn = options.sortColumn ?? 'created_at';
  const sortSql =
    ADMIN_USER_SORT_COLUMNS[sortColumn] ?? ADMIN_USER_SORT_COLUMNS.created_at;
  const sortDirection = options.ascending ? 'ASC' : 'DESC';
  const offset = page * pageSize;
  const normalizedSearch = options.search?.trim().toLowerCase() ?? '';
  const whereClauses: string[] = [];
  const whereParams: unknown[] = [];

  if (normalizedSearch) {
    whereClauses.push(
      `(LOWER(COALESCE(p.first_name, '')) LIKE ? OR LOWER(COALESCE(p.last_name, '')) LIKE ? OR LOWER(COALESCE(p.email, '')) LIKE ?)`
    );
    const likeTerm = `%${normalizedSearch}%`;
    whereParams.push(likeTerm, likeTerm, likeTerm);
  }

  const whereClause =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const [rows, countRows] = await Promise.all([
    queryRows<AdminUserListRow>(
      `
        SELECT
          p.id,
          p.first_name,
          p.last_name,
          p.email,
          p.onboarding_completed,
          p.created_at,
          p.avatar_url,
          p.age,
          p.gender,
          p.activity_level,
          p.goals,
          p.birth_date,
          p.birth_time,
          p.birth_location,
          p.role,
          sp.plan_key,
          sp.name AS plan_name,
          us.billing_interval,
          us.status AS subscription_status
        FROM profiles p
        LEFT JOIN user_subscriptions us
          ON us.id = (
            SELECT us2.id
            FROM user_subscriptions us2
            WHERE us2.user_id = p.id
              AND us2.status = 'active'
              AND (us2.ended_at IS NULL OR us2.ended_at > UTC_TIMESTAMP())
            ORDER BY us2.current_period_end DESC, us2.created_at DESC
            LIMIT 1
          )
        LEFT JOIN subscription_plans sp ON sp.id = us.plan_id
        ${whereClause}
        ORDER BY ${sortSql} ${sortDirection}, p.id ASC
        LIMIT ?
        OFFSET ?
      `,
      [...whereParams, pageSize, offset]
    ),
    queryRows<{ total: number }>(
      `
        SELECT COUNT(*) AS total
        FROM profiles p
        ${whereClause}
      `,
      whereParams
    ),
  ]);

  const users: AdminUserListItem[] = rows.map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    onboardingCompleted: row.onboarding_completed === 1,
    createdAt: row.created_at,
    avatarUrl: row.avatar_url,
    age: row.age === null ? null : Number(row.age),
    gender: row.gender,
    activityLevel:
      row.activity_level === null ? null : Number(row.activity_level),
    goals: parseJsonArrayValue(row.goals),
    birthDate: row.birth_date,
    birthTime: row.birth_time,
    birthLocation: row.birth_location,
    role: row.role,
    plan: {
      key: row.plan_key,
      name: row.plan_name,
      billingInterval: row.billing_interval,
      status: row.subscription_status,
    },
  }));

  return {
    users,
    total: Number(countRows[0]?.total ?? 0),
    page,
    pageSize,
  };
}

export async function getUserSubscriptionAssignment(
  userId: string
): Promise<UserSubscriptionAssignment> {
  const identityRows = await queryRows<UserIdentityRow>(
    `
      SELECT email, first_name, last_name, role
      FROM profiles
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  const identity = identityRows[0];
  if (!identity) {
    throw new HttpError('Usuário não encontrado.', 404);
  }

  const subscription = await getAccountSubscriptionSummary(
    userId,
    identity.role
  );
  return {
    userId,
    email: identity.email,
    fullName:
      [identity.first_name, identity.last_name].filter(Boolean).join(' ') ||
      'Usuário',
    role: identity.role,
    subscription,
  };
}

export async function requireFeatureEnabled(
  session: AppSession,
  featureKey: PlanFeatureKey
) {
  if (session.user.role === 'admin') {
    return;
  }

  const { feature, subscription } = await fetchFeatureAccess(
    session.user.id,
    session.user.role,
    featureKey
  );

  if (!feature.enabled) {
    throw new HttpError(
      `O plano ${subscription.plan_name} não inclui ${feature.name}.`,
      403
    );
  }
}

export async function assertActiveRowsQuota(options: {
  session: AppSession;
  featureKey: Extract<
    PlanFeatureKey,
    'professionals_total' | 'appointments_active'
  >;
  currentCount: number;
  increment?: number;
}) {
  if (options.session.user.role === 'admin') {
    return;
  }

  const { feature, subscription } = await fetchFeatureAccess(
    options.session.user.id,
    options.session.user.role,
    options.featureKey
  );

  if (!feature.enabled) {
    throw new HttpError(
      `O plano ${subscription.plan_name} não inclui ${feature.name}.`,
      403
    );
  }

  if (feature.quotaValue !== null) {
    const nextTotal = options.currentCount + (options.increment ?? 1);
    if (nextTotal > feature.quotaValue) {
      throw new HttpError(
        `O plano ${subscription.plan_name} permite até ${feature.quotaValue} ${feature.unit ?? 'itens'} para ${feature.name.toLowerCase()}.`,
        403
      );
    }
  }
}

export async function consumeUsageQuota(options: {
  session: AppSession;
  featureKey: Extract<
    PlanFeatureKey,
    'ai_chat_messages' | 'ai_plan_generations'
  >;
  amount?: number;
  connection?: PoolConnection;
}) {
  if (options.session.user.role === 'admin') {
    return;
  }

  const consume = async (connection: PoolConnection) => {
    const { feature, subscription } = await fetchFeatureAccess(
      options.session.user.id,
      options.session.user.role,
      options.featureKey,
      connection
    );

    if (!feature.enabled) {
      throw new HttpError(
        `O plano ${subscription.plan_name} não inclui ${feature.name}.`,
        403
      );
    }

    if (feature.quotaValue === null) {
      return;
    }

    const period = buildPeriodBounds(feature.resetInterval);
    if (!period) {
      throw new HttpError(
        `A feature ${feature.name} não possui janela de consumo configurada.`,
        500
      );
    }

    const rows = await queryWithConnection<UsageCounterRow>(
      connection,
      `
        SELECT id, used_value
        FROM feature_usage_counters
        WHERE user_id = ?
          AND feature_key = ?
          AND period_start = ?
          AND period_end = ?
        LIMIT 1
        FOR UPDATE
      `,
      [
        options.session.user.id,
        options.featureKey,
        period.periodStart,
        period.periodEnd,
      ]
    );

    const amount = options.amount ?? 1;
    const usedValue = Number(rows[0]?.used_value ?? 0);
    if (usedValue + amount > feature.quotaValue) {
      throw new HttpError(
        `Cota mensal atingida para ${feature.name} no plano ${subscription.plan_name}.`,
        403
      );
    }

    if (rows[0]) {
      await connection.execute(
        `
          UPDATE feature_usage_counters
          SET used_value = used_value + ?
          WHERE id = ?
        `,
        [amount, rows[0].id]
      );
    } else {
      await connection.execute(
        `
          INSERT INTO feature_usage_counters (
            id,
            user_id,
            feature_key,
            period_start,
            period_end,
            used_value
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),
          options.session.user.id,
          options.featureKey,
          period.periodStart,
          period.periodEnd,
          amount,
        ]
      );
    }
  };

  if (options.connection) {
    await consume(options.connection);
    return;
  }

  await withTransaction(async (connection) => {
    await consume(connection);
  });
}

export async function getMetricsHistoryLimit(session: AppSession) {
  if (session.user.role === 'admin') {
    return null;
  }

  const { feature } = await fetchFeatureAccess(
    session.user.id,
    session.user.role,
    'metrics_history_days'
  );

  if (!feature.enabled) {
    return 0;
  }

  return feature.quotaValue;
}
