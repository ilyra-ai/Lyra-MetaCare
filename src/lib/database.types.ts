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
      ai_tips: {
        Row: {
          id: string
          title: string
          detail: string
          category: string | null
          is_active: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          detail: string
          category?: string | null
          is_active?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          detail?: string
          category?: string | null
          is_active?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
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
          sleep_regularity_index: number | null
          social_jetlag_hours: number | null
          waso_minutes: number | null
          training_load_epoc: number | null
          daily_strain: number | null
          sedentary_hours: number | null
          sedentary_breaks: number | null
          time_in_range_percent: number | null
          glycemic_variability_cv: number | null
          gmi_percent: number | null
          post_prandial_peak_mgdl: number | null
          time_below_range_percent: number | null
          iauc_per_meal_mgdl_h: number | null
          whtr_ratio: number | null
          protein_g_per_kg: number | null
          dietary_fiber_grams: number | null
          eating_window_hours: number | null
          sodium_potassium_ratio: number | null
          hydration_ml_per_kg: number | null
          reaction_time_pvt_ms: number | null
          pvt_lapses_count: number | null
          cognitive_test_score: number | null
          hrv_stress_index: number | null
          eda_tonic_microsiemens: number | null
          afib_history_percent: number | null
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
          sleep_regularity_index?: number | null
          social_jetlag_hours?: number | null
          waso_minutes?: number | null
          training_load_epoc?: number | null
          daily_strain?: number | null
          sedentary_hours?: number | null
          sedentary_breaks?: number | null
          time_in_range_percent?: number | null
          glycemic_variability_cv?: number | null
          gmi_percent?: number | null
          post_prandial_peak_mgdl?: number | null
          time_below_range_percent?: number | null
          iauc_per_meal_mgdl_h?: number | null
          whtr_ratio?: number | null
          protein_g_per_kg?: number | null
          dietary_fiber_grams?: number | null
          eating_window_hours?: number | null
          sodium_potassium_ratio?: number | null
          hydration_ml_per_kg?: number | null
          reaction_time_pvt_ms?: number | null
          pvt_lapses_count?: number | null
          cognitive_test_score?: number | null
          hrv_stress_index?: number | null
          eda_tonic_microsiemens?: number | null
          afib_history_percent?: number | null
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
          sleep_regularity_index?: number | null
          social_jetlag_hours?: number | null
          waso_minutes?: number | null
          training_load_epoc?: number | null
          daily_strain?: number | null
          sedentary_hours?: number | null
          sedentary_breaks?: number | null
          time_in_range_percent?: number | null
          glycemic_variability_cv?: number | null
          gmi_percent?: number | null
          post_prandial_peak_mgdl?: number | null
          time_below_range_percent?: number | null
          iauc_per_meal_mgdl_h?: number | null
          whtr_ratio?: number | null
          protein_g_per_kg?: number | null
          dietary_fiber_grams?: number | null
          eating_window_hours?: number | null
          sodium_potassium_ratio?: number | null
          hydration_ml_per_kg?: number | null
          reaction_time_pvt_ms?: number | null
          pvt_lapses_count?: number | null
          cognitive_test_score?: number | null
          hrv_stress_index?: number | null
          eda_tonic_microsiemens?: number | null
          afib_history_percent?: number | null
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
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          is_active: boolean
          frequency: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          is_active?: boolean
          frequency?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          is_active?: boolean
          frequency?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
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
          id: number
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
          avatar_url: string | null
          email: string | null
          created_at: string | null
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
          avatar_url?: string | null
          email?: string | null
          created_at?: string | null
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
          avatar_url?: string | null
          email?: string | null
          created_at?: string | null
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
      suggested_habits: {
        Row: {
          id: string
          name: string
          frequency: string
          is_active: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          frequency: string
          is_active?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          frequency?: string
          is_active?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: Record<PropertyKey, never>
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