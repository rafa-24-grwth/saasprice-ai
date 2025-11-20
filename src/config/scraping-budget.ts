// src/config/scraping-budget.ts

import type { BudgetConfig, ScrapingMethod } from '@/types/scraping';
import { isSameDay, isSameWeek, isSameMonth } from 'date-fns';

/**
 * Budget Configuration for Scraping System
 * Keeps total costs under $100/month while maximizing data collection
 */

// Environment-based configuration
const ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = ENV === 'production';

/**
 * Cost per scraping method in USD
 * Based on actual API pricing
 */
export const METHOD_COSTS: { [K in ScrapingMethod]: number } = {
  playwright: 0,        // Free - uses our own infrastructure
  firecrawl: 0.01,     // $0.01 per page (Firecrawl pricing)
  vision: 0.02,        // ~$0.02 per image (GPT-4 Vision estimate)
  manual: 0            // Manual review - no automated cost
};

/**
 * Budget limits by time period
 * Conservative limits to ensure we stay well under $100/month
 */
export const BUDGET_LIMITS = {
  daily: IS_PRODUCTION ? 3.00 : 1.00,    // $3/day in prod, $1 in dev
  weekly: IS_PRODUCTION ? 20.00 : 5.00,  // $20/week in prod, $5 in dev  
  monthly: IS_PRODUCTION ? 80.00 : 20.00, // $80/month in prod (safety margin)
} as const;

/**
 * Alert thresholds as percentages
 */
export const ALERT_THRESHOLDS = {
  warning: 0.75,   // Alert at 75% of budget
  critical: 0.90,  // Critical alert at 90%
  shutdown: 0.95,  // Stop all paid scraping at 95%
} as const;

/**
 * Scraping frequency limits by vendor tier
 * More important vendors get scraped more frequently
 */
export const SCRAPE_FREQUENCY = {
  tier1: {
    // Top 20% of vendors (most popular)
    interval: 'daily' as const,
    max_cost_per_scrape: 0.02,
    allowed_methods: ['playwright', 'firecrawl', 'vision'] as ScrapingMethod[],
  },
  tier2: {
    // Middle 30% of vendors
    interval: 'weekly' as const,
    max_cost_per_scrape: 0.01,
    allowed_methods: ['playwright', 'firecrawl'] as ScrapingMethod[],
  },
  tier3: {
    // Bottom 50% of vendors
    interval: 'biweekly' as const,
    max_cost_per_scrape: 0,
    allowed_methods: ['playwright'] as ScrapingMethod[], // Free only
  },
} as const;

/**
 * Method escalation rules
 * When to upgrade from free to paid methods
 */
export const ESCALATION_RULES = {
  // After how many failures should we try a more expensive method?
  playwright_max_failures: 3,
  firecrawl_max_failures: 2,
  
  // Minimum time between escalation attempts (in hours)
  escalation_cooldown: 24,
  
  // Only escalate if we have this much budget remaining
  min_budget_for_escalation: {
    daily: 0.50,    // Need at least $0.50 daily budget
    weekly: 2.00,   // Need at least $2 weekly budget
    monthly: 10.00, // Need at least $10 monthly budget
  },
} as const;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  playwright: {
    max_attempts: 3,
    delay_ms: 2000,
    backoff_multiplier: 2,
    timeout_ms: 30000,
  },
  firecrawl: {
    max_attempts: 2,
    delay_ms: 1000,
    backoff_multiplier: 1.5,
    timeout_ms: 45000,
  },
  vision: {
    max_attempts: 1, // Expensive, don't retry
    delay_ms: 0,
    backoff_multiplier: 1,
    timeout_ms: 60000,
  },
  manual: {
    max_attempts: 1, // Manual process, no automated retry
    delay_ms: 0,
    backoff_multiplier: 1,
    timeout_ms: 0,
  },
} as const;

/**
 * Queue configuration
 */
export const QUEUE_CONFIG = {
  // Maximum concurrent scraping jobs
  max_concurrent: IS_PRODUCTION ? 5 : 2,
  
  // Job priorities and their weights
  priority_weights: {
    critical: 1000,  // Immediate execution
    high: 100,       // Important updates
    normal: 10,      // Regular scheduled scrapes
    low: 1,          // Background/cleanup tasks
  },
  
  // Maximum queue size before rejecting new jobs
  max_queue_size: 1000,
  
  // Job expiration (in hours)
  job_ttl: 48,
} as const;

/**
 * Rate limiting per service
 */
export const RATE_LIMITS = {
  playwright: {
    requests_per_minute: 30,
    requests_per_hour: 500,
    concurrent_requests: 3,
  },
  firecrawl: {
    requests_per_minute: 10,
    requests_per_hour: 100,
    concurrent_requests: 2,
  },
  vision: {
    requests_per_minute: 5,
    requests_per_hour: 50,
    concurrent_requests: 1,
  },
  manual: {
    requests_per_minute: 1,
    requests_per_hour: 10,
    concurrent_requests: 1,
  },
} as const;

/**
 * Vendor-specific overrides
 * For vendors that need special handling
 */
export const VENDOR_OVERRIDES: Record<string, Partial<{
  preferred_method: ScrapingMethod;
  max_cost: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  timeout_ms: number;
}>> = {
  // Example overrides for problematic vendors
  'hubspot': {
    preferred_method: 'firecrawl', // Complex React app
    max_cost: 0.02,
    frequency: 'daily', // Popular vendor
  },
  'salesforce': {
    preferred_method: 'firecrawl', // Heavy JavaScript
    max_cost: 0.02,
    frequency: 'daily',
  },
  'notion': {
    preferred_method: 'playwright', // Works well with Playwright
    max_cost: 0,
    frequency: 'weekly',
  },
} as const;

