//src/types/rpc.ts

// Add these to your existing rpc-types.ts file

export type JobQueueStats = {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
};

export type DequeuedJob = {
  job_id: string;
  vendor_id: string;
  vendor_name?: string;
  method: string;
  payload?: any;
};

// ============ ADD THESE NEW TYPES ============

// Budget Allocation Result
export type BudgetAllocationResult = {
  success: boolean;
  message?: string;
  remaining?: {
    daily: number;
    weekly: number;
    monthly: number;
    last_reset: {
      daily: string;
      weekly: string;
      monthly: string;
    };
  };
  alert_triggered?: boolean;
  alert_level?: 'warning' | 'critical' | 'info';
};

// Budget Period Reset Result
export type BudgetPeriodResetResult = {
  resetDaily: boolean;
  resetWeekly: boolean;
  resetMonthly: boolean;
};

// Budget Stats Result
export type BudgetStatsResult = {
  spent: number;
  remaining: number;
  utilization: number;
  methodBreakdown: Record<string, number>;
  topVendors: Array<{ 
    vendor_id: string; 
    vendor_name: string; 
    cost: number; 
    scrape_count: number;
  }>;
  successRate: number;
};

// Scraping Health Metrics Result
export type ScrapingHealthMetricsResult = {
  days_until_monthly_reset: number;
  queue_size: number;
  active_jobs: number;
  last_hour_success_rate: number;
  last_day_success_rate: number;
  trend: 'up' | 'down' | 'stable';
  recent_alerts?: Array<{
    level: string;
    message: string;
    timestamp: Date;
  }>;
};

// Job Queue Stats Extended
export type JobQueueStatsExtended = {
  total_jobs: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  average_duration_ms?: number;
  oldest_pending_job?: {
    id: string;
    vendor_name: string;
    created_at: string;
  };
  queue_depth_by_priority?: Array<{
    priority: number;
    count: number;
  }>;
};

// Vendors for Scheduled Scrape
export type VendorForScrape = {
  id: string;
  name: string;
  last_scraped_at: string;
  scrape_priority: number;
  hours_since_scrape: number;
};