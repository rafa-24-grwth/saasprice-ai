// src/lib/services/scrapers/budget-manager.ts (ROBUST SOLUTION)

import type { 
  BudgetConfig, 
  ScrapingMethod, 
  ScrapeResult,
  ScrapeHealth,
  BudgetPeriod
} from '@/types/scraping';
import type {
  BudgetAllocationResult,
  BudgetPeriodResetResult,
  BudgetStatsResult,
  ScrapingHealthMetricsResult
} from '@/types/rpc';
import { 
  createDefaultBudgetConfig,
  getBudgetHealth,
  METHOD_COSTS,
  VENDOR_OVERRIDES
} from '@/config/scraping-budget';
import { createClient } from '@/lib/db/client';

/**
 * Budget Manager Service - Serverless & Concurrent Safe Version
 * 
 * Uses database as single source of truth with atomic operations
 * Designed for serverless environments (Vercel) with no in-memory state
 * All operations are database-driven to prevent race conditions
 */

// Create a typed RPC wrapper to handle all RPC calls safely
class TypedRPC {
  private client: any;
  
  constructor() {
    this.client = createClient();
  }
  
  async allocateScrapebudget(params: {
    p_method: string;
    p_vendor_id: string;
    p_cost: number;
  }): Promise<BudgetAllocationResult | null> {
    const { data, error } = await this.client.rpc('allocate_scrape_budget', params);
    if (error) throw error;
    return data as BudgetAllocationResult;
  }
  
  async checkBudgetAvailable(cost: number): Promise<boolean> {
    const { data, error } = await this.client.rpc('check_budget_available', { p_cost: cost });
    if (error) throw error;
    return data as boolean;
  }
  
  async checkAndResetBudgetPeriods(): Promise<BudgetPeriodResetResult> {
    const { data, error } = await this.client.rpc('check_and_reset_budget_periods');
    if (error) throw error;
    return data as BudgetPeriodResetResult;
  }
  
  async getBudgetStats(period: string): Promise<BudgetStatsResult> {
    const { data, error } = await this.client.rpc('get_budget_stats', { p_period: period });
    if (error) throw error;
    return data as BudgetStatsResult;
  }
  
  async emergencyShutdown(reason: string): Promise<boolean> {
    const { data, error } = await this.client.rpc('emergency_budget_shutdown', { p_reason: reason });
    if (error) throw error;
    return data as boolean;
  }
  
  async getScrapingHealthMetrics(): Promise<ScrapingHealthMetricsResult> {
    const { data, error } = await this.client.rpc('get_scraping_health_metrics');
    if (error) throw error;
    return data as ScrapingHealthMetricsResult;
  }
  
  // Regular database operations
  getClient() {
    return this.client;
  }
}

// Create singleton instance
const rpc = new TypedRPC();
const getSupabase = () => rpc.getClient();

/**
 * Initialize budget tracking table if it doesn't exist
 * Should be called once during database setup, not on every request
 */
export async function initializeBudgetTable(): Promise<void> {
  const supabase = getSupabase();
  
  try {
    // Check if budget row exists
    const { data, error } = await supabase
      .from('budget_tracking')
      .select('id')
      .eq('id', 1)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Row doesn't exist, create it
      const defaultBudget = createDefaultBudgetConfig();
      
      await supabase
        .from('budget_tracking')
        .insert({
          id: 1,
          limits: defaultBudget.limits,
          usage: {
            daily: defaultBudget.usage.daily,
            weekly: defaultBudget.usage.weekly,
            monthly: defaultBudget.usage.monthly,
            last_reset: {
              daily: defaultBudget.usage.last_reset.daily.toISOString(),
              weekly: defaultBudget.usage.last_reset.weekly.toISOString(),
              monthly: defaultBudget.usage.last_reset.monthly.toISOString()
            }
          },
          method_costs: defaultBudget.method_costs,
          alert_thresholds: defaultBudget.alert_thresholds,
          updated_at: new Date().toISOString()
        });
      
      console.log('✅ Budget tracking table initialized');
    }
  } catch (error) {
    console.error('Failed to initialize budget table:', error);
    throw error;
  }
}

/**
 * Allocate budget for a scraping attempt (ATOMIC OPERATION)
 * Uses database function to prevent race conditions
 */
