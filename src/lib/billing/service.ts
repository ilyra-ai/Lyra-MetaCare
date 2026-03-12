import Stripe from 'stripe';

import {
  getBillingBaseUrl,
  getStripeEnvironmentStatus,
  getStripeProviderName,
  getStripeWebhookSecret,
  resolveStripePriceId,
} from '@/lib/billing/config';
import { getStripeClient } from '@/lib/billing/stripe';
import { HttpError } from '@/lib/http-error';
import { executeStatement, queryRows, withTransaction } from '@/lib/mysql/pool';
import {
  AccountBillingContext,
  BillingCatalogPlan,
  PlanKey,
  SubscriptionPlanSummary,
} from '@/types/subscription';
import { AppSession } from '@/types/app-session';

interface BillingPlanRow {
  id: string;
  plan_key: PlanKey;
  name: string;
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

interface BillingCustomerRow {
  id: string;
  user_id: string;
  external_customer_id: string;
  email_snapshot: string | null;
}

interface ProfileNameRow {
  first_name: string | null;
  last_name: string | null;
}

interface ActiveSubscriptionRow {
  id: string;
  plan_id: string;
  source: string;
  external_customer_id: string | null;
  external_subscription_id: string | null;
  status: string;
}

interface ExistingExternalSubscriptionRow {
  id: string;
}

interface BillingWebhookEventRow {
  id: string;
  status: string;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function formatUtcDateTime(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function formatUtcDateTimeFromUnix(unixSeconds: number | null | undefined) {
  if (!unixSeconds) {
    return formatUtcDateTime(new Date());
  }

  return formatUtcDateTime(new Date(unixSeconds * 1000));
}

function toPlanSummary(row: BillingPlanRow): SubscriptionPlanSummary {
  return {
    id: row.id,
    key: row.plan_key,
    name: row.name,
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

async function getPlanCatalogRows() {
  return queryRows<BillingPlanRow>(
    `
      SELECT
        id,
        plan_key,
        name,
        tagline,
        description,
        monthly_price,
        annual_price,
        currency_code,
        highlight_text,
        accent_from,
        accent_to,
        display_order,
        is_active,
        is_public,
        external_product_id,
        external_monthly_price_id,
        external_annual_price_id
      FROM subscription_plans
      WHERE is_active = TRUE
      ORDER BY display_order ASC
    `
  );
}

async function getPublicPlanCatalog() {
  const rows = await getPlanCatalogRows();
  return rows
    .filter((row) => row.is_public === 1)
    .map((row) => toPlanSummary(row));
}

async function getPlanByKey(planKey: PlanKey) {
  const rows = await queryRows<BillingPlanRow>(
    `
      SELECT
        id,
        plan_key,
        name,
        tagline,
        description,
        monthly_price,
        annual_price,
        currency_code,
        highlight_text,
        accent_from,
        accent_to,
        display_order,
        is_active,
        is_public,
        external_product_id,
        external_monthly_price_id,
        external_annual_price_id
      FROM subscription_plans
      WHERE plan_key = ?
      LIMIT 1
    `,
    [planKey]
  );

  const row = rows[0];
  if (!row) {
    throw new HttpError(`Plano não encontrado: ${planKey}`, 404);
  }

  return row;
}

async function getPlanByStripePriceId(priceId: string) {
  const rows = await queryRows<BillingPlanRow>(
    `
      SELECT
        id,
        plan_key,
        name,
        tagline,
        description,
        monthly_price,
        annual_price,
        currency_code,
        highlight_text,
        accent_from,
        accent_to,
        display_order,
        is_active,
        is_public,
        external_product_id,
        external_monthly_price_id,
        external_annual_price_id
      FROM subscription_plans
      WHERE external_monthly_price_id = ?
         OR external_annual_price_id = ?
      LIMIT 1
    `,
    [priceId, priceId]
  );

  const row = rows[0];
  if (!row) {
    throw new HttpError(
      `Nenhum plano MySQL foi vinculado ao price id externo ${priceId}.`,
      400
    );
  }

  return row;
}

async function getBillingCustomerByUserId(userId: string) {
  const rows = await queryRows<BillingCustomerRow>(
    `
      SELECT id, user_id, external_customer_id, email_snapshot
      FROM billing_customers
      WHERE provider = ?
        AND user_id = ?
      LIMIT 1
    `,
    [getStripeProviderName(), userId]
  );

  return rows[0] ?? null;
}

async function getUserIdByExternalCustomerId(externalCustomerId: string) {
  const rows = await queryRows<{ user_id: string }>(
    `
      SELECT user_id
      FROM billing_customers
      WHERE provider = ?
        AND external_customer_id = ?
      LIMIT 1
    `,
    [getStripeProviderName(), externalCustomerId]
  );

  return rows[0]?.user_id ?? null;
}

async function upsertBillingCustomerMapping(options: {
  userId: string;
  externalCustomerId: string;
  emailSnapshot: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  await executeStatement(
    `
      INSERT INTO billing_customers (
        id,
        user_id,
        provider,
        external_customer_id,
        email_snapshot,
        metadata
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        external_customer_id = VALUES(external_customer_id),
        email_snapshot = VALUES(email_snapshot),
        metadata = VALUES(metadata)
    `,
    [
      crypto.randomUUID(),
      options.userId,
      getStripeProviderName(),
      options.externalCustomerId,
      options.emailSnapshot,
      options.metadata ? JSON.stringify(options.metadata) : null,
    ]
  );
}

async function getFullName(userId: string) {
  const rows = await queryRows<ProfileNameRow>(
    `
      SELECT first_name, last_name
      FROM profiles
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  const fullName = [row.first_name, row.last_name].filter(Boolean).join(' ');
  return fullName || null;
}

async function ensureStripeCustomer(session: AppSession) {
  const existing = await getBillingCustomerByUserId(session.user.id);
  if (existing) {
    return existing.external_customer_id;
  }

  const stripe = getStripeClient();
  const fullName = await getFullName(session.user.id);
  const customer = await stripe.customers.create({
    email: session.user.email,
    name: fullName ?? undefined,
    metadata: {
      lyra_user_id: session.user.id,
      lyra_user_role: session.user.role,
    },
  });

  await upsertBillingCustomerMapping({
    userId: session.user.id,
    externalCustomerId: customer.id,
    emailSnapshot: session.user.email,
    metadata: {
      name: fullName,
    },
  });

  return customer.id;
}

async function getActiveSubscriptionRow(userId: string) {
  const rows = await queryRows<ActiveSubscriptionRow>(
    `
      SELECT
        id,
        plan_id,
        source,
        external_customer_id,
        external_subscription_id,
        status
      FROM user_subscriptions
      WHERE user_id = ?
        AND status = 'active'
        AND (ended_at IS NULL OR ended_at > UTC_TIMESTAMP())
      ORDER BY current_period_end DESC, created_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] ?? null;
}

function resolveInternalPlanForDowngrade(role: string): PlanKey {
  return role === 'admin' ? 'care' : 'free';
}

async function insertInternalSubscription(options: {
  userId: string;
  planId: string;
  billingInterval: 'monthly' | 'annual';
  source: string;
  externalCustomerId?: string | null;
  externalSubscriptionId?: string | null;
  externalPriceId?: string | null;
  startsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  metadata?: Record<string, unknown> | null;
}) {
  await executeStatement(
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
        external_customer_id,
        external_subscription_id,
        external_price_id,
        metadata
      )
      VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      crypto.randomUUID(),
      options.userId,
      options.planId,
      options.billingInterval,
      options.source,
      options.startsAt,
      options.currentPeriodStart,
      options.currentPeriodEnd,
      options.cancelAtPeriodEnd ? 1 : 0,
      options.externalCustomerId ?? null,
      options.externalSubscriptionId ?? null,
      options.externalPriceId ?? null,
      options.metadata ? JSON.stringify(options.metadata) : null,
    ]
  );
}

async function replaceSubscriptionWithPlan(options: {
  userId: string;
  planId: string;
  billingInterval: 'monthly' | 'annual';
  source: string;
  externalCustomerId?: string | null;
  externalSubscriptionId?: string | null;
  externalPriceId?: string | null;
  startsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  metadata?: Record<string, unknown> | null;
}) {
  await withTransaction(async (connection) => {
    await connection.execute(
      `
        UPDATE user_subscriptions
        SET
          status = 'replaced',
          ended_at = UTC_TIMESTAMP(),
          cancel_at_period_end = FALSE
        WHERE user_id = ?
          AND status = 'active'
          AND (ended_at IS NULL OR ended_at > UTC_TIMESTAMP())
      `,
      [options.userId]
    );

    const existingRows = await connection.query<ExistingExternalSubscriptionRow[]>(
      `
        SELECT id
        FROM user_subscriptions
        WHERE external_subscription_id = ?
        LIMIT 1
      `,
      [options.externalSubscriptionId ?? '__lyra_no_external_subscription__']
    );

    const [rows] = existingRows;
    const existing = rows[0];

    if (existing && options.externalSubscriptionId) {
      await connection.execute(
        `
          UPDATE user_subscriptions
          SET
            plan_id = ?,
            status = 'active',
            billing_interval = ?,
            source = ?,
            starts_at = ?,
            current_period_start = ?,
            current_period_end = ?,
            cancel_at_period_end = ?,
            canceled_at = NULL,
            ended_at = NULL,
            external_customer_id = ?,
            external_subscription_id = ?,
            external_price_id = ?,
            metadata = ?
          WHERE id = ?
        `,
        [
          options.planId,
          options.billingInterval,
          options.source,
          options.startsAt,
          options.currentPeriodStart,
          options.currentPeriodEnd,
          options.cancelAtPeriodEnd ? 1 : 0,
          options.externalCustomerId ?? null,
          options.externalSubscriptionId,
          options.externalPriceId ?? null,
          options.metadata ? JSON.stringify(options.metadata) : null,
          existing.id,
        ]
      );
    } else {
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
            external_customer_id,
            external_subscription_id,
            external_price_id,
            metadata
          )
          VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),
          options.userId,
          options.planId,
          options.billingInterval,
          options.source,
          options.startsAt,
          options.currentPeriodStart,
          options.currentPeriodEnd,
          options.cancelAtPeriodEnd ? 1 : 0,
          options.externalCustomerId ?? null,
          options.externalSubscriptionId ?? null,
          options.externalPriceId ?? null,
          options.metadata ? JSON.stringify(options.metadata) : null,
        ]
      );
    }

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
        VALUES (?, NULL, ?, NULL, 'billing_sync', ?, ?)
      `,
      [
        crypto.randomUUID(),
        options.userId,
        options.source,
        JSON.stringify({
          externalSubscriptionId: options.externalSubscriptionId ?? null,
          externalPriceId: options.externalPriceId ?? null,
          billingInterval: options.billingInterval,
          cancelAtPeriodEnd: options.cancelAtPeriodEnd,
          planId: options.planId,
        }),
      ]
    );
  });
}

async function downgradeUserToInternalPlan(options: {
  userId: string;
  role: string;
  source: string;
}) {
  const preferredPlanKey = resolveInternalPlanForDowngrade(options.role);
  const plan = await getPlanByKey(preferredPlanKey);
  const now = formatUtcDateTime(new Date());
  const nextPeriodEnd =
    preferredPlanKey === 'care'
      ? formatUtcDateTime(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        )
      : formatUtcDateTime(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );

  await replaceSubscriptionWithPlan({
    userId: options.userId,
    planId: plan.id,
    billingInterval: 'monthly',
    source: options.source,
    startsAt: now,
    currentPeriodStart: now,
    currentPeriodEnd: nextPeriodEnd,
    cancelAtPeriodEnd: false,
    metadata: {
      downgrade_reason: 'external_subscription_inactive',
      target_plan_key: plan.plan_key,
    },
  });
}

function buildBillingCatalogPlans(options: {
  plans: SubscriptionPlanSummary[];
  currentPlanKey: PlanKey | null;
  billingConfigured: boolean;
}): BillingCatalogPlan[] {
  return options.plans.map((plan) => {
    const availableIntervals: Array<'monthly' | 'annual'> = [];

    if (resolveStripePriceId(plan, 'monthly')) {
      availableIntervals.push('monthly');
    }

    if (resolveStripePriceId(plan, 'annual')) {
      availableIntervals.push('annual');
    }

    return {
      key: plan.key,
      name: plan.name,
      tagline: plan.tagline,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      currencyCode: plan.currencyCode,
      highlightText: plan.highlightText,
      accentFrom: plan.accentFrom,
      accentTo: plan.accentTo,
      current: plan.key === options.currentPlanKey,
      purchaseEnabled:
        options.billingConfigured && plan.key !== 'free' && availableIntervals.length > 0,
      availableIntervals,
    };
  });
}

export async function getAccountBillingContext(options: {
  session: AppSession;
  origin?: string;
}): Promise<AccountBillingContext> {
  const [plans, activeSubscription, linkedCustomer] = await Promise.all([
    getPublicPlanCatalog(),
    getActiveSubscriptionRow(options.session.user.id),
    getBillingCustomerByUserId(options.session.user.id),
  ]);

  const environment = getStripeEnvironmentStatus(options.origin);

  return {
    environment,
    customerLinked: Boolean(
      linkedCustomer?.external_customer_id || activeSubscription?.external_customer_id
    ),
    subscriptionSource: activeSubscription?.source ?? null,
    plans: buildBillingCatalogPlans({
      plans,
      currentPlanKey:
        (plans.find((plan) => plan.id === activeSubscription?.plan_id)?.key as
          | PlanKey
          | null) ?? null,
      billingConfigured: environment.configured,
    }),
  };
}

export async function createStripeCheckoutUrl(options: {
  session: AppSession;
  planKey: PlanKey;
  billingInterval: 'monthly' | 'annual';
  origin?: string;
}) {
  const environment = getStripeEnvironmentStatus(options.origin);
  if (!environment.configured) {
    throw new HttpError(
      `Billing externo Stripe não está pronto neste ambiente. Faltando: ${environment.missingKeys.join(', ')}.`,
      503
    );
  }

  if (options.planKey === 'free') {
    throw new HttpError(
      'O plano Free não usa checkout externo. Utilize downgrade administrativo ou cancelamento via portal.',
      400
    );
  }

  const plan = toPlanSummary(await getPlanByKey(options.planKey));
  const priceId = resolveStripePriceId(plan, options.billingInterval);

  if (!priceId) {
    throw new HttpError(
      `O plano ${plan.name} ainda não possui price id Stripe configurado para o ciclo ${options.billingInterval}.`,
      400
    );
  }

  const baseUrl = getBillingBaseUrl(options.origin);
  if (!baseUrl) {
    throw new HttpError(
      'Não foi possível determinar a URL base da aplicação para o checkout.',
      500
    );
  }

  const stripe = getStripeClient();
  const customerId = await ensureStripeCustomer(options.session);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: options.session.user.id,
    allow_promotion_codes: true,
    success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/billing/cancel?plan=${options.planKey}`,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      lyra_user_id: options.session.user.id,
      lyra_plan_key: options.planKey,
      lyra_billing_interval: options.billingInterval,
    },
    subscription_data: {
      metadata: {
        lyra_user_id: options.session.user.id,
        lyra_plan_key: options.planKey,
        lyra_billing_interval: options.billingInterval,
      },
    },
  });

  if (!session.url) {
    throw new HttpError('A Stripe não retornou uma URL de checkout válida.', 500);
  }

  return session.url;
}

