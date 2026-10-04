export const PLAN_KEYS = ['free', 'meta', 'care'] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

export const PLAN_FEATURE_KEYS = [
  'dashboard_access',
  'ai_scores',
  'ai_tips_feed',
  'profile_management',
  'goal_progress_tracking',
  'wearable_bluetooth_connection',
  'realtime_monitoring',
  'voice_monitoring_updates',
  'ai_chat_messages',
  'ai_plan_generations',
  'professionals_total',
  'appointments_active',
  'metrics_history_days',
] as const;

export type PlanFeatureKey = (typeof PLAN_FEATURE_KEYS)[number];

export type PlanFeatureCategory = 'Essencial' | 'IA' | 'Clínico' | 'Operação';

export type PlanFeatureType = 'boolean' | 'quota';

export type PlanFeatureMeterKind =
  'toggle' | 'usage_counter' | 'active_rows' | 'rolling_days';

export interface PlanFeatureAccess {
  key: PlanFeatureKey;
  name: string;
  description: string;
  category: PlanFeatureCategory;
  featureType: PlanFeatureType;
  meterKind: PlanFeatureMeterKind;
  unit: string | null;
  enabled: boolean;
  quotaValue: number | null;
  resetInterval: string | null;
  usedValue: number | null;
  remainingValue: number | null;
  sortOrder: number;
}

export interface SubscriptionPlanSummary {
  id: string;
  key: PlanKey;
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currencyCode: string;
  highlightText: string | null;
  accentFrom: string;
  accentTo: string;
  displayOrder: number;
  isActive: boolean;
  isPublic: boolean;
  externalProductId: string | null;
  externalMonthlyPriceId: string | null;
  externalAnnualPriceId: string | null;
}

export interface AccountSubscriptionSummary {
  subscriptionId: string;
  status: string;
  billingInterval: string;
  source: string;
  startsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlanSummary;
  features: PlanFeatureAccess[];
}

export interface PlanMatrixPlan extends SubscriptionPlanSummary {
  features: PlanFeatureAccess[];
}

export interface PlanMatrixResponse {
  plans: PlanMatrixPlan[];
}

export interface PlanMatrixUpdateInput {
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currencyCode: string;
  highlightText: string | null;
  accentFrom: string;
  accentTo: string;
  isActive: boolean;
  isPublic: boolean;
  externalProductId: string | null;
  externalMonthlyPriceId: string | null;
  externalAnnualPriceId: string | null;
  features: Array<{
    key: PlanFeatureKey;
    enabled: boolean;
    quotaValue: number | null;
    resetInterval: string | null;
  }>;
}

export interface UserSubscriptionAssignment {
  userId: string;
  email: string | null;
  fullName: string;
  role: string;
  subscription: AccountSubscriptionSummary;
}

export interface AdminUserPlanSummary {
  key: PlanKey | null;
  name: string | null;
  billingInterval: string | null;
  status: string | null;
}

export interface AdminUserListItem {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  avatarUrl: string | null;
  age: number | null;
  gender: string | null;
  activityLevel: number | null;
  goals: string[] | null;
  birthDate: string | null;
  birthTime: string | null;
  birthLocation: string | null;
  role: string;
  plan: AdminUserPlanSummary;
}

export interface AdminUserListResponse {
  users: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BillingCatalogPlan {
  key: PlanKey;
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currencyCode: string;
  highlightText: string | null;
  accentFrom: string;
  accentTo: string;
  current: boolean;
  purchaseEnabled: boolean;
  availableIntervals: Array<'monthly' | 'annual'>;
}

export interface BillingEnvironmentStatus {
  provider: 'stripe';
  configured: boolean;
  portalEnabled: boolean;
  missingKeys: string[];
}

export interface AccountBillingContext {
  environment: BillingEnvironmentStatus;
  customerLinked: boolean;
  subscriptionSource: string | null;
  plans: BillingCatalogPlan[];
}
