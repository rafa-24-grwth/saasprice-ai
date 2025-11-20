// src/lib/supabase/rpc-helpers.ts

import { createClient } from '@/lib/db/client';
import type {
  BudgetAllocationResult,
  BudgetPeriodResetResult,
  BudgetStatsResult,
  ScrapingHealthMetricsResult,
  JobQueueStatsExtended,
  VendorForScrape
} from '@/types/rpc';

/**
 * Type-safe RPC helper utilities
 * Provides properly typed wrappers for all Supabase RPC functions
 */

// Generic RPC caller with error handling
export async function callRpc<T>(
  functionName: string,
  params?: Record<string, any>
): Promise<T> {
  const supabase = createClient();
  
  // @ts-ignore - We know the RPC functions exist
  const { data, error } = await supabase.rpc(functionName, params);
  
  if (error) {
    console.error(`RPC error in ${functionName}:`, error);
    throw new Error(`RPC ${functionName} failed: ${error.message}`);
  }
  
  return data as T;
}

// Typed RPC function wrappers
export const rpc = {
  // Budget Management
  allocateScrapebudget: async (
    method: string,
    vendorId: string,
    cost: number
  ): Promise<BudgetAllocationResult> => {
    return callRpc<BudgetAllocationResult>('allocate_scrape_budget', {
      p_method: method,
      p_vendor_id: vendorId,
      p_cost: cost
    });
  },

  checkBudgetAvailable: async (cost: number): Promise<boolean> => {
    return callRpc<boolean>('check_budget_available', { p_cost: cost });
  },

  checkAndResetBudgetPeriods: async (): Promise<BudgetPeriodResetResult> => {
    return callRpc<BudgetPeriodResetResult>('check_and_reset_budget_periods');
  },

  getBudgetStats: async (period: string): Promise<BudgetStatsResult> => {
    return callRpc<BudgetStatsResult>('get_budget_stats', { p_period: period });
  },

  emergencyBudgetShutdown: async (reason: string): Promise<boolean> => {
    return callRpc<boolean>('emergency_budget_shutdown', { p_reason: reason });
  },

  // Health & Monitoring
  getScrapingHealthMetrics: async (): Promise<ScrapingHealthMetricsResult> => {
    return callRpc<ScrapingHealthMetricsResult>('get_scraping_health_metrics');
  },

  getMonitoringStats: async (): Promise<any> => {
    return callRpc<any>('get_monitoring_stats');
  },

  getJobQueueStats: async (): Promise<JobQueueStatsExtended> => {
    return callRpc<JobQueueStatsExtended>('get_job_queue_stats');
  },

  // Vendor Management
  updateVendorScrapeStatus: async (params: {
    vendor_id_param: string;
    success: boolean;
    error_message?: string | null;
  }): Promise<void> => {
    return callRpc<void>('update_vendor_scrape_status', params);
  },

  getVendorsForScheduledScrape: async (
    maxVendors: number = 10
  ): Promise<VendorForScrape[]> => {
    return callRpc<VendorForScrape[]>('get_vendors_for_scheduled_scrape', {
      max_vendors: maxVendors
    });
  },

  // Job Queue Management
  dequeueScrapejob: async (): Promise<Array<{
    job_id: string;
    vendor_id: string;
    method: string;
    payload: any;
  }>> => {
    return callRpc<Array<{
      job_id: string;
      vendor_id: string;
      method: string;
      payload: any;
    }>>('dequeue_scrape_job');
  },

  updateJobStatus: async (params: {
    p_job_id: string;
    p_status: string;
    p_result?: any;
    p_error?: any;
  }): Promise<boolean> => {
    return callRpc<boolean>('update_job_status', params);
  },

  retryFailedJobs: async (maxAgeHours: number = 24): Promise<number> => {
    return callRpc<number>('retry_failed_jobs', { p_max_age_hours: maxAgeHours });
  },

  // Cleanup Operations
  cleanupOldJobs: async (daysToKeep: number = 30): Promise<number> => {
    return callRpc<number>('cleanup_old_jobs', { p_days_to_keep: daysToKeep });
  },

  cleanupExpiredShares: async (): Promise<number> => {
    return callRpc<number>('cleanup_expired_shares');
  }
};

// Export convenience functions for direct use
export const {
  allocateScrapebudget,
  checkBudgetAvailable,
  checkAndResetBudgetPeriods,
  getBudgetStats,
  emergencyBudgetShutdown,
  getScrapingHealthMetrics,
  getMonitoringStats,
  getJobQueueStats,
  updateVendorScrapeStatus,
  getVendorsForScheduledScrape,
  dequeueScrapejob,
  updateJobStatus,
  retryFailedJobs,
  cleanupOldJobs,
  cleanupExpiredShares
} = rpc;

export default rpc;