export async function allocateBudget(
  method: ScrapingMethod,
  vendorId: string
): Promise<{ success: boolean; message: string; remaining?: BudgetConfig['usage'] }> {
  const cost = METHOD_COSTS[method];
  
  try {
    // Use typed RPC wrapper
    const result = await rpc.allocateScrapebudget({
      p_method: method,
      p_vendor_id: vendorId,
      p_cost: cost
    });
    
    if (!result || !result.success) {
      return {
        success: false,
        message: result?.message || 'Insufficient budget for this operation',
        remaining: result?.remaining ? {
          daily: result.remaining.daily,
          weekly: result.remaining.weekly,
          monthly: result.remaining.monthly,
          last_reset: {
            daily: new Date(result.remaining.last_reset.daily),
            weekly: new Date(result.remaining.last_reset.weekly),
            monthly: new Date(result.remaining.last_reset.monthly)
          }
        } : undefined
      };
    }
    
    console.log(`💸 Allocated $${cost.toFixed(2)} for ${method} scraping of ${vendorId}`);
    
    // Check if we need to send alerts based on new usage levels
    if (result.alert_triggered && result.alert_level && result.message && result.remaining) {
      const remaining: BudgetConfig['usage'] = {
        daily: result.remaining.daily,
        weekly: result.remaining.weekly,
        monthly: result.remaining.monthly,
        last_reset: {
          daily: new Date(result.remaining.last_reset.daily),
          weekly: new Date(result.remaining.last_reset.weekly),
          monthly: new Date(result.remaining.last_reset.monthly)
        }
      };
      await sendBudgetAlert(result.alert_level, result.message, remaining);
    }
    
    return {
      success: true,
      message: `Successfully allocated $${cost.toFixed(2)}`,
      remaining: result.remaining ? {
        daily: result.remaining.daily,
        weekly: result.remaining.weekly,
        monthly: result.remaining.monthly,
        last_reset: {
          daily: new Date(result.remaining.last_reset.daily),
          weekly: new Date(result.remaining.last_reset.weekly),
          monthly: new Date(result.remaining.last_reset.monthly)
        }
      } : undefined
    };
  } catch (error) {
    console.error('Budget allocation failed:', error);
    return {
      success: false,
      message: 'Budget allocation failed due to system error'
    };
  }
}

/**
 * Get current budget status (READ-ONLY)
 * Always fetches fresh data from database
 */
export async function getCurrentBudgetStatus(): Promise<{
  budget: BudgetConfig;
  health: ReturnType<typeof getBudgetHealth>;
} | null> {
  const supabase = getSupabase();
  
  try {
    const { data, error } = await supabase
      .from('budget_tracking')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error || !data) {
      console.error('Failed to fetch budget:', error);
      return null;
    }
    
    const budget = hydrateBudgetConfig(data);
    const health = getBudgetHealth(budget);
    
    return { budget, health };
  } catch (error) {
    console.error('Error fetching budget status:', error);
    return null;
  }
}

/**
 * Check if we can afford a specific method
 * Always checks against current database state
 */
export async function canAfford(method: ScrapingMethod): Promise<boolean> {
  const cost = METHOD_COSTS[method];
  
  try {
    return await rpc.checkBudgetAvailable(cost);
  } catch (error) {
    console.error('Error checking budget availability:', error);
    return false;
  }
}

/**
 * Get optimal scraping method for a vendor
 * Considers current budget and vendor preferences
 */
export async function getOptimalMethod(
  vendorId: string,
  preferredMethods: ScrapingMethod[] = ['playwright', 'firecrawl', 'vision']
): Promise<ScrapingMethod> {
  const status = await getCurrentBudgetStatus();
  if (!status) return 'playwright'; // Default to free method if error
  
  // Check vendor overrides
  const override = VENDOR_OVERRIDES[vendorId];
  if (override?.preferred_method) {
    if (await canAfford(override.preferred_method)) {
      return override.preferred_method;
    }
  }
  
  // Try methods in preference order
  for (const method of preferredMethods) {
    if (await canAfford(method)) {
      return method;
    }
  }
  
  return 'playwright'; // Always fall back to free method
}