/**
 * Create default budget configuration
 */
export function createDefaultBudgetConfig(): BudgetConfig {
  const now = new Date();
  
  return {
    limits: BUDGET_LIMITS,
    usage: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      last_reset: {
        daily: now,
        weekly: now,
        monthly: now,
      },
    },
    method_costs: METHOD_COSTS,
    alert_thresholds: ALERT_THRESHOLDS,
  };
}

/**
 * Calculate remaining budget for a period
 */
export function calculateRemainingBudget(
  config: BudgetConfig,
  period: 'daily' | 'weekly' | 'monthly'
): number {
  return Math.max(0, config.limits[period] - config.usage[period]);
}

/**
 * Check if we can afford a scraping method
 */
export function canAffordMethod(
  config: BudgetConfig,
  method: ScrapingMethod
): boolean {
  const cost = METHOD_COSTS[method];
  
  // Check all budget periods
  const dailyRemaining = calculateRemainingBudget(config, 'daily');
  const weeklyRemaining = calculateRemainingBudget(config, 'weekly');
  const monthlyRemaining = calculateRemainingBudget(config, 'monthly');
  
  return (
    cost <= dailyRemaining &&
    cost <= weeklyRemaining &&
    cost <= monthlyRemaining
  );
}

/**
 * Get budget health status
 */
export function getBudgetHealth(config: BudgetConfig): {
  status: 'healthy' | 'warning' | 'critical' | 'exhausted';
  message: string;
  remaining: {
    daily: number;
    weekly: number;
    monthly: number;
  };
} {
  const remaining = {
    daily: calculateRemainingBudget(config, 'daily'),
    weekly: calculateRemainingBudget(config, 'weekly'),
    monthly: calculateRemainingBudget(config, 'monthly'),
  };
  
  // Check utilization percentages
  const dailyUtilization = config.usage.daily / config.limits.daily;
  const weeklyUtilization = config.usage.weekly / config.limits.weekly;
  const monthlyUtilization = config.usage.monthly / config.limits.monthly;
  
  const maxUtilization = Math.max(
    dailyUtilization,
    weeklyUtilization,
    monthlyUtilization
  );
  
  if (maxUtilization >= ALERT_THRESHOLDS.shutdown) {
    return {
      status: 'exhausted',
      message: 'Budget exhausted - only free methods available',
      remaining,
    };
  }
  
  if (maxUtilization >= ALERT_THRESHOLDS.critical) {
    return {
      status: 'critical',
      message: 'Critical budget warning - approaching limits',
      remaining,
    };
  }
  
  if (maxUtilization >= ALERT_THRESHOLDS.warning) {
    return {
      status: 'warning',
      message: 'Budget warning - monitor usage carefully',
      remaining,
    };
  }
  
  return {
    status: 'healthy',
    message: 'Budget healthy - all methods available',
    remaining,
  };
}

/**
 * Determine best method based on budget and vendor config
 */
export function selectScrapingMethod(
  vendor_id: string,
  budget: BudgetConfig,
  preferred_methods: ScrapingMethod[] = ['playwright', 'firecrawl', 'vision', 'manual']
): ScrapingMethod | null {
  // Check vendor overrides first
  const override = VENDOR_OVERRIDES[vendor_id];
  if (override?.preferred_method && canAffordMethod(budget, override.preferred_method)) {
    return override.preferred_method;
  }
  
  // Try methods in preference order
  for (const method of preferred_methods) {
    if (canAffordMethod(budget, method)) {
      return method;
    }
  }
  
  // Always fall back to free Playwright if nothing else works
  return 'playwright';
}

/**
 * Reset budget usage for a period
 */
export function resetBudgetPeriod(
  config: BudgetConfig,
  period: 'daily' | 'weekly' | 'monthly'
): BudgetConfig {
  return {
    ...config,
    usage: {
      ...config.usage,
      [period]: 0,
      last_reset: {
        ...config.usage.last_reset,
        [period]: new Date(),
      },
    },
  };
}

/**
 * Check if budget period should be reset
 */
export function shouldResetBudget(
  config: BudgetConfig,
  period: 'daily' | 'weekly' | 'monthly'
): boolean {
  const now = new Date();
  const lastReset = config.usage.last_reset[period];
  
  switch (period) {
    case 'daily':
      return !isSameDay(now, lastReset);
    
    case 'weekly':
      // isSameWeek uses Monday as the start of the week by default
      return !isSameWeek(now, lastReset);
    
    case 'monthly':
      return !isSameMonth(now, lastReset);
    
    default:
      return false;
  }
}

/**
 * Export consolidated configuration
 */
export const SCRAPING_CONFIG = {
  costs: METHOD_COSTS,
  limits: BUDGET_LIMITS,
  alerts: ALERT_THRESHOLDS,
  frequency: SCRAPE_FREQUENCY,
  escalation: ESCALATION_RULES,
  retry: RETRY_CONFIG,
  queue: QUEUE_CONFIG,
  rateLimits: RATE_LIMITS,
  vendorOverrides: VENDOR_OVERRIDES,
};

// Default export
export default SCRAPING_CONFIG;