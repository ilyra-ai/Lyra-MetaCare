export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ai_config: {
        Row: {
          id: string
          mission: string
          key_objectives: string
          weight_hrv: number
          weight_sleep: number
          weight_activity: number
          weight_nutrition: number
          model_name: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          mission: string
          key_objectives: string
          weight_hrv?: number
          weight_sleep?: number
          weight_activity?: number
          weight_nutrition?: number
          model_name?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          mission?: string
          key_objectives?: string
          weight_hrv?: number
          weight_sleep?: number
          weight_activity?: number
          weight_nutrition?: number
          model_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cidade: {
        Row: {
          id: number
          nome: string | null
          uf: number | null
          ibge: number | null
        }
        Insert: {
          id: number
          nome?: string | null
          uf?: number | null
          ibge?: number | null
        }
        Update: {
          id?: number
          nome?: string | null
          uf?: number | null
          ibge?: number | null
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          id: string
          user_id: string
          date: string
          steps: number
          sleep_duration_minutes: number
          resting_heart_rate: number | null
          calories_burned: number | null
          created_at: string | null
          hrv_ms: number | null
          deep_sleep_minutes: number
          resting_heart_rate_min: number | null
          resting_heart_rate_max: number | null
          spo2_average: number | null
          respiratory_rate: number | null
          body_temperature_celsius: number | null
          total_distance_km: number
          active_minutes: number
          workout_calories: number
          vo2_max: number | null
          sleep_latency_minutes: number | null
          rem_sleep_minutes: number
          light_sleep_minutes: number
          sleep_efficiency: number | null
          sleep_score: number | null
          protein_grams: number
          carb_grams: number
          fat_grams: number
          water_liters: number
          caffeine_mg: number
          stress_score: number | null
          recovery_score: number | null
          readiness_score: number | null
          blood_glucose_mgdl: number | null
          blood_pressure_systolic: number | null
          blood_pressure_diastolic: number | null
          weight_kg: number | null
          mood_score: number | null
          meditation_minutes: number
          hrr_1min_bpm: number | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          steps?: number
          sleep_duration_minutes?: number
          resting_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string | null
          hrv_ms?: number | null
          deep_sleep_minutes?: number
          resting_heart_rate_min?: number | null
          resting_heart_rate_max?: number | null
          spo2_average?: number | null
          respiratory_rate?: number | null
          body_temperature_celsius?: number | null
          total_distance_km?: number
          active_minutes?: number
          workout_calories?: number
          vo2_max?: number | null
          sleep_latency_minutes?: number | null
          rem_sleep_minutes?: number
          light_sleep_minutes?: number
          sleep_efficiency?: number | null
          sleep_score?: number | null
          protein_grams?: number
          carb_grams?: number
          fat_grams?: number
          water_liters?: number
          caffeine_mg?: number
          stress_score?: number | null
          recovery_score?: number | null
          readiness_score?: number | null
          blood_glucose_mgdl?: number | null
          blood_pressure_systolic?: number | null
          blood_pressure_diastolic?: number | null
          weight_kg?: number | null
          mood_score?: number | null
          meditation_minutes?: number
          hrr_1min_bpm?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          steps?: number
          sleep_duration_minutes?: number
          resting_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string | null
          hrv_ms?: number | null
          deep_sleep_minutes?: number
          resting_heart_rate_min?: number | null
          resting_heart_rate_max?: number | null
          spo2_average?: number | null
          respiratory_rate?: number | null
          body_temperature_celsius?: number | null
          total_distance_km?: number
          active_minutes?: number
          workout_calories?: number
          vo2_max?: number | null
          sleep_latency_minutes?: number | null
          rem_sleep_minutes?: number
          light_sleep_minutes?: number
          sleep_efficiency?: number | null
          sleep_score?: number | null
          protein_grams?: number
          carb_grams?: number
          fat_grams?: number
          water_liters?: number
          caffeine_mg?: number
          stress_score?: number | null
          recovery_score?: number | null
          readiness_score?: number | null
          blood_glucose_mgdl?: number | null
          blood_pressure_systolic?: number | null
          blood_pressure_diastolic?: number | null
          weight_kg?: number | null
          mood_score?: number | null
          meditation_minutes?: number
          hrr_1min_bpm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      estado: {
        Row: {
          id: number
          nome: string | null
          uf: string | null
          ibge: number | null
          pais: number | null
          ddd: string | null
        }
        Insert: {
          id: number
          nome?: string | null
          uf?: string | null
          ibge?: number | null
          pais?: number | null
          ddd?: string | null
        }
        Update: {
          id?: number
          nome?: string | null
          uf?: string | null
          ibge?: number | null
          pais?: number | null
          ddd?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          target_value: number | null
          current_value: number
          unit: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          target_value?: number | null
          current_value?: number
          unit?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string | null
          target_value?: number | null
          current_value?: number
          unit?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      instruments: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      pais: {
        Row: {
          id: number
          nome: string | null
          nome_pt: string | null
          sigla: string | null
          bacen: number | null
        }
        Insert: {
          id: number
          nome?: string | null
          nome_pt?: string | null
          sigla?: string | null
          bacen?: number | null
        }
        Update: {
          id?: number
          nome?: string | null
          nome_pt?: string | null
          sigla?: string | null
          bacen?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          age: number | null
          gender: string | null
          activity_level: number | null
          goals: string[] | null
          onboarding_completed: boolean
          first_name: string | null
          last_name: string | null
          birth_date: string | null
          birth_time: string | null
          birth_location: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          age?: number | null
          gender?: string | null
          activity_level?: number | null
          goals?: string[] | null
          onboarding_completed?: boolean
          first_name?: string | null
          last_name?: string | null
          birth_date?: string | null
          birth_time?: string | null
          birth_location?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          age?: number | null
          gender?: string | null
          activity_level?: number | null
          goals?: string[] | null
          onboarding_completed?: boolean
          first_name?: string | null
          last_name?: string | null
          birth_date?: string | null
          birth_time?: string | null
          birth_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: {}
        Returns: Record<string, unknown>
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never