/**
 * Record scraping result and actual cost
 */
export async function recordScrapeResult(result: ScrapeResult): Promise<void> {
  const supabase = getSupabase();
  
  try {
    const { error } = await supabase
      .from('scrape_history')
      .insert({
        vendor_id: result.vendor_id,
        method: result.method_used,
        status: result.status,
        cost: result.actual_cost,
        duration_ms: result.duration_ms || null,
        started_at: result.started_at.toISOString(),
        completed_at: result.completed_at.toISOString(),
        error_message: result.error?.message || null,
        extracted_data: result.data || null,
        confidence: result.data?.tiers?.[0]?.confidence || null
      });
      
    if (error) {
      console.error('Failed to record scrape result:', error);
    }
  } catch (error) {
    console.error('Failed to record scrape result:', error);
  }
}

/**
 * Get budget statistics using SQL aggregation
 * Much more efficient than fetching all data and processing in JS
 */
export async function getBudgetStats(period: BudgetPeriod = 'monthly'): Promise<{
  spent: number;
  remaining: number;
  utilization: number;
  methodBreakdown: Record<ScrapingMethod, number>;
  topVendors: Array<{ vendor_id: string; vendor_name: string; cost: number; scrape_count: number }>;
  successRate: number;
} | null> {
  try {
    const stats = await rpc.getBudgetStats(period);
    
    return {
      spent: stats.spent,
      remaining: stats.remaining,
      utilization: stats.utilization,
      methodBreakdown: stats.methodBreakdown as Record<ScrapingMethod, number>,
      topVendors: stats.topVendors,
      successRate: stats.successRate
    };
  } catch (error) {
    console.error('Error getting budget stats:', error);
    return null;
  }
}

/**
 * Check and reset budget periods (called by cron job)
 * This should be called from a Vercel cron job endpoint, not setInterval
 */
export async function checkAndResetBudgetPeriods(): Promise<{
  resetDaily: boolean;
  resetWeekly: boolean;
  resetMonthly: boolean;
}> {
  try {
    const result = await rpc.checkAndResetBudgetPeriods();
    
    if (result.resetDaily) console.log('🔄 Daily budget reset');
    if (result.resetWeekly) console.log('🔄 Weekly budget reset');
    if (result.resetMonthly) console.log('🔄 Monthly budget reset');
    
    return {
      resetDaily: result.resetDaily,
      resetWeekly: result.resetWeekly,
      resetMonthly: result.resetMonthly
    };
  } catch (error) {
    console.error('Error resetting budget periods:', error);
    return { resetDaily: false, resetWeekly: false, resetMonthly: false };
  }
}

/**
 * Emergency shutdown - immediately exhausts all budgets
 */