export async function createStripePortalUrl(options: {
  session: AppSession;
  origin?: string;
}) {
  const environment = getStripeEnvironmentStatus(options.origin);
  if (!environment.configured) {
    throw new HttpError(
      `Billing externo Stripe não está pronto neste ambiente. Faltando: ${environment.missingKeys.join(', ')}.`,
      503
    );
  }

  const baseUrl = getBillingBaseUrl(options.origin);
  if (!baseUrl) {
    throw new HttpError(
      'Não foi possível determinar a URL base da aplicação para o portal.',
      500
    );
  }

  const linkedCustomer = await getBillingCustomerByUserId(options.session.user.id);
  const customerId =
    linkedCustomer?.external_customer_id || (await ensureStripeCustomer(options.session));

  const stripe = getStripeClient();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/profile`,
  });

  return portalSession.url;
}

async function markWebhookEventStatus(options: {
  externalEventId: string;
  status: 'processed' | 'error' | 'processing';
  payload?: unknown;
  errorMessage?: string | null;
}) {
  await executeStatement(
    `
      UPDATE billing_webhook_events
      SET
        status = ?,
        payload = COALESCE(?, payload),
        processed_at = CASE WHEN ? = 'processed' THEN UTC_TIMESTAMP() ELSE processed_at END,
        error_message = ?
      WHERE provider = ?
        AND external_event_id = ?
    `,
    [
      options.status,
      options.payload ? JSON.stringify(options.payload) : null,
      options.status,
      options.errorMessage ?? null,
      getStripeProviderName(),
      options.externalEventId,
    ]
  );
}

async function ensureWebhookEventRecord(event: Stripe.Event) {
  await executeStatement(
    `
      INSERT IGNORE INTO billing_webhook_events (
        id,
        provider,
        external_event_id,
        event_type,
        status,
        payload
      )
      VALUES (?, ?, ?, ?, 'received', ?)
    `,
    [
      crypto.randomUUID(),
      getStripeProviderName(),
      event.id,
      event.type,
      JSON.stringify(event),
    ]
  );

  const rows = await queryRows<BillingWebhookEventRow>(
    `
      SELECT id, status
      FROM billing_webhook_events
      WHERE provider = ?
        AND external_event_id = ?
      LIMIT 1
    `,
    [getStripeProviderName(), event.id]
  );

  return rows[0] ?? null;
}

async function resolveUserForStripeSubscription(subscription: Stripe.Subscription) {
  const metadataUserId =
    typeof subscription.metadata?.lyra_user_id === 'string'
      ? subscription.metadata.lyra_user_id
      : null;

  if (metadataUserId) {
    return metadataUserId;
  }

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  const mappedUserId = await getUserIdByExternalCustomerId(customerId);
  if (mappedUserId) {
    return mappedUserId;
  }

  throw new HttpError(
    `Não foi possível resolver o usuário Lyra para a assinatura Stripe ${subscription.id}.`,
    400
  );
}

function getStripeSubscriptionInterval(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  const interval = item?.price?.recurring?.interval;

  return interval === 'year' ? 'annual' : 'monthly';
}

function isStripeSubscriptionAccessActive(status: Stripe.Subscription.Status) {
  return ['active', 'trialing', 'past_due'].includes(status);
}

async function syncStripeSubscription(subscription: Stripe.Subscription, source: string) {
  const item = subscription.items.data[0];
  const priceId = item?.price?.id;

  if (!priceId) {
    throw new HttpError(
      `A assinatura Stripe ${subscription.id} não possui price id utilizável.`,
      400
    );
  }

  const plan = await getPlanByStripePriceId(priceId);
  const userId = await resolveUserForStripeSubscription(subscription);
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  await upsertBillingCustomerMapping({
    userId,
    externalCustomerId: customerId,
    emailSnapshot: null,
    metadata: {
      stripe_subscription_id: subscription.id,
    },
  });

  if (!isStripeSubscriptionAccessActive(subscription.status)) {
    const roleRows = await queryRows<{ role: string }>(
      'SELECT role FROM profiles WHERE id = ? LIMIT 1',
      [userId]
    );
    const role = roleRows[0]?.role ?? 'patient';

    await executeStatement(
      `
        UPDATE user_subscriptions
        SET
          status = 'canceled',
          canceled_at = COALESCE(?, UTC_TIMESTAMP()),
          ended_at = COALESCE(?, UTC_TIMESTAMP()),
          cancel_at_period_end = ?,
          metadata = ?
        WHERE external_subscription_id = ?
      `,
      [
        formatUtcDateTimeFromUnix(subscription.canceled_at ?? undefined),
        formatUtcDateTimeFromUnix(subscription.current_period_end),
        subscription.cancel_at_period_end ? 1 : 0,
        JSON.stringify({
          provider: getStripeProviderName(),
          stripe_status: subscription.status,
          source,
        }),
        subscription.id,
      ]
    );

    await downgradeUserToInternalPlan({
      userId,
      role,
      source: `${source}_downgrade`,
    });
    return;
  }

  await replaceSubscriptionWithPlan({
    userId,
    planId: plan.id,
    billingInterval: getStripeSubscriptionInterval(subscription),
    source: getStripeProviderName(),
    externalCustomerId: customerId,
    externalSubscriptionId: subscription.id,
    externalPriceId: priceId,
    startsAt: formatUtcDateTimeFromUnix(subscription.start_date),
    currentPeriodStart: formatUtcDateTimeFromUnix(
      subscription.current_period_start
    ),
    currentPeriodEnd: formatUtcDateTimeFromUnix(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    metadata: {
      provider: getStripeProviderName(),
      stripe_status: subscription.status,
      source,
    },
  });
}

export async function processStripeWebhook(options: {
  payload: string;
  signature: string | null;
}) {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    throw new HttpError(
      'Billing externo Stripe não está pronto: STRIPE_WEBHOOK_SECRET ausente.',
      503
    );
  }

  if (!options.signature) {
    throw new HttpError('Cabeçalho Stripe-Signature ausente.', 400);
  }

  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(
    options.payload,
    options.signature,
    webhookSecret
  );

  const record = await ensureWebhookEventRecord(event);
  if (record?.status === 'processed') {
    return { duplicate: true, eventId: event.id, eventType: event.type };
  }

  await markWebhookEventStatus({
    externalEventId: event.id,
    status: 'processing',
    payload: event,
  });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const metadataUserId =
          checkoutSession.metadata?.lyra_user_id ||
          checkoutSession.client_reference_id ||
          null;

        if (metadataUserId && typeof checkoutSession.customer === 'string') {
          await upsertBillingCustomerMapping({
            userId: metadataUserId,
            externalCustomerId: checkoutSession.customer,
            emailSnapshot: null,
            metadata: {
              checkout_session_id: checkoutSession.id,
            },
          });
        }

        if (checkoutSession.mode === 'subscription' && checkoutSession.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            typeof checkoutSession.subscription === 'string'
              ? checkoutSession.subscription
              : checkoutSession.subscription.id,
            {
              expand: ['items.data.price'],
            }
          );

          await syncStripeSubscription(
            subscription,
            'checkout.session.completed'
          );
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncStripeSubscription(subscription, event.type);
        break;
      }
      default:
        break;
    }

    await markWebhookEventStatus({
      externalEventId: event.id,
      status: 'processed',
      payload: event,
    });

    return { duplicate: false, eventId: event.id, eventType: event.type };
  } catch (error) {
    await markWebhookEventStatus({
      externalEventId: event.id,
      status: 'error',
      payload: event,
      errorMessage: error instanceof Error ? error.message : 'Erro desconhecido.',
    });
    throw error;
  }
}
