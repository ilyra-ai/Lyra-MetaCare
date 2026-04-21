import { TableName } from '@/lib/mysql/table-config';

export type QueryRecord = Record<string, unknown>;
export type DateString = string;
export type TimeString = string;
export type DateTimeString = string;

interface TimestampedRow {
  created_at: DateTimeString;
}

interface AuditedRow extends TimestampedRow {
  updated_at: DateTimeString;
}

export interface ProfileRow extends AuditedRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  onboarding_completed: boolean;
  role: string;
  age: number | null;
  gender: string | null;
  activity_level: number | null;
  goals: string[] | null;
  birth_date: DateString | null;
  birth_time: TimeString | null;
  birth_location: string | null;
  avatar_url: string | null;
  daily_metrics?: Array<{ date: DateString }>;
}

export interface DailyMetricRow extends TimestampedRow {
  id: string;
  user_id: string;
  date: DateString;
  steps: number;
  sleep_duration_minutes: number;
  resting_heart_rate: number | null;
  calories_burned: number | null;
  hrv_ms: number | null;
  deep_sleep_minutes: number;
  resting_heart_rate_min: number | null;
  resting_heart_rate_max: number | null;
  spo2_average: number | null;
  respiratory_rate: number | null;
  body_temperature_celsius: number | null;
  total_distance_km: number;
  active_minutes: number;
  workout_calories: number;
  vo2_max: number | null;
  sleep_latency_minutes: number | null;
  rem_sleep_minutes: number;
  light_sleep_minutes: number;
  sleep_efficiency: number | null;
  sleep_score: number | null;
  protein_grams: number;
  carb_grams: number;
  fat_grams: number;
  water_liters: number;
  caffeine_mg: number;
  stress_score: number | null;
  recovery_score: number | null;
  readiness_score: number | null;
  blood_glucose_mgdl: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  weight_kg: number | null;
  mood_score: number | null;
  meditation_minutes: number;
  hrr_1min_bpm: number | null;
  sleep_regularity_index: number | null;
  social_jetlag_hours: number | null;
  waso_minutes: number | null;
  training_load_epoc: number | null;
  daily_strain: number | null;
  sedentary_hours: number | null;
  sedentary_breaks: number | null;
  time_in_range_percent: number | null;
  glycemic_variability_cv: number | null;
  gmi_percent: number | null;
  post_prandial_peak_mgdl: number | null;
  time_below_range_percent: number | null;
  iauc_per_meal_mgdl_h: number | null;
  whtr_ratio: number | null;
  protein_g_per_kg: number | null;
  dietary_fiber_grams: number | null;
  eating_window_hours: number | null;
  sodium_potassium_ratio: number | null;
  hydration_ml_per_kg: number | null;
  reaction_time_pvt_ms: number | null;
  pvt_lapses_count: number | null;
  cognitive_test_score: number | null;
  hrv_stress_index: number | null;
  eda_tonic_microsiemens: number | null;
  afib_history_percent: number | null;
}

export interface GoalRow extends AuditedRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_value: number | null;
  current_value: number;
  unit: string | null;
  status: string;
}

export interface HabitRow extends TimestampedRow {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  frequency: string;
}

export interface SuggestedHabitRow extends TimestampedRow {
  id: string;
  name: string;
  frequency: string;
  is_active: boolean;
}

export interface AITipRow extends TimestampedRow {
  id: string;
  title: string;
  detail: string;
  category: string | null;
  is_active: boolean;
}

export interface AIConfigRow {
  id: string;
  mission: string;
  key_objectives: string;
  weight_hrv: number;
  weight_sleep: number;
  weight_activity: number;
  weight_nutrition: number;
  model_name: string | null;
  updated_at: DateTimeString;
}

export interface AIPlanRow extends AuditedRow {
  id: string;
  user_id: string;
  plan_data: QueryRecord;
}

export interface ProfessionalRow extends AuditedRow {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  contact: string | null;
  avatar_url: string | null;
}

export interface AppointmentRow extends AuditedRow {
  id: string;
  user_id: string;
  professional_id: string;
  appointment_time: DateTimeString;
  status: string;
  notes: string | null;
  meeting_link: string | null;
  professionals: Pick<
    ProfessionalRow,
    'name' | 'specialty' | 'avatar_url'
  > | null;
}

export interface InstrumentRow {
  id: number;
  name: string;
}

export interface UserAssessmentRow extends AuditedRow {
  id: string;
  user_id: string;
  assessment_type: 'who5' | 'nps' | 'mood' | 'adherence';
  score_value: number;
  raw_responses: QueryRecord | null;
  notes: string | null;
}

export interface UserStreakRow extends AuditedRow {
  id: string;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: DateString;
}

export interface TableRowMap {
  profiles: ProfileRow;
  daily_metrics: DailyMetricRow;
  goals: GoalRow;
  habits: HabitRow;
  suggested_habits: SuggestedHabitRow;
  ai_tips: AITipRow;
  ai_config: AIConfigRow;
  ai_plans: AIPlanRow;
  appointments: AppointmentRow;
  professionals: ProfessionalRow;
  instruments: InstrumentRow;
  user_assessments: UserAssessmentRow;
  user_streaks: UserStreakRow;
}

export type TableRow<K extends TableName> = TableRowMap[K];
