// src/lib/monitoring/utils.ts
import type { 
  MonitoringStats, 
  MonitoringAlert, 
  MonitoringThresholds,
  VendorHealth,
  QueueStats
} from '@/lib/types/monitoring';

/**
 * Default monitoring thresholds
 */
export const DEFAULT_THRESHOLDS: MonitoringThresholds = {
  budget: {
    warningPercent: 70,
    criticalPercent: 90,
  },
  successRate: {
    warningPercent: 85,
    criticalPercent: 70,
  },
  queue: {
    maxPendingJobs: 50,
    maxFailedJobs: 10,
  },
  vendor: {
    maxHoursSinceLastScrape: 24,
  },
};

/**
 * Calculate overall system health based on multiple metrics
 */
export function calculateSystemHealth(
  stats: MonitoringStats,
  thresholds: MonitoringThresholds = DEFAULT_THRESHOLDS
): 'healthy' | 'warning' | 'error' | 'critical' {
  const { budget, performance, queue, vendors } = stats;
  
  // Check budget
  if (budget.percentUsed > thresholds.budget.criticalPercent) return 'critical';
  
  // Check success rate  
  if (performance.last7Days.successRate < thresholds.successRate.criticalPercent) return 'critical';
  
  // Check critical vendors
  if (vendors.critical > 2) return 'critical';
  
  // Check for error conditions
  if (
    budget.percentUsed > thresholds.budget.warningPercent ||
    performance.last7Days.successRate < thresholds.successRate.warningPercent ||
    vendors.critical > 0 ||
    queue.failed_jobs > thresholds.queue.maxFailedJobs
  ) {
    return 'error';
  }
  
  // Check for warning conditions
  if (
    vendors.error > 0 ||
    queue.pending_jobs > thresholds.queue.maxPendingJobs ||
    vendors.warning > 2
  ) {
    return 'warning';
  }
  
  return 'healthy';
}

/**
 * Generate alerts based on monitoring stats and thresholds
 */
export function generateAlerts(
  stats: MonitoringStats,
  thresholds: MonitoringThresholds = DEFAULT_THRESHOLDS
): MonitoringAlert[] {
  const alerts: MonitoringAlert[] = [];
  
  // Budget alerts
  if (stats.budget.percentUsed > thresholds.budget.criticalPercent) {
    alerts.push({
      id: `budget-critical-${Date.now()}`,
      type: 'budget',
      severity: 'critical',
      title: 'Critical Budget Usage',
      message: `Daily budget is ${stats.budget.percentUsed.toFixed(0)}% used. Only $${stats.budget.remaining.toFixed(2)} remaining.`,
      timestamp: new Date(),
      metadata: { percentUsed: stats.budget.percentUsed, remaining: stats.budget.remaining },
    });
  } else if (stats.budget.percentUsed > thresholds.budget.warningPercent) {
    alerts.push({
      id: `budget-warning-${Date.now()}`,
      type: 'budget',
      severity: 'warning',
      title: 'High Budget Usage',
      message: `Daily budget is ${stats.budget.percentUsed.toFixed(0)}% used.`,
      timestamp: new Date(),
      metadata: { percentUsed: stats.budget.percentUsed },
    });
  }
  
  // Success rate alerts
  if (stats.performance.last7Days.successRate < thresholds.successRate.criticalPercent) {
    alerts.push({
      id: `success-critical-${Date.now()}`,
      type: 'performance',
      severity: 'critical',
      title: 'Critical Success Rate',
      message: `Success rate is only ${stats.performance.last7Days.successRate}% over the last 7 days.`,
      timestamp: new Date(),
      metadata: { successRate: stats.performance.last7Days.successRate },
    });
  }
  
  // Queue alerts
  if (stats.queue.failed_jobs > thresholds.queue.maxFailedJobs) {
    alerts.push({
      id: `queue-failed-${Date.now()}`,
      type: 'queue',
      severity: 'error',
      title: 'High Failed Job Count',
      message: `${stats.queue.failed_jobs} jobs have failed. Manual intervention may be required.`,
      timestamp: new Date(),
      metadata: { failedJobs: stats.queue.failed_jobs },
    });
  }
  
  if (stats.queue.pending_jobs > thresholds.queue.maxPendingJobs) {
    alerts.push({
      id: `queue-backlog-${Date.now()}`,
      type: 'queue',
      severity: 'warning',
      title: 'Large Queue Backlog',
      message: `${stats.queue.pending_jobs} jobs are pending. Consider scaling workers.`,
      timestamp: new Date(),
      metadata: { pendingJobs: stats.queue.pending_jobs },
    });
  }
  
  // Vendor alerts
  if (stats.vendors.critical > 0) {
    alerts.push({
      id: `vendor-critical-${Date.now()}`,
      type: 'vendor',
      severity: 'critical',
      title: 'Critical Vendor Issues',
      message: `${stats.vendors.critical} vendors are in critical state.`,
      timestamp: new Date(),
      metadata: { criticalVendors: stats.vendors.critical },
    });
  }
  
  return alerts;
}

