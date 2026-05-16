export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_farms: {
        Row: {
          alert_id: string
          customer_id: string
        }
        Insert: {
          alert_id: string
          customer_id: string
        }
        Update: {
          alert_id?: string
          customer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_farms_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_farms_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          action: string | null
          batch_id: string | null
          closed: boolean
          closed_at: string | null
          closed_by: string | null
          closed_reason: string | null
          created_at: string
          description: string | null
          nursery_id: string
          id: string
          sev: Database["public"]["Enums"]["alert_severity"]
          title: string
        }
        Insert: {
          action?: string | null
          batch_id?: string | null
          closed?: boolean
          closed_at?: string | null
          closed_by?: string | null
          closed_reason?: string | null
          created_at?: string
          description?: string | null
          nursery_id: string
          id?: string
          sev: Database["public"]["Enums"]["alert_severity"]
          title: string
        }
        Update: {
          action?: string | null
          batch_id?: string | null
          closed?: boolean
          closed_at?: string | null
          closed_by?: string | null
          closed_reason?: string | null
          created_at?: string
          description?: string | null
          nursery_id?: string
          id?: string
          sev?: Database["public"]["Enums"]["alert_severity"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          nursery_id: string
          id: number
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          nursery_id: string
          id?: number
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          nursery_id?: string
          id?: number
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_buyers: {
        Row: {
          batch_id: string
          created_at: string
          customer_id: string
          d30: number | null
          pl_purchased: number
        }
        Insert: {
          batch_id: string
          created_at?: string
          customer_id: string
          d30?: number | null
          pl_purchased?: number
        }
        Update: {
          batch_id?: string
          created_at?: string
          customer_id?: string
          d30?: number | null
          pl_purchased?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_buyers_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_buyers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          created_at: string
          date: string
          dist: Json
          nursery_id: string
          id: string
          mean_d30: number | null
          pcr: Database["public"]["Enums"]["pcr_status"]
          pl_produced: number
          pl_sold: number
          source: string
        }
        Insert: {
          created_at?: string
          date: string
          dist?: Json
          nursery_id: string
          id: string
          mean_d30?: number | null
          pcr?: Database["public"]["Enums"]["pcr_status"]
          pl_produced?: number
          pl_sold?: number
          source: string
        }
        Update: {
          created_at?: string
          date?: string
          dist?: Json
          nursery_id?: string
          id?: string
          mean_d30?: number | null
          pcr?: Database["public"]["Enums"]["pcr_status"]
          pl_produced?: number
          pl_sold?: number
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_bind_tokens: {
        Row: {
          consumed_at: string | null
          consumed_line_user_id: string | null
          created_at: string
          created_by: string
          customer_id: string
          expires_at: string
          nursery_id: string
          token: string
        }
        Insert: {
          consumed_at?: string | null
          consumed_line_user_id?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          expires_at: string
          nursery_id: string
          token: string
        }
        Update: {
          consumed_at?: string | null
          consumed_line_user_id?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          expires_at?: string
          nursery_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_bind_tokens_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_bind_tokens_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_bind_tokens_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_cycles: {
        Row: {
          customer_id: string
          cycle_day: number | null
          d30: number | null
          d60: number | null
          expected_harvest: string | null
          restock_in: number | null
          updated_at: string
        }
        Insert: {
          customer_id: string
          cycle_day?: number | null
          d30?: number | null
          d60?: number | null
          expected_harvest?: string | null
          restock_in?: number | null
          updated_at?: string
        }
        Update: {
          customer_id?: string
          cycle_day?: number | null
          d30?: number | null
          d60?: number | null
          expected_harvest?: string | null
          restock_in?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_cycles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          farm: string
          farm_en: string | null
          nursery_id: string
          id: string
          last_buy: string | null
          line_id: string | null
          ltv: number
          name: string
          package_interest: string | null
          phone: string | null
          status: Database["public"]["Enums"]["customer_status"]
          zone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          farm: string
          farm_en?: string | null
          nursery_id: string
          id?: string
          last_buy?: string | null
          line_id?: string | null
          ltv?: number
          name: string
          package_interest?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          zone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          farm?: string
          farm_en?: string | null
          nursery_id?: string
          id?: string
          last_buy?: string | null
          line_id?: string | null
          ltv?: number
          name?: string
          package_interest?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      nurseries: {
        Row: {
          created_at: string
          id: string
          location: string | null
          location_en: string | null
          name: string
          name_en: string | null
          plan: string
          registration_no: string | null
          restock_thresholds: Json
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_cancel_at_period_end: boolean
          subscription_current_period_end: string | null
          subscription_status: string
          trial_ends_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          location_en?: string | null
          name: string
          name_en?: string | null
          plan?: string
          registration_no?: string | null
          restock_thresholds?: Json
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_cancel_at_period_end?: boolean
          subscription_current_period_end?: string | null
          subscription_status?: string
          trial_ends_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          location_en?: string | null
          name?: string
          name_en?: string | null
          plan?: string
          registration_no?: string | null
          restock_thresholds?: Json
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_cancel_at_period_end?: boolean
          subscription_current_period_end?: string | null
          subscription_status?: string
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      nursery_brand: {
        Row: {
          brand_color: string
          display_name_en: string
          display_name_th: string
          nursery_id: string
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          brand_color?: string
          display_name_en: string
          display_name_th: string
          nursery_id: string
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          brand_color?: string
          display_name_en?: string
          display_name_th?: string
          nursery_id?: string
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nursery_brand_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: true
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursery_brand_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: true
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      nursery_members: {
        Row: {
          created_at: string
          nursery_id: string
          role: Database["public"]["Enums"]["nursery_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          nursery_id: string
          role?: Database["public"]["Enums"]["nursery_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          nursery_id?: string
          role?: Database["public"]["Enums"]["nursery_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nursery_members_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursery_members_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      line_outbound_events: {
        Row: {
          attempts: number
          created_at: string
          created_by: string | null
          customer_id: string
          nursery_id: string
          id: string
          kind: Database["public"]["Enums"]["line_event_kind"]
          last_error: string | null
          line_user_id: string
          payload: Json
          scheduled_for: string
          sent_at: string | null
          status: Database["public"]["Enums"]["line_event_status"]
          template: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          created_by?: string | null
          customer_id: string
          nursery_id: string
          id?: string
          kind?: Database["public"]["Enums"]["line_event_kind"]
          last_error?: string | null
          line_user_id: string
          payload: Json
          scheduled_for?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["line_event_status"]
          template: string
        }
        Update: {
          attempts?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string
          nursery_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["line_event_kind"]
          last_error?: string | null
          line_user_id?: string
          payload?: Json
          scheduled_for?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["line_event_status"]
          template?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_outbound_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_outbound_events_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_outbound_events_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          disease: boolean
          nursery_id: string
          line_reply: boolean
          low_d30: boolean
          price_move: boolean
          restock: boolean
          updated_at: string
          weekly: boolean
        }
        Insert: {
          disease?: boolean
          nursery_id: string
          line_reply?: boolean
          low_d30?: boolean
          price_move?: boolean
          restock?: boolean
          updated_at?: string
          weekly?: boolean
        }
        Update: {
          disease?: boolean
          nursery_id?: string
          line_reply?: boolean
          low_d30?: boolean
          price_move?: boolean
          restock?: boolean
          updated_at?: string
          weekly?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: true
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_settings_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: true
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      pcr_results: {
        Row: {
          batch_id: string
          created_at: string
          disease: string
          file_url: string | null
          id: string
          lab: string | null
          status: string
          tested_on: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string
          disease: string
          file_url?: string | null
          id?: string
          lab?: string | null
          status: string
          tested_on?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          disease?: string
          file_url?: string | null
          id?: string
          lab?: string | null
          status?: string
          tested_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pcr_results_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      scorecard_settings: {
        Row: {
          nursery_id: string
          public: boolean
          show_d30: boolean
          show_pcr: boolean
          show_retention: boolean
          show_reviews: boolean
          show_volume: boolean
          updated_at: string
        }
        Insert: {
          nursery_id: string
          public?: boolean
          show_d30?: boolean
          show_pcr?: boolean
          show_retention?: boolean
          show_reviews?: boolean
          show_volume?: boolean
          updated_at?: string
        }
        Update: {
          nursery_id?: string
          public?: boolean
          show_d30?: boolean
          show_pcr?: boolean
          show_retention?: boolean
          show_reviews?: boolean
          show_volume?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scorecard_settings_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: true
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scorecard_settings_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: true
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_events: {
        Row: {
          created_at: string
          nursery_id: string | null
          id: number
          payload: Json | null
          stripe_event_id: string
          type: string
        }
        Insert: {
          created_at?: string
          nursery_id?: string | null
          id?: number
          payload?: Json | null
          stripe_event_id: string
          type: string
        }
        Update: {
          created_at?: string
          nursery_id?: string | null
          id?: number
          payload?: Json | null
          stripe_event_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_events_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          created_by: string
          email: string
          expires_at: string
          nursery_id: string
          id: string
          role: Database["public"]["Enums"]["nursery_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          created_by: string
          email: string
          expires_at?: string
          nursery_id: string
          id?: string
          role: Database["public"]["Enums"]["nursery_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          nursery_id?: string
          id?: string
          role?: Database["public"]["Enums"]["nursery_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "nurseries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invites_nursery_id_fkey"
            columns: ["nursery_id"]
            isOneToOne: false
            referencedRelation: "public_scorecard"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_scorecard: {
        Row: {
          id: string | null
          location: string | null
          location_en: string | null
          name: string | null
          name_en: string | null
          public: boolean | null
          show_d30: boolean | null
          show_pcr: boolean | null
          show_retention: boolean | null
          show_volume: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_nursery: {
        Args: { p_location?: string; p_name: string; p_name_en?: string }
        Returns: string
      }
      current_user_nursery_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      alert_severity: "high" | "medium" | "low"
      customer_status:
        | "active"
        | "restock-soon"
        | "restock-now"
        | "concern"
        | "quiet"
      nursery_role: "owner" | "counter_staff" | "lab_tech" | "auditor"
      line_event_kind: "template_push" | "chat_nudge"
      line_event_status: "pending" | "sending" | "sent" | "failed" | "dead"
      pcr_status: "clean" | "flagged" | "pending"
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
      alert_severity: ["high", "medium", "low"],
      customer_status: [
        "active",
        "restock-soon",
        "restock-now",
        "concern",
        "quiet",
      ],
      nursery_role: ["owner", "counter_staff", "lab_tech", "auditor"],
      line_event_kind: ["template_push", "chat_nudge"],
      line_event_status: ["pending", "sending", "sent", "failed", "dead"],
      pcr_status: ["clean", "flagged", "pending"],
    },
  },
} as const
