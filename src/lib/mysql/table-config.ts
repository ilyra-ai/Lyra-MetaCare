export type TableName =
  | 'profiles'
  | 'daily_metrics'
  | 'goals'
  | 'habits'
  | 'suggested_habits'
  | 'ai_tips'
  | 'ai_config'
  | 'ai_knowledge_documents'
  | 'ai_plans'
  | 'appointments'
  | 'professionals'
  | 'user_assessments'
  | 'user_streaks';

export type QueryFilter =
  | { type: 'eq'; column: string; value: unknown }
  | { type: 'gte'; column: string; value: unknown }
  | { type: 'lte'; column: string; value: unknown }
  | { type: 'not'; column: string; operator: string; value: unknown }
  | { type: 'or'; expression: string };

export interface QueryOrder {
  column: string;
  ascending: boolean;
  foreignTable?: string;
}

interface TableConfig {
  columns: string[];
  /** Coluna que liga a linha ao usuário dono (escopo de leitura e escrita). */
  userScopedBy?: string;
  adminOnlyCrud?: boolean;
  /**
   * Leitura restrita a administradores: a tabela só é usada pelo painel
   * administrativo; os recursos do app que dependem dela a leem no servidor.
   */
  adminOnlyRead?: boolean;
  /**
   * Administradores alcançam linhas de outras contas, mas só nas colunas de
   * `adminReadColumns` (leitura, filtro e ordenação) e `adminWriteColumns`
   * (alteração). LGPD: dados de saúde e de perfil sensível ficam só com o
   * titular; o administrador vê o necessário para gerir contas e planos.
   * Tabelas sem esta marca são só do titular, inclusive para administradores.
   */
  adminReadAll?: boolean;
  adminReadColumns?: readonly string[];
  adminWriteColumns?: readonly string[];
  /** Colunas que só administradores podem gravar (ex.: o papel do usuário). */
  adminOnlyColumns?: string[];
  /**
   * Tabela gravada só por uma rota própria, com validação de faixa e regras
   * de mesclagem; a API genérica apenas lê. O texto é a mensagem do 403.
   */
  escritaSoPorRotaPropria?: string;
  /**
   * Colunas que a API genérica só lê: mudam por uma rota própria que grava
   * junto dados derivados (ex.: o local de nascimento com coordenadas e
   * fuso). Vale também para administradores.
   */
  colunasSoPorRotaPropria?: { colunas: readonly string[]; mensagem: string };
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
      'birth_city_id',
      'residence_location',
      'residence_city_id',
      'avatar_url',
      'tracks_menstrual_cycle',
      'last_menstrual_period',
      'menstrual_cycle_length',
      'menstrual_period_length',
      'menstrual_life_stage',
      'created_at',
      'updated_at',
    ],
    userScopedBy: 'id',
    // Local de nascimento e de moradia vêm da base de cidades, com
    // coordenadas e fuso (que nem passam pela API genérica): só pela rota
    // /api/perfil/localizacao.
    colunasSoPorRotaPropria: {
      colunas: [
        'birth_location',
        'birth_city_id',
        'residence_location',
        'residence_city_id',
      ],
      mensagem:
        'O local de nascimento e o de moradia são escolhidos na lista de cidades (/api/perfil/localizacao).',
    },
    // Gestão de contas: identificação, papel e status do onboarding. Data,
    // hora e local de nascimento, gênero, idade, metas, atividade e ciclo
    // menstrual ficam só com o titular.
    adminReadAll: true,
    adminReadColumns: [
      'id',
      'first_name',
      'last_name',
      'email',
      'role',
      'onboarding_completed',
      'avatar_url',
      'created_at',
      'updated_at',
    ],
    adminWriteColumns: ['onboarding_completed', 'role'],
    // O papel vai para o token de sessão no login: só um administrador pode
    // alterá-lo (impede a autopromoção a admin).
    adminOnlyColumns: ['role'],
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
      'afib_history_percent',
      'menstrual_flow',
      'energy_level',
      'sensor_heart_rate_avg',
      'sensor_minutes',
      'metrics_updated_at',
    ],
    userScopedBy: 'user_id',
    // Painel "Saúde dos dados": só quem registrou e quando (contagens e
    // atividade), nunca os valores biométricos. Nenhuma alteração.
    adminReadAll: true,
    adminReadColumns: ['id', 'user_id', 'date', 'created_at'],
    adminWriteColumns: [],
    escritaSoPorRotaPropria:
      'As métricas do dia são gravadas pelo registro do dia (/api/metricas/dia) e pela pulseira (/api/metricas/sensor).',
  },
  goals: {
    columns: [
      'id',
      'user_id',
      'title',
      'description',
      'category',
      'target_value',
      'current_value',
      'unit',
      'metric_key',
      'metric_direction',
      'deadline',
      'auto_sample_days',
      'auto_updated_at',
      'status',
      'created_at',
      'updated_at',
    ],
    userScopedBy: 'user_id',
    // Metas automáticas nascem e são recalculadas no servidor, a partir do
    // registro do dia (/api/metas).
    colunasSoPorRotaPropria: {
      colunas: [
        'metric_key',
        'metric_direction',
        'auto_sample_days',
        'auto_updated_at',
      ],
      mensagem:
        'Metas automáticas são criadas e recalculadas pelo servidor (/api/metas).',
    },
  },
  habits: {
    columns: ['id', 'user_id', 'name', 'is_active', 'frequency', 'created_at'],
    userScopedBy: 'user_id',
  },
  suggested_habits: {
    columns: ['id', 'name', 'frequency', 'is_active', 'created_at'],
    adminOnlyCrud: true,
  },
  ai_tips: {
    columns: ['id', 'title', 'detail', 'category', 'is_active', 'created_at'],
    adminOnlyCrud: true,
  },
  ai_config: {
    columns: [
      'id',
      'mission',
      'key_objectives',
      'weight_hrv',
      'weight_sleep',
      'weight_activity',
      'weight_nutrition',
      'updated_at',
    ],
    adminOnlyCrud: true,
    // Missão, objetivos e pesos do motor: lidos no servidor pelas funções de
    // IA (calculate-longevity-score); o cliente só os acessa no painel admin.
    adminOnlyRead: true,
  },
  ai_knowledge_documents: {
    columns: [
      'id',
      'title',
      'category',
      'content',
      'is_active',
      'priority',
      'created_at',
      'updated_at',
    ],
    adminOnlyCrud: true,
    // Base de conhecimento (inclusive rascunhos inativos): injetada no
    // servidor pelo ask-ai-assistant; só o painel admin a lê pelo cliente.
    adminOnlyRead: true,
  },
  ai_plans: {
    columns: ['id', 'user_id', 'plan_data', 'created_at', 'updated_at'],
    userScopedBy: 'user_id',
  },
  appointments: {
    columns: [
      'id',
      'user_id',
      'professional_id',
      'appointment_time',
      'status',
      'notes',
      'meeting_link',
      'created_at',
      'updated_at',
    ],
    userScopedBy: 'user_id',
  },
  professionals: {
    columns: [
      'id',
      'user_id',
      'name',
      'specialty',
      'contact',
      'avatar_url',
      'created_at',
      'updated_at',
    ],
    userScopedBy: 'user_id',
  },
  user_assessments: {
    columns: [
      'id',
      'user_id',
      'assessment_type',
      'score_value',
      'raw_responses',
      'notes',
      'created_at',
      'updated_at',
    ],
    userScopedBy: 'user_id',
  },
  user_streaks: {
    columns: [
      'id',
      'user_id',
      'streak_type',
      'current_streak',
      'longest_streak',
      'last_activity_date',
      'created_at',
      'updated_at',
    ],
    userScopedBy: 'user_id',
    escritaSoPorRotaPropria:
      'As sequências são calculadas pelo servidor a partir do registro do dia.',
  },
};

export const NUMERIC_METRIC_COLUMNS = TABLE_CONFIG.daily_metrics.columns.filter(
  (column) => !['id', 'user_id', 'date', 'created_at'].includes(column)
);
