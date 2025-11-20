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
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      budget_alerts: {
        Row: {
          created_at: string | null
          id: string
          level: string
          message: string
          remaining_budget: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: string
          message: string
          remaining_budget?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          message?: string
          remaining_budget?: Json | null
        }
        Relationships: []
      }
      budget_tracking: {
        Row: {
          alert_thresholds: Json
          id: number
          limits: Json
          method_costs: Json
          updated_at: string | null
          usage: Json
        }
        Insert: {
          alert_thresholds?: Json
          id?: number
          limits?: Json
          method_costs?: Json
          updated_at?: string | null
          usage?: Json
        }
        Update: {
          alert_thresholds?: Json
          id?: number
          limits?: Json
          method_costs?: Json
          updated_at?: string | null
          usage?: Json
        }
        Relationships: []
      }
      comparison_shares: {
        Row: {
          comparison_id: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          share_token: string
          view_count: number | null
        }
        Insert: {
          comparison_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          share_token?: string
          view_count?: number | null
        }
        Update: {
          comparison_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          share_token?: string
          view_count?: number | null
        }
        Relationships: []
      }
      cron_logs: {
        Row: {
          details: Json | null
          duration_ms: number | null
          endpoint: string
          error_message: string | null
          executed_at: string | null
          id: string
          status: string
          vendors_failed: number | null
          vendors_queued: number | null
        }
        Insert: {
          details?: Json | null
          duration_ms?: number | null
          endpoint: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status: string
          vendors_failed?: number | null
          vendors_queued?: number | null
        }
        Update: {
          details?: Json | null
          duration_ms?: number | null
          endpoint?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string
          vendors_failed?: number | null
          vendors_queued?: number | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          enabled: boolean
          key: string
          updated_at: string | null
          value: Json | null
          version: number | null
        }
        Insert: {
          enabled: boolean
          key: string
          updated_at?: string | null
          value?: Json | null
          version?: number | null
        }
        Update: {
          enabled?: boolean
          key?: string
          updated_at?: string | null
          value?: Json | null
          version?: number | null
        }
        Relationships: []
      }
      features: {
        Row: {
          created_at: string | null
          description: string | null
          feature: string
          id: string
          included: boolean | null
          limit_value: string | null
          plan_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature: string
          id?: string
          included?: boolean | null
          limit_value?: string | null
          plan_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature?: string
          id?: string
          included?: boolean | null
          limit_value?: string | null
          plan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          lead_id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          lead_id: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          lead_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company_domain: string | null
          consent_version: string
          consented_at: string
          created_at: string | null
          email: string
          id: string
          interaction_count: number | null
          is_verified: boolean | null
          last_interaction_at: string | null
          newsletter_opt_in: boolean | null
          retention_expires_at: string | null
          source: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          company_domain?: string | null
          consent_version: string
          consented_at: string
          created_at?: string | null
          email: string
          id?: string
          interaction_count?: number | null
          is_verified?: boolean | null
          last_interaction_at?: string | null
          newsletter_opt_in?: boolean | null
          retention_expires_at?: string | null
          source?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          company_domain?: string | null
          consent_version?: string
          consented_at?: string
          created_at?: string | null
          email?: string
          id?: string
          interaction_count?: number | null
          is_verified?: boolean | null
          last_interaction_at?: string | null
          newsletter_opt_in?: boolean | null
          retention_expires_at?: string | null
          source?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          tier: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          tier?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          tier?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      price_evidence: {
        Row: {
          created_at: string | null
          evidence_strength: number | null
          html_sha256: string | null
          id: string
          markdown_content: string | null
          observed_at: string | null
          parse_method: string
          parser_version: string | null
          price_fact_id: string | null
          raw_extracted_data: Json | null
          screenshot_expires_at: string | null
          screenshot_url: string | null
          source_url: string
        }
        Insert: {
          created_at?: string | null
          evidence_strength?: number | null
          html_sha256?: string | null
          id?: string
          markdown_content?: string | null
          observed_at?: string | null
          parse_method: string
          parser_version?: string | null
          price_fact_id?: string | null
          raw_extracted_data?: Json | null
          screenshot_expires_at?: string | null
          screenshot_url?: string | null
          source_url: string
        }
        Update: {
          created_at?: string | null
          evidence_strength?: number | null
          html_sha256?: string | null
          id?: string
          markdown_content?: string | null
          observed_at?: string | null
          parse_method?: string
          parser_version?: string | null
          price_fact_id?: string | null
          raw_extracted_data?: Json | null
          screenshot_expires_at?: string | null
          screenshot_url?: string | null
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_evidence_price_fact_id_fkey"
            columns: ["price_fact_id"]
            isOneToOne: false
            referencedRelation: "price_facts"
            referencedColumns: ["id"]
          },
        ]
      }
      price_facts: {
        Row: {
          base_price: number | null
          cadence: string
          confidence_score: number | null
          created_at: string | null
          currency_code: string | null
          id: string
          included_units: number | null
          minimum_commitment: number | null
          normalized_value: number | null
          observed_at: string | null
          overage_price: number | null
          plan_id: string | null
          region: string | null
          scrape_run_id: string | null
          target_period: string | null
          target_units: number | null
          unit_price: number | null
          unit_type: string | null
          valid_from: string
          valid_to: string | null
          validity: unknown
          verification_level: string | null
        }
        Insert: {
          base_price?: number | null
          cadence: string
          confidence_score?: number | null
          created_at?: string | null
          currency_code?: string | null
          id?: string
          included_units?: number | null
          minimum_commitment?: number | null
          normalized_value?: number | null
          observed_at?: string | null
          overage_price?: number | null
          plan_id?: string | null
          region?: string | null
          scrape_run_id?: string | null
          target_period?: string | null
          target_units?: number | null
          unit_price?: number | null
          unit_type?: string | null
          valid_from?: string
          valid_to?: string | null
          validity?: unknown
          verification_level?: string | null
        }
        Update: {
          base_price?: number | null
          cadence?: string
          confidence_score?: number | null
          created_at?: string | null
          currency_code?: string | null
          id?: string
          included_units?: number | null
          minimum_commitment?: number | null
          normalized_value?: number | null
          observed_at?: string | null
          overage_price?: number | null
          plan_id?: string | null
          region?: string | null
          scrape_run_id?: string | null
          target_period?: string | null
          target_units?: number | null
          unit_price?: number | null
          unit_type?: string | null
          valid_from?: string
          valid_to?: string | null
          validity?: unknown
          verification_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_facts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_facts_scrape_run_id_fkey"
            columns: ["scrape_run_id"]
            isOneToOne: false
            referencedRelation: "scrape_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_comparisons: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          is_favorite: boolean | null
          name: string
          notes: string | null
          updated_at: string | null
          user_id: string | null
          vendor_ids: string[]
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_favorite?: boolean | null
          name: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_ids: string[]
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
          vendor_ids?: string[]
        }
        Relationships: []
      }
      scrape_history: {
        Row: {
          completed_at: string
          confidence: number | null
          cost: number
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          extracted_data: Json | null
          id: string
          method: string
          started_at: string
          status: string
          vendor_id: string
        }
        Insert: {
          completed_at: string
          confidence?: number | null
          cost?: number
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          extracted_data?: Json | null
          id?: string
          method: string
          started_at: string
          status: string
          vendor_id: string
        }
        Update: {
          completed_at?: string
          confidence?: number | null
          cost?: number
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          extracted_data?: Json | null
          id?: string
          method?: string
          started_at?: string
          status?: string
          vendor_id?: string
        }
        Relationships: []
      }
      scrape_jobs: {
        Row: {
          actual_cost: number | null
          allocated_cost: number | null
          attempt_count: number | null
          callback_url: string | null
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error: Json | null
          expires_at: string | null
          force_refresh: boolean | null
          id: string
          max_attempts: number | null
          metadata: Json | null
          method: string | null
          payload: Json | null
          priority: number | null
          result: Json | null
          source: string | null
          started_at: string | null
          status: string
          user_id: string | null
          vendor_id: string
          vendor_name: string | null
        }
        Insert: {
          actual_cost?: number | null
          allocated_cost?: number | null
          attempt_count?: number | null
          callback_url?: string | null
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: Json | null
          expires_at?: string | null
          force_refresh?: boolean | null
          id?: string
          max_attempts?: number | null
          metadata?: Json | null
          method?: string | null
          payload?: Json | null
          priority?: number | null
          result?: Json | null
          source?: string | null
          started_at?: string | null
          status?: string
          user_id?: string | null
          vendor_id: string
          vendor_name?: string | null
        }
        Update: {
          actual_cost?: number | null
          allocated_cost?: number | null
          attempt_count?: number | null
          callback_url?: string | null
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: Json | null
          expires_at?: string | null
          force_refresh?: boolean | null
          id?: string
          max_attempts?: number | null
          metadata?: Json | null
          method?: string | null
          payload?: Json | null
          priority?: number | null
          result?: Json | null
          source?: string | null
          started_at?: string | null
          status?: string
          user_id?: string | null
          vendor_id?: string
          vendor_name?: string | null
        }
        Relationships: []
      }
      scrape_runs: {
        Row: {
          bucket: string
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          failure_count: number | null
          id: string
          status: string | null
          vendor_id: string | null
        }
        Insert: {
          bucket: string
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          failure_count?: number | null
          id?: string
          status?: string | null
          vendor_id?: string | null
        }
        Update: {
          bucket?: string
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          failure_count?: number | null
          id?: string
          status?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrape_runs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          api_endpoint: string | null
          category: string | null
          consecutive_failures: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_quarantined: boolean | null
          last_failed_at: string | null
          last_scrape_status: string | null
          last_scraped_at: string | null
          last_success_at: string | null
          last_successful_method: string | null
          logo_url: string | null
          name: string
          pricing_url: string
          priority: number | null
          quarantine_reason: string | null
          quarantine_until: string | null
          scrape_frequency_hours: number | null
          scrape_hints: Json | null
          scrape_priority: number | null
          scraping_config: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          category?: string | null
          consecutive_failures?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_quarantined?: boolean | null
          last_failed_at?: string | null
          last_scrape_status?: string | null
          last_scraped_at?: string | null
          last_success_at?: string | null
          last_successful_method?: string | null
          logo_url?: string | null
          name: string
          pricing_url: string
          priority?: number | null
          quarantine_reason?: string | null
          quarantine_until?: string | null
          scrape_frequency_hours?: number | null
          scrape_hints?: Json | null
          scrape_priority?: number | null
          scraping_config?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          category?: string | null
          consecutive_failures?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_quarantined?: boolean | null
          last_failed_at?: string | null
          last_scrape_status?: string | null
          last_scraped_at?: string | null
          last_success_at?: string | null
          last_successful_method?: string | null
          logo_url?: string | null
          name?: string
          pricing_url?: string
          priority?: number | null
          quarantine_reason?: string | null
          quarantine_until?: string | null
          scrape_frequency_hours?: number | null
          scrape_hints?: Json | null
          scrape_priority?: number | null
          scraping_config?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          vendor_id: string
          created_at: string | null
          updated_at: string | null
          notes: string | null
          alert_on_price_change: boolean | null
          alert_threshold_percentage: number | null
        }
        Insert: {
          id?: string
          user_id: string
          vendor_id: string
          created_at?: string | null
          updated_at?: string | null
          notes?: string | null
          alert_on_price_change?: boolean | null
          alert_threshold_percentage?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          vendor_id?: string
          created_at?: string | null
          updated_at?: string | null
          notes?: string | null
          alert_on_price_change?: boolean | null
          alert_threshold_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      expired_shares: {
        Row: {
          comparison_id: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string | null
          share_token: string | null
          view_count: number | null
        }
        Insert: {
          comparison_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string | null
          share_token?: string | null
          view_count?: number | null
        }
        Update: {
          comparison_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string | null
          share_token?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      scraping_health: {
        Row: {
          active_vendors: number | null
          failing_vendors: number | null
          never_scraped: number | null
          newest_scrape: string | null
          oldest_scrape: string | null
          stale_24h: number | null
          stale_7d: number | null
          total_vendors: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      allocate_scrape_budget: {
        Args: { p_cost: number; p_method: string; p_vendor_id: string }
        Returns: Json
      }
      check_and_reset_budget_periods: { Args: never; Returns: Json }
      check_budget_available: { Args: { p_cost: number }; Returns: boolean }
      cleanup_expired_shares: { Args: never; Returns: number }
      cleanup_old_jobs: { Args: { p_days_to_keep?: number }; Returns: number }
      dequeue_scrape_job: {
        Args: never
        Returns: {
          job_id: string
          method: string
          payload: Json
          vendor_id: string
        }[]
      }
      emergency_budget_shutdown: {
        Args: { p_reason: string }
        Returns: boolean
      }
      get_budget_stats: { Args: { p_period: string }; Returns: Json }
      get_job_queue_stats: { Args: never; Returns: Json }
      get_monitoring_stats: { Args: never; Returns: Json }
      get_scraping_health_metrics: { Args: never; Returns: Json }
      get_vendors_for_scheduled_scrape: {
        Args: { max_vendors?: number }
        Returns: {
          hours_since_scrape: number
          id: string
          last_scraped_at: string
          name: string
          scrape_priority: number
        }[]
      }
      retry_failed_jobs: { Args: { p_max_age_hours?: number }; Returns: number }
      update_job_status: {
        Args: {
          p_error?: Json
          p_job_id: string
          p_result?: Json
          p_status: string
        }
        Returns: boolean
      }
      update_vendor_scrape_status: {
        Args: {
          error_message?: string
          success: boolean
          vendor_id_param: string
        }
        Returns: undefined
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
    Enums: {},
  },
} as const
// Custom Type Exports and Helper Types
// Add this to the end of your database.ts file
// ============================================

// Core vendor comparison types
export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type VendorInsert = Database['public']['Tables']['vendors']['Insert'];
export type VendorUpdate = Database['public']['Tables']['vendors']['Update'];

export type Plan = Database['public']['Tables']['plans']['Row'];
export type PlanInsert = Database['public']['Tables']['plans']['Insert'];
export type PlanUpdate = Database['public']['Tables']['plans']['Update'];

export type PriceFact = Database['public']['Tables']['price_facts']['Row'];
export type PriceFactInsert = Database['public']['Tables']['price_facts']['Insert'];
export type PriceFactUpdate = Database['public']['Tables']['price_facts']['Update'];

export type Feature = Database['public']['Tables']['features']['Row'];
export type FeatureInsert = Database['public']['Tables']['features']['Insert'];
export type FeatureUpdate = Database['public']['Tables']['features']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Watchlist types (NEW)
export type Watchlist = Database['public']['Tables']['watchlist']['Row'];
export type WatchlistInsert = Database['public']['Tables']['watchlist']['Insert'];
export type WatchlistUpdate = Database['public']['Tables']['watchlist']['Update'];

// Lead management types
export type Lead = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export type LeadInteraction = Database['public']['Tables']['lead_interactions']['Row'];
export type LeadInteractionInsert = Database['public']['Tables']['lead_interactions']['Insert'];
export type LeadInteractionUpdate = Database['public']['Tables']['lead_interactions']['Update'];

// Comparison and sharing types
export type SavedComparison = Database['public']['Tables']['saved_comparisons']['Row'];
export type SavedComparisonInsert = Database['public']['Tables']['saved_comparisons']['Insert'];
export type SavedComparisonUpdate = Database['public']['Tables']['saved_comparisons']['Update'];

export type ComparisonShare = Database['public']['Tables']['comparison_shares']['Row'];
export type ComparisonShareInsert = Database['public']['Tables']['comparison_shares']['Insert'];
export type ComparisonShareUpdate = Database['public']['Tables']['comparison_shares']['Update'];

// Scraping and monitoring types
export type ScrapeJob = Database['public']['Tables']['scrape_jobs']['Row'];
export type ScrapeJobInsert = Database['public']['Tables']['scrape_jobs']['Insert'];
export type ScrapeJobUpdate = Database['public']['Tables']['scrape_jobs']['Update'];

export type ScrapeRun = Database['public']['Tables']['scrape_runs']['Row'];
export type ScrapeRunInsert = Database['public']['Tables']['scrape_runs']['Insert'];
export type ScrapeRunUpdate = Database['public']['Tables']['scrape_runs']['Update'];

export type ScrapeHistory = Database['public']['Tables']['scrape_history']['Row'];
export type ScrapeHistoryInsert = Database['public']['Tables']['scrape_history']['Insert'];
export type ScrapeHistoryUpdate = Database['public']['Tables']['scrape_history']['Update'];

// Price evidence for confidence scoring
export type PriceEvidence = Database['public']['Tables']['price_evidence']['Row'];
export type PriceEvidenceInsert = Database['public']['Tables']['price_evidence']['Insert'];
export type PriceEvidenceUpdate = Database['public']['Tables']['price_evidence']['Update'];

// System monitoring and settings
export type CronLog = Database['public']['Tables']['cron_logs']['Row'];
export type CronLogInsert = Database['public']['Tables']['cron_logs']['Insert'];
export type CronLogUpdate = Database['public']['Tables']['cron_logs']['Update'];

export type FeatureFlag = Database['public']['Tables']['feature_flags']['Row'];
export type FeatureFlagInsert = Database['public']['Tables']['feature_flags']['Insert'];
export type FeatureFlagUpdate = Database['public']['Tables']['feature_flags']['Update'];

export type AuditLog = Database['public']['Tables']['audit_log']['Row'];
export type AuditLogInsert = Database['public']['Tables']['audit_log']['Insert'];
export type AuditLogUpdate = Database['public']['Tables']['audit_log']['Update'];

export type BudgetAlert = Database['public']['Tables']['budget_alerts']['Row'];
export type BudgetAlertInsert = Database['public']['Tables']['budget_alerts']['Insert'];
export type BudgetAlertUpdate = Database['public']['Tables']['budget_alerts']['Update'];

export type BudgetTracking = Database['public']['Tables']['budget_tracking']['Row'];
export type BudgetTrackingInsert = Database['public']['Tables']['budget_tracking']['Insert'];
export type BudgetTrackingUpdate = Database['public']['Tables']['budget_tracking']['Update'];

// View types
export type ScrapingHealth = Database['public']['Views']['scraping_health']['Row'];
export type ExpiredShares = Database['public']['Views']['expired_shares']['Row'];

// ============================================
// Composite Types for Components
// ============================================

export type VendorWithPlans = Vendor & {
  plans: Plan[];
};

export type PlanWithPricing = Plan & {
  prices: PriceFact[];
  features?: Feature[];
};

export type VendorWithPricing = {
  vendor: Vendor;
  plans: (Plan & {
    prices: PriceFact[];
    features?: Feature[];
  })[];
};

export type ComparisonData = {
  vendors: Vendor[];
  plans: PlanWithPricing[];
  seats: number;
  billingPeriod: 'monthly' | 'annual';
};

export type VendorScrapingStatus = Vendor & {
  scrape_runs?: ScrapeRun[];
  pending_jobs?: ScrapeJob[];
};

export type DashboardMetrics = {
  totalVendors: number;
  activeVendors: number;
  staleData: number;
  recentScrapes: number;
  healthScore: number;
};

export type PlanWithDetails = Plan & {
  price_facts: PriceFact[];
  features: Feature[];
  vendor?: Vendor;
};

export type ComparisonResult = {
  vendor: Vendor;
  plans: PlanWithPricing[];
  totalCost?: number;
  confidence?: number;
};

export type SavedComparisonWithDetails = SavedComparison & {
  vendor_ids: string[];
  comparison_data: ComparisonData[];
  share?: ComparisonShare;
};

// Watchlist composite type
export type WatchlistWithVendor = Watchlist & {
  vendors: Vendor;
};