export async function emergencyShutdown(reason: string): Promise<boolean> {
  try {
    const result = await rpc.emergencyShutdown(reason);
    
    if (result) {
      console.log('🚨 EMERGENCY SHUTDOWN EXECUTED:', reason);
      
      const now = new Date();
      await sendBudgetAlert('critical', `EMERGENCY SHUTDOWN: ${reason}`, { 
        daily: 0, 
        weekly: 0, 
        monthly: 0,
        last_reset: {
          daily: now,
          weekly: now,
          monthly: now
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('Emergency shutdown failed:', error);
    return false;
  }
}

/**
 * Get scraping health metrics
 */
export async function getScrapingHealth(): Promise<ScrapeHealth> {
  try {
    const budgetStatus = await getCurrentBudgetStatus();
    const metrics = await rpc.getScrapingHealthMetrics();
    
    if (!budgetStatus || !metrics) {
      throw new Error('Failed to get health metrics');
    }
    
    // Handle trend type conversion
    const trendMap: { [key: string]: 'improving' | 'stable' | 'degrading' } = {
      'up': 'improving',
      'down': 'degrading',
      'stable': 'stable'
    };
    
    return {
      status: budgetStatus.health.status === 'healthy' ? 'healthy' : 
               budgetStatus.health.status === 'exhausted' ? 'critical' : 'degraded',
      budget: {
        daily_remaining: budgetStatus.health.remaining.daily,
        weekly_remaining: budgetStatus.health.remaining.weekly,
        monthly_remaining: budgetStatus.health.remaining.monthly,
        days_until_reset: metrics.days_until_monthly_reset
      },
      system: {
        playwright_available: true,
        firecrawl_available: budgetStatus.health.remaining.monthly >= METHOD_COSTS.firecrawl,
        vision_available: budgetStatus.health.remaining.monthly >= METHOD_COSTS.vision,
        queue_size: metrics.queue_size,
        active_jobs: metrics.active_jobs
      },
      recent_stats: {
        last_hour_success_rate: metrics.last_hour_success_rate,
        last_day_success_rate: metrics.last_day_success_rate,
        trending: trendMap[metrics.trend] || 'stable'
      },
      alerts: metrics.recent_alerts ? metrics.recent_alerts.map(alert => ({
        level: alert.level as 'info' | 'warning' | 'error',
        message: alert.message,
        timestamp: new Date(alert.timestamp)
      })) : []
    };
  } catch (error) {
    console.error('Failed to get scraping health:', error);
    // Return degraded health status on error
    return {
      status: 'degraded',
      budget: {
        daily_remaining: 0,
        weekly_remaining: 0,
        monthly_remaining: 0,
        days_until_reset: 0
      },
      system: {
        playwright_available: true,
        firecrawl_available: false,
        vision_available: false,
        queue_size: 0,
        active_jobs: 0
      },
      recent_stats: {
        last_hour_success_rate: 0,
        last_day_success_rate: 0,
        trending: 'stable'
      },
      alerts: [{
        level: 'error',
        message: 'Failed to retrieve health metrics',
        timestamp: new Date()
      }]
    };
  }
}

// ============== HELPER FUNCTIONS ==============

/**
 * Hydrate budget config from database record
 */
function hydrateBudgetConfig(data: any): BudgetConfig {
  return {
    limits: data.limits,
    usage: {
      ...data.usage,
      last_reset: {
        daily: new Date(data.usage.last_reset.daily),
        weekly: new Date(data.usage.last_reset.weekly),
        monthly: new Date(data.usage.last_reset.monthly),
      }
    },
    method_costs: data.method_costs,
    alert_thresholds: data.alert_thresholds
  };
}

/**
 * Send budget alert (to logging, and future: email/Slack)
 */
async function sendBudgetAlert(
  level: 'warning' | 'critical' | 'info',
  message: string,
  remaining: BudgetConfig['usage']
): Promise<void> {
  const supabase = getSupabase();
  
  const alertIcon = 
    level === 'critical' ? '🚨' :
    level === 'warning' ? '⚠️' : '📢';
  
  console.log(`${alertIcon} BUDGET ALERT: ${message}`);
  console.log(`  Daily: ${remaining.daily.toFixed(2)} remaining`);
  console.log(`  Weekly: ${remaining.weekly.toFixed(2)} remaining`);
  console.log(`  Monthly: ${remaining.monthly.toFixed(2)} remaining`);
  
  // Store alert in database
  try {
    const { error } = await supabase
      .from('budget_alerts')
      .insert({
        level: level,
        message,
        remaining_budget: {
          daily: remaining.daily,
          weekly: remaining.weekly,
          monthly: remaining.monthly,
          last_reset: {
            daily: remaining.last_reset.daily.toISOString(),
            weekly: remaining.last_reset.weekly.toISOString(),
            monthly: remaining.last_reset.monthly.toISOString()
          }
        },
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Failed to store alert:', error);
    }
  } catch (error) {
    console.error('Failed to store alert:', error);
  }
  
  // TODO: Implement email/Slack notifications
}

// Export serverless-safe service interface
const BudgetManagerService = {
  // Initialization (run once during setup)
  initializeTable: initializeBudgetTable,
  
  // Core operations (all atomic & database-driven)
  allocate: allocateBudget,
  canAfford,
  getOptimalMethod,
  recordResult: recordScrapeResult,
  
  // Status & monitoring (read-only)
  getStatus: getCurrentBudgetStatus,
  getStats: getBudgetStats,
  getHealth: getScrapingHealth,
  
  // Admin operations
  checkAndResetPeriods: checkAndResetBudgetPeriods,
  emergencyShutdown,
};

// Export as both named and default
export { BudgetManagerService as BudgetManager };
export default BudgetManagerService;