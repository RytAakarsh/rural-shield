export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_analytics: {
        Row: {
          coercion_indicators: Json | null
          created_at: string
          device_motion_anomaly: number | null
          hesitation_score: number | null
          id: string
          touch_pressure_variance: number | null
          transaction_id: string | null
          typing_rhythm_anomaly: number | null
          user_id: string
        }
        Insert: {
          coercion_indicators?: Json | null
          created_at?: string
          device_motion_anomaly?: number | null
          hesitation_score?: number | null
          id?: string
          touch_pressure_variance?: number | null
          transaction_id?: string | null
          typing_rhythm_anomaly?: number | null
          user_id: string
        }
        Update: {
          coercion_indicators?: Json | null
          created_at?: string
          device_motion_anomaly?: number | null
          hesitation_score?: number | null
          id?: string
          touch_pressure_variance?: number | null
          transaction_id?: string | null
          typing_rhythm_anomaly?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_analytics_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string
          id: string
          resolved_at: string | null
          severity: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          resolved_at?: string | null
          severity: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          resolved_at?: string | null
          severity?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_rings: {
        Row: {
          detected_at: string
          detection_confidence: number
          id: string
          member_user_ids: string[]
          network_metadata: Json | null
          pattern_type: string
          resolved_at: string | null
          ring_name: string
          status: string | null
        }
        Insert: {
          detected_at?: string
          detection_confidence: number
          id?: string
          member_user_ids: string[]
          network_metadata?: Json | null
          pattern_type: string
          resolved_at?: string | null
          ring_name: string
          status?: string | null
        }
        Update: {
          detected_at?: string
          detection_confidence?: number
          id?: string
          member_user_ids?: string[]
          network_metadata?: Json | null
          pattern_type?: string
          resolved_at?: string | null
          ring_name?: string
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scam_signals: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          recommendation: string
          severity: string
          signal_type: string
          transaction_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          recommendation: string
          severity: string
          signal_type: string
          transaction_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          recommendation?: string
          severity?: string
          signal_type?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scam_signals_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      security_layers: {
        Row: {
          id: string
          layer_number: number
          metrics: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          layer_number: number
          metrics?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          layer_number?: number
          metrics?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transaction_network: {
        Row: {
          created_at: string
          edge_type: string
          edge_weight: number | null
          id: string
          source_user_id: string
          target_user_id: string | null
          transaction_id: string | null
        }
        Insert: {
          created_at?: string
          edge_type: string
          edge_weight?: number | null
          id?: string
          source_user_id: string
          target_user_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          created_at?: string
          edge_type?: string
          edge_weight?: number | null
          id?: string
          source_user_id?: string
          target_user_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_network_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          behavioral_flags: Json | null
          beneficiary_id: string | null
          beneficiary_name: string | null
          completed_at: string | null
          created_at: string
          device_id: string | null
          id: string
          intervention_type: string | null
          ip_address: string | null
          network_flags: Json | null
          risk_score: number | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          behavioral_flags?: Json | null
          beneficiary_id?: string | null
          beneficiary_name?: string | null
          completed_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          intervention_type?: string | null
          ip_address?: string | null
          network_flags?: Json | null
          risk_score?: number | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          behavioral_flags?: Json | null
          beneficiary_id?: string | null
          beneficiary_name?: string | null
          completed_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          intervention_type?: string | null
          ip_address?: string | null
          network_flags?: Json | null
          risk_score?: number | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      trust_scores: {
        Row: {
          created_at: string | null
          id: string
          layer_1_score: number | null
          layer_2_score: number | null
          layer_3_score: number | null
          score: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          layer_1_score?: number | null
          layer_2_score?: number | null
          layer_3_score?: number | null
          score: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          layer_1_score?: number | null
          layer_2_score?: number | null
          layer_3_score?: number | null
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_history: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          status: string
          user_id: string | null
          verification_type: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          status: string
          user_id?: string | null
          verification_type: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          status?: string
          user_id?: string | null
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
