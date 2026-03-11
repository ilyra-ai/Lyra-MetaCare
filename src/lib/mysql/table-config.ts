export type TableName =
  | 'profiles'
  | 'daily_metrics'
  | 'goals'
  | 'habits'
  | 'suggested_habits'
  | 'ai_tips'
  | 'ai_config'
  | 'ai_plans'
  | 'appointments'
  | 'professionals'
  | 'instruments';

interface TableConfig {
  columns: string[];
  userScopedBy?: string;
  publicRead?: boolean;
  adminOnlyCrud?: boolean;
  adminReadAll?: boolean;
}

export const TABLE_CONFIG: Record<TableName, TableConfig> = {
  profiles: {
    columns: [
      'id',
      'first_name',
      'last_name',
      'email',
      'onboarding_completed',
      'role',
      'age',
      'gender',
      'activity_level',
      'goals',
      'birth_date',
      'birth_time',
      'birth_location',
      'avatar_url',
      'created_at',
      'updated_at'
    ],
    userScopedBy: 'id',
    adminReadAll: true
  },
  daily_metrics: {
    columns: [
      'id',
      'user_id',
      'date',
      'steps',
      'sleep_duration_minutes',
      'resting_heart_rate',
      'calories_burned',
      'created_at',
      'hrv_ms',
      'deep_sleep_minutes',
      'resting_heart_rate_min',
      'resting_heart_rate_max',
      'spo2_average',
      'respiratory_rate',
      'body_temperature_celsius',
      'total_distance_km',
      'active_minutes',
      'workout_calories',
      'vo2_max',
      'sleep_latency_minutes',
      'rem_sleep_minutes',
      'light_sleep_minutes',
      'sleep_efficiency',
      'sleep_score',
      'protein_grams',
      'carb_grams',
      'fat_grams',
      'water_liters',
      'caffeine_mg',
      'stress_score',
      'recovery_score',
      'readiness_score',
      'blood_glucose_mgdl',
      'blood_pressure_systolic',
      'blood_pressure_diastolic',
      'weight_kg',
      'mood_score',
      'meditation_minutes',
      'hrr_1min_bpm',
      'sleep_regularity_index',
      'social_jetlag_hours',
      'waso_minutes',
      'training_load_epoc',
      'daily_strain',
      'sedentary_hours',
      'sedentary_breaks',
      'time_in_range_percent',
      'glycemic_variability_cv',
      'gmi_percent',
      'post_prandial_peak_mgdl',
      'time_below_range_percent',
      'iauc_per_meal_mgdl_h',
      'whtr_ratio',
      'protein_g_per_kg',
      'dietary_fiber_grams',
      'eating_window_hours',
      'sodium_potassium_ratio',
      'hydration_ml_per_kg',
      'reaction_time_pvt_ms',
      'pvt_lapses_count',
      'cognitive_test_score',
      'hrv_stress_index',
      'eda_tonic_microsiemens',
      'afib_history_percent'
    ],
    userScopedBy: 'user_id',
    adminReadAll: true
  },
  goals: {
    columns: ['id', 'user_id', 'title', 'description', 'category', 'target_value', 'current_value', 'unit', 'status', 'created_at', 'updated_at'],
    userScopedBy: 'user_id',
    adminReadAll: true
  },
  habits: {
    columns: ['id', 'user_id', 'name', 'is_active', 'frequency', 'created_at'],
    userScopedBy: 'user_id',
    adminReadAll: true
  },
  suggested_habits: {
    columns: ['id', 'name', 'frequency', 'is_active', 'created_at'],
    adminOnlyCrud: true
  },
  ai_tips: {
    columns: ['id', 'title', 'detail', 'category', 'is_active', 'created_at'],
    adminOnlyCrud: true
  },
  ai_config: {
    columns: ['id', 'mission', 'key_objectives', 'weight_hrv', 'weight_sleep', 'weight_activity', 'weight_nutrition', 'model_name', 'updated_at'],
    adminOnlyCrud: true
  },
  ai_plans: {
    columns: ['id', 'user_id', 'plan_data', 'created_at', 'updated_at'],
    userScopedBy: 'user_id',
    adminReadAll: true
  },
  appointments: {
    columns: ['id', 'user_id', 'professional_id', 'appointment_time', 'status', 'notes', 'meeting_link', 'created_at', 'updated_at'],
    userScopedBy: 'user_id',
    adminReadAll: true
  },
  professionals: {
    columns: ['id', 'user_id', 'name', 'specialty', 'contact', 'avatar_url', 'created_at', 'updated_at'],
    userScopedBy: 'user_id',
    adminReadAll: true
  },
  instruments: {
    columns: ['id', 'name'],
    publicRead: true
  }
};

export const NUMERIC_METRIC_COLUMNS = TABLE_CONFIG.daily_metrics.columns.filter((column) =>
  !['id', 'user_id', 'date', 'created_at'].includes(column)
);
