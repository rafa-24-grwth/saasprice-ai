// Extended database types for scheduling system
// Import this alongside your existing database.ts

import { Json } from './database';

// Add these to your existing Database interface
export interface SchedulingTables {
  scrape_jobs: {
    Row: {
      id: string;
      vendor_id: string;
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
      priority: number;
      source: 'manual' | 'scheduled' | 'api' | 'retry';
      created_at: string;
      expires_at: string;
      started_at?: string | null;
      completed_at?: string | null;
      result_data?: Json | null;
      error_message?: string | null;
    };
    Insert: {
      id?: string;
      vendor_id: string;
      status?: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
      priority?: number;
      source?: 'manual' | 'scheduled' | 'api' | 'retry';
      created_at?: string;
      expires_at?: string;
      started_at?: string | null;
      completed_at?: string | null;
      result_data?: Json | null;
      error_message?: string | null;
    };
    Update: Partial<SchedulingTables['scrape_jobs']['Row']>;
  };
  
  cron_logs: {
    Row: {
      id: string;
      endpoint: string;
      status: 'success' | 'error' | 'warning';
      vendors_queued: number;
      vendors_failed: number;
      details?: Json | null;
      error_message?: string | null;
      executed_at: string;
      duration_ms?: number | null;
    };
    Insert: {
      id?: string;
      endpoint: string;
      status: 'success' | 'error' | 'warning';
      vendors_queued?: number;
      vendors_failed?: number;
      details?: Json | null;
      error_message?: string | null;
      executed_at?: string;
      duration_ms?: number | null;
    };
    Update: Partial<SchedulingTables['cron_logs']['Row']>;
  };
  
  budget_tracking: {
    Row: {
      id: number;
      daily_spent: number;
      weekly_spent: number;
      monthly_spent: number;
      last_reset_daily: string;
      last_reset_weekly: string;
      last_reset_monthly: string;
      daily_limit: number;
      weekly_limit: number;
      monthly_limit: number;
    };
    Insert: Partial<SchedulingTables['budget_tracking']['Row']>;
    Update: Partial<SchedulingTables['budget_tracking']['Row']>;
  };
  
  scrape_history: {
    Row: {
      id: string;
      vendor_id: string;
      job_id?: string | null;
      scrape_method: string;
      success: boolean;
      cost: number;
      duration_ms: number;
      error?: string | null;
      metadata?: Json | null;
      scraped_at: string;
    };
    Insert: {
      id?: string;
      vendor_id: string;
      job_id?: string | null;
      scrape_method: string;
      success: boolean;
      cost?: number;
      duration_ms?: number;
      error?: string | null;
      metadata?: Json | null;
      scraped_at?: string;
    };
    Update: Partial<SchedulingTables['scrape_history']['Row']>;
  };
  
  budget_alerts: {
    Row: {
      id: string;
      period_type: 'daily' | 'weekly' | 'monthly';
      threshold_percent: number;
      amount_spent: number;
      amount_limit: number;
      alert_type: 'warning' | 'critical' | 'shutdown';
      message: string;
      created_at: string;
      resolved_at?: string | null;
    };
    Insert: Partial<SchedulingTables['budget_alerts']['Row']>;
    Update: Partial<SchedulingTables['budget_alerts']['Row']>;
  };
}

// Extended vendor type with scheduling fields
export interface VendorWithScheduling {
  id: string;
  slug: string;
  name: string;
  category: string;
  pricing_url: string;
  logo_url?: string | null;
  pricing_page_url?: string | null;
  priority: number;
  api_endpoint?: string | null;
  scrape_hints?: Json | null;
  is_active: boolean;
  is_quarantined: boolean;
  quarantine_reason?: string | null;
  quarantine_until?: string | null;
  created_at: string;
  updated_at: string;
  // Scheduling fields
  last_scraped_at?: string | null;
  scrape_priority?: number;
  scrape_frequency_hours?: number;
  consecutive_failures?: number;
  last_success_at?: string | null;
  notes?: string | null;
}

// Views
export interface SchedulingViews {
  scraping_health: {
    Row: {
      total_vendors: number;
      active_vendors: number;
      never_scraped: number;
      stale_24h: number;
      stale_7d: number;
      failing_vendors: number;
      oldest_scrape?: string | null;
      newest_scrape?: string | null;
    };
  };
}

// RPC Functions
export interface SchedulingFunctions {
  get_vendors_for_scheduled_scrape: {
    Args: { max_vendors?: number };
    Returns: Array<{
      id: string;
      name: string;
      last_scraped_at?: string | null;
      scrape_priority: number;
      hours_since_scrape: number;
    }>;
  };
  
  update_vendor_scrape_status: {
    Args: {
      vendor_id_param: string;
      success: boolean;
      error_message?: string | null;
    };
    Returns: void;
  };
  
  allocate_budget: {
    Args: {
      cost_amount: number;
      method_name: string;
    };
    Returns: {
      success: boolean;
      daily_remaining: number;
      weekly_remaining: number;
      monthly_remaining: number;
      should_stop: boolean;
      reason?: string;
    };
  };
  
  check_budget_availability: {
    Args: {
      cost_amount: number;
    };
    Returns: {
      can_proceed: boolean;
      daily_remaining: number;
      weekly_remaining: number;
      monthly_remaining: number;
      limiting_period?: string;
    };
  };
  
  reset_budget_periods: {
    Args: Record<string, never>;
    Returns: {
      daily_reset: boolean;
      weekly_reset: boolean;
      monthly_reset: boolean;
    };
  };
  
  dequeue_scrape_job: {
    Args: {
      worker_id?: string;
    };
    Returns: {
      id: string;
      vendor_id: string;
      priority: number;
      source: string;
    } | null;
  };
}

// Export type aliases
export type ScrapeJob = SchedulingTables['scrape_jobs']['Row'];
export type CronLog = SchedulingTables['cron_logs']['Row'];
export type BudgetTracking = SchedulingTables['budget_tracking']['Row'];
export type ScrapeHistory = SchedulingTables['scrape_history']['Row'];
export type BudgetAlert = SchedulingTables['budget_alerts']['Row'];
export type ScrapingHealth = SchedulingViews['scraping_health']['Row'];

// Insert types
export type ScrapeJobInsert = SchedulingTables['scrape_jobs']['Insert'];
export type CronLogInsert = SchedulingTables['cron_logs']['Insert'];
export type ScrapeHistoryInsert = SchedulingTables['scrape_history']['Insert'];