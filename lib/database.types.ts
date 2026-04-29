// Placeholder typed Database — replace with output of:
//   pnpm exec supabase gen types typescript --linked > lib/database.types.ts
// once the Supabase project is provisioned.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      hatcheries: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          location: string | null;
          location_en: string | null;
          registration_no: string | null;
          plan: string;
          trial_ends_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status:
            | 'trialing'
            | 'trial_expired'
            | 'active'
            | 'past_due'
            | 'canceled'
            | 'incomplete';
          subscription_current_period_end: string | null;
          subscription_cancel_at_period_end: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['hatcheries']['Row']> & {
          name: string;
        };
        Update: Partial<Database['public']['Tables']['hatcheries']['Row']>;
        Relationships: [];
      };
      subscription_events: {
        Row: {
          id: number;
          hatchery_id: string | null;
          stripe_event_id: string;
          type: string;
          payload: Json | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['subscription_events']['Row']> & {
          stripe_event_id: string;
          type: string;
        };
        Update: Partial<Database['public']['Tables']['subscription_events']['Row']>;
        Relationships: [];
      };
      hatchery_members: {
        Row: {
          hatchery_id: string;
          user_id: string;
          role: 'owner' | 'counter_staff' | 'lab_tech' | 'auditor';
          created_at: string;
        };
        Insert: Database['public']['Tables']['hatchery_members']['Row'];
        Update: Partial<Database['public']['Tables']['hatchery_members']['Row']>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          hatchery_id: string;
          name: string;
          farm: string;
          farm_en: string | null;
          phone: string | null;
          line_id: string | null;
          zone: string | null;
          address: string | null;
          status: 'active' | 'restock-soon' | 'restock-now' | 'concern' | 'quiet';
          ltv: number;
          last_buy: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['customers']['Row']> & {
          hatchery_id: string;
          name: string;
          farm: string;
        };
        Update: Partial<Database['public']['Tables']['customers']['Row']>;
        Relationships: [];
      };
      customer_cycles: {
        Row: {
          customer_id: string;
          cycle_day: number | null;
          expected_harvest: string | null;
          d30: number | null;
          d60: number | null;
          restock_in: number | null;
          updated_at: string;
        };
        Insert: Database['public']['Tables']['customer_cycles']['Row'];
        Update: Partial<Database['public']['Tables']['customer_cycles']['Row']>;
        Relationships: [];
      };
      batches: {
        Row: {
          id: string;
          hatchery_id: string;
          source: string;
          pl_produced: number;
          pl_sold: number;
          date: string;
          pcr: 'clean' | 'flagged' | 'pending';
          mean_d30: number | null;
          dist: Json;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['batches']['Row']> & {
          id: string;
          hatchery_id: string;
          source: string;
          date: string;
        };
        Update: Partial<Database['public']['Tables']['batches']['Row']>;
        Relationships: [];
      };
      batch_buyers: {
        Row: {
          batch_id: string;
          customer_id: string;
          pl_purchased: number;
          d30: number | null;
          created_at: string;
        };
        Insert: Database['public']['Tables']['batch_buyers']['Row'];
        Update: Partial<Database['public']['Tables']['batch_buyers']['Row']>;
        Relationships: [];
      };
      pcr_results: {
        Row: {
          id: string;
          batch_id: string;
          disease: string;
          status: string;
          lab: string | null;
          tested_on: string | null;
          file_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['pcr_results']['Row']> & {
          batch_id: string;
          disease: string;
          status: string;
        };
        Update: Partial<Database['public']['Tables']['pcr_results']['Row']>;
        Relationships: [];
      };
      alerts: {
        Row: {
          id: string;
          hatchery_id: string;
          sev: 'high' | 'medium' | 'low';
          title: string;
          description: string | null;
          batch_id: string | null;
          action: string | null;
          closed: boolean;
          closed_reason: string | null;
          closed_by: string | null;
          closed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['alerts']['Row']> & {
          hatchery_id: string;
          sev: 'high' | 'medium' | 'low';
          title: string;
        };
        Update: Partial<Database['public']['Tables']['alerts']['Row']>;
        Relationships: [];
      };
      alert_farms: {
        Row: {
          alert_id: string;
          customer_id: string;
        };
        Insert: Database['public']['Tables']['alert_farms']['Row'];
        Update: Partial<Database['public']['Tables']['alert_farms']['Row']>;
        Relationships: [];
      };
      scorecard_settings: {
        Row: {
          hatchery_id: string;
          public: boolean;
          show_d30: boolean;
          show_pcr: boolean;
          show_retention: boolean;
          show_volume: boolean;
          show_reviews: boolean;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['scorecard_settings']['Row']> & {
          hatchery_id: string;
        };
        Update: Partial<Database['public']['Tables']['scorecard_settings']['Row']>;
        Relationships: [];
      };
      notification_settings: {
        Row: {
          hatchery_id: string;
          restock: boolean;
          low_d30: boolean;
          disease: boolean;
          line_reply: boolean;
          weekly: boolean;
          price_move: boolean;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notification_settings']['Row']> & {
          hatchery_id: string;
        };
        Update: Partial<Database['public']['Tables']['notification_settings']['Row']>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: number;
          hatchery_id: string;
          user_id: string | null;
          action: string;
          payload: Json | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_log']['Row']> & {
          hatchery_id: string;
          action: string;
        };
        Update: Partial<Database['public']['Tables']['audit_log']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_hatchery: {
        Args: {
          p_name: string;
          p_name_en?: string | null;
          p_location?: string | null;
        };
        Returns: string;
      };
    };
    Enums: {
      hatchery_role: 'owner' | 'counter_staff' | 'lab_tech' | 'auditor';
      customer_status:
        | 'active'
        | 'restock-soon'
        | 'restock-now'
        | 'concern'
        | 'quiet';
      pcr_status: 'clean' | 'flagged' | 'pending';
      alert_severity: 'high' | 'medium' | 'low';
    };
    CompositeTypes: Record<string, never>;
  };
};