/**
 * Calculate queue processing rate
 */
export function calculateQueueMetrics(queue: QueueStats) {
  const completionRate = queue.total_jobs > 0 
    ? (queue.completed_jobs / queue.total_jobs) * 100 
    : 0;
    
  const failureRate = queue.total_jobs > 0 
    ? (queue.failed_jobs / queue.total_jobs) * 100 
    : 0;
    
  const backlogSize = queue.pending_jobs + queue.processing_jobs;
  
  return {
    completionRate: Math.round(completionRate),
    failureRate: Math.round(failureRate),
    backlogSize,
    isHealthy: failureRate < 10 && backlogSize < 50,
  };
}

/**
 * Calculate vendor health metrics
 */
export function calculateVendorMetrics(vendor: VendorHealth) {
  const hoursSinceLastScrape = vendor.hoursSinceLastScrape || Infinity;
  
  let healthScore = 100;
  
  // Deduct points based on time since last scrape
  if (hoursSinceLastScrape > 48) healthScore -= 50;
  else if (hoursSinceLastScrape > 24) healthScore -= 30;
  else if (hoursSinceLastScrape > 12) healthScore -= 10;
  
  // Deduct points based on current health status
  switch (vendor.health) {
    case 'critical': healthScore -= 40; break;
    case 'error': healthScore -= 30; break;
    case 'warning': healthScore -= 20; break;
    case 'unknown': healthScore -= 10; break;
  }
  
  return {
    healthScore: Math.max(0, healthScore),
    needsAttention: healthScore < 50,
    isOverdue: hoursSinceLastScrape > 24,
  };
}

/**
 * Format monitoring stats for export
 */
export function formatStatsForExport(stats: MonitoringStats, format: 'csv' | 'json' = 'json') {
  if (format === 'json') {
    return JSON.stringify(stats, null, 2);
  }
  
  // CSV format
  const csvRows = [
    ['Metric', 'Value'],
    ['Timestamp', stats.timestamp],
    ['Total Jobs', stats.queue.total_jobs.toString()],
    ['Pending Jobs', stats.queue.pending_jobs.toString()],
    ['Processing Jobs', stats.queue.processing_jobs.toString()],
    ['Completed Jobs', stats.queue.completed_jobs.toString()],
    ['Failed Jobs', stats.queue.failed_jobs.toString()],
    ['Daily Budget Limit', `$${stats.budget.dailyLimit.toFixed(2)}`],
    ['Budget Spent', `$${stats.budget.spent.toFixed(2)}`],
    ['Budget Remaining', `$${stats.budget.remaining.toFixed(2)}`],
    ['Budget Used %', `${stats.budget.percentUsed.toFixed(0)}%`],
    ['7-Day Success Rate', `${stats.performance.last7Days.successRate}%`],
    ['7-Day Total Jobs', stats.performance.last7Days.totalJobs.toString()],
    ['7-Day Total Cost', `$${stats.performance.last7Days.totalCost.toFixed(2)}`],
    ['Total Vendors', stats.vendors.total.toString()],
    ['Healthy Vendors', stats.vendors.healthy.toString()],
    ['Warning Vendors', stats.vendors.warning.toString()],
    ['Error Vendors', stats.vendors.error.toString()],
    ['Critical Vendors', stats.vendors.critical.toString()],
  ];
  
  return csvRows.map(row => row.join(',')).join('\n');
}

/**
 * Get trend direction for a metric
 */
export function getTrendDirection(current: number, previous: number): 'up' | 'down' | 'stable' {
  const threshold = 0.05; // 5% change threshold
  const percentChange = (current - previous) / previous;
  
  if (Math.abs(percentChange) < threshold) return 'stable';
  return percentChange > 0 ? 'up' : 'down';
}

/**
 * Calculate estimated time to budget exhaustion
 */
export function estimateTimeToExhaustion(budget: MonitoringStats['budget']): string {
  if (budget.spent === 0) return 'Unknown';
  
  const currentTime = new Date().getHours();
  const hoursElapsed = currentTime || 1; // Avoid division by zero
  const hourlyRate = budget.spent / hoursElapsed;
  const remainingHours = budget.remaining / hourlyRate;
  
  if (remainingHours > 24) return '> 24 hours';
  if (remainingHours < 1) return '< 1 hour';
  
  return `~${Math.round(remainingHours)} hours`;
}