// src/lib/supabase/typed-rpc.ts
import { createClient } from '@/lib/db/client';
import type {
  BudgetAllocationResult,
  BudgetPeriodResetResult,
  BudgetStatsResult,
  ScrapingHealthMetricsResult
} from '@/types/rpc';

/**
 * Typed wrapper for Supabase RPC functions
 * This provides proper TypeScript types for our RPC functions
 * without modifying the auto-generated database.ts file
 */

export async function allocateScrapebudget(
  method: string,
  vendorId: string,
  cost: number
): Promise<BudgetAllocationResult | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('allocate_scrape_budget', {
    p_method: method,
    p_vendor_id: vendorId,
    p_cost: cost
  } as any); // Use 'as any' to bypass the type checking for params
  
  if (error) throw error;
  return data as BudgetAllocationResult;
}

export async function checkAndResetBudgetPeriods(): Promise<BudgetPeriodResetResult | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('check_and_reset_budget_periods');
  
  if (error) throw error;
  return data as BudgetPeriodResetResult;
}

export async function getBudgetStats(period: string): Promise<BudgetStatsResult | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_budget_stats', {
    p_period: period
  } as any);
  
  if (error) throw error;
  return data as BudgetStatsResult;
}

export async function checkBudgetAvailable(cost: number): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('check_budget_available', {
    p_cost: cost
  } as any);
  
  if (error) throw error;
  return data as boolean;
}

export async function emergencyBudgetShutdown(reason: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('emergency_budget_shutdown', {
    p_reason: reason
  } as any);
  
  if (error) throw error;
  return data as boolean;
}

export async function getScrapingHealthMetrics(): Promise<ScrapingHealthMetricsResult | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_scraping_health_metrics');
  
  if (error) throw error;
  return data as ScrapingHealthMetricsResult;
}