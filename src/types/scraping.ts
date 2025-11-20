// src/types/scraping.ts

/**
 * Scraping System Types
 * Defines all data structures for the budget-conscious scraping system
 */

// Scraping Methods (ordered by cost: free → expensive)
export type ScrapingMethod = 'playwright' | 'firecrawl' | 'vision' | 'manual';

// Scraping status for tracking attempts
export type ScrapeStatus = 'pending' | 'success' | 'failed' | 'partial' | 'skipped';

// Budget tracking intervals
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * Scraping configuration for a specific vendor
 */
export interface VendorScrapeConfig {
  vendor_id: string;
  vendor_name: string;
  pricing_url: string;
  
  // Method preferences (try in order)
  preferred_methods: ScrapingMethod[];
  
  // Playwright-specific config
  playwright?: {
    selectors: {
      price?: string;
      tier_name?: string;
      features?: string;
      container?: string;
    };
    wait_for?: string; // Selector to wait for before scraping
    timeout?: number;
    requires_javascript?: boolean;
  };
  
  // Scheduling
  scrape_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  last_successful_scrape?: Date;
  next_scheduled_scrape?: Date;
  
  // Failure tracking
  consecutive_failures: number;
  max_failures_before_escalation: number;
  
  // Cost tracking
  estimated_cost_per_scrape: {
    playwright: number; // Always 0
    firecrawl: number;  // ~$0.01 per page
    vision: number;     // ~$0.02 per image
  };
}

/**
 * Result from a scraping attempt
 */
export interface ScrapeResult {
  vendor_id: string;
  method_used: ScrapingMethod;
  status: ScrapeStatus;
  
  // Timing
  started_at: Date;
  completed_at: Date;
  duration_ms: number;
  
  // Cost tracking
  actual_cost: number;
  
  // Extracted data (if successful)
  data?: {
    tiers: Array<{
      name: string;
      price: number;
      price_model: 'per_month' | 'per_year' | 'one_time' | 'usage_based';
      features?: string[];
      user_limit?: number;
      confidence: number; // 0-1 score of extraction confidence
    }>;
    raw_html?: string; // Store for debugging/reprocessing
    screenshot?: string; // Base64 image if using vision
  };
  
  // Error tracking
  error?: {
    message: string;
    code?: string;
    should_retry: boolean;
    suggested_method?: ScrapingMethod;
  };
  
  // Metadata
  metadata?: {
    page_title?: string;
    last_modified?: string;
    detected_changes?: boolean;
  };
}

/**
 * Budget management configuration
 */
export interface BudgetConfig {
  // Cost limits
  limits: {
    daily: number;    // Max daily spend
    weekly: number;   // Max weekly spend
    monthly: number;  // Max monthly spend (target: <$100)
  };
  
  // Current usage
  usage: {
    daily: number;
    weekly: number;
    monthly: number;
    last_reset: {
      daily: Date;
      weekly: Date;
      monthly: Date;
    };
  };
  
  // Cost per method (in USD)
  method_costs: Record<ScrapingMethod, number>;
  
  // Alerts
  alert_thresholds: {
    warning: number;
    critical: number;
    shutdown: number;
  };
}

/**
 * Scraping job for the queue
 */
export interface ScrapeJob {
  id: string;
  vendor_id: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  
  // Scheduling
  scheduled_for: Date;
  attempts: number;
  max_attempts: number;
  
  // Method control
  allowed_methods: ScrapingMethod[];
  max_cost: number; // Maximum cost for this job
  
  // Status
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Results
  result?: ScrapeResult;
  
  // Callbacks
  on_complete?: (result: ScrapeResult) => void;
  on_error?: (error: Error) => void;
}

/**
 * Scraping session for batch operations
 */
export interface ScrapeSession {
  id: string;
  started_at: Date;
  
  // Jobs in this session
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  
  // Cost tracking
  total_cost: number;
  budget_remaining: number;
  
  // Performance
  average_duration_ms: number;
  success_rate: number;
  
  // Methods used
  method_breakdown: {
    playwright: number;
    firecrawl: number;
    vision: number;
  };
}

/**
 * Scraping statistics for monitoring
 */
export interface ScrapeStats {
  period: BudgetPeriod;
  
  // Volume
  total_scrapes: number;
  successful_scrapes: number;
  failed_scrapes: number;
  
  // Cost
  total_cost: number;
  average_cost_per_scrape: number;
  
  // Performance
  average_duration_ms: number;
  fastest_scrape_ms: number;
  slowest_scrape_ms: number;
  
  // Method effectiveness
  method_success_rates: {
    playwright: number;
    firecrawl: number;
    vision: number;
  };
  
  // Vendor performance
  vendor_success_rates: Record<string, number>;
  
  // Budget usage
  budget_utilization: number; // Percentage of budget used
}

/**
 * Scraping health check
 */
export interface ScrapeHealth {
  status: 'healthy' | 'degraded' | 'critical';
  
  // Budget health
  budget: {
    daily_remaining: number;
    weekly_remaining: number;
    monthly_remaining: number;
    days_until_reset: number;
  };
  
  // System health
  system: {
    playwright_available: boolean;
    firecrawl_available: boolean;
    vision_available: boolean;
    queue_size: number;
    active_jobs: number;
  };
  
  // Recent performance
  recent_stats: {
    last_hour_success_rate: number;
    last_day_success_rate: number;
    trending: 'improving' | 'stable' | 'degrading';
  };
  
  // Alerts
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
}

/**
 * Database record for scrape history
 */
export interface ScrapeRecord {
  id: string;
  vendor_id: string;
  
  // Attempt details
  method: ScrapingMethod;
  status: ScrapeStatus;
  cost: number;
  
  // Timing
  started_at: Date;
  completed_at: Date;
  duration_ms: number;
  
  // Data
  extracted_data?: any; // JSON of extracted pricing
  error_message?: string;
  
  // Metadata
  session_id?: string;
  job_id?: string;
  created_at: Date;
  updated_at: Date;
}