// lib/types/monitoring.ts

/**
 * Core monitoring data structure matching your SQL function output
 */
export interface MonitoringStats {
  timestamp: string;
  queue: QueueStats;
  budget: BudgetStats;
  performance: PerformanceStats;
  vendors: VendorStats;
  recentJobs: RecentJob[];
}

export interface QueueStats {
  pending_jobs: number;
  processing_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  total_jobs: number;
}

export interface BudgetStats {
  date: string;
  dailyLimit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface PerformanceStats {
  last7Days: {
    totalJobs: number;
    successRate: number;
    methodUsage: Record<string, number>;
    costByMethod: Record<string, number>;
    totalCost: number;
  };
  last24Hours: {
    timeline: TimelineData[];
    totalJobs: number;
  };
}

export interface TimelineData {
  hour: string;
  total: number;
  completed: number;
  failed: number;
  processing: number;
}

export interface VendorStats {
  total: number;
  healthy: number;
  warning: number;
  error: number;
  critical: number;
  list: VendorHealth[];
}

export interface VendorHealth {
  id: string;
  name: string;
  health: 'healthy' | 'warning' | 'error' | 'critical' | 'unknown';
  lastStatus: string;
  lastScraped: string;
  nextScheduled: string;
  hoursSinceLastScrape: number;
}

export interface RecentJob {
  id: string;
  vendorId: string;
  vendorName?: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// Utility type for loading states
export interface MonitoringState {
  data: MonitoringStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Chart data types for visualization components
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  time: string | Date;
  value: number;
  label?: string;
}

/**
 * Alert types for monitoring thresholds
 */
export interface MonitoringAlert {
  id: string;
  type: 'budget' | 'performance' | 'vendor' | 'queue';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Configuration for monitoring thresholds
 */
export interface MonitoringThresholds {
  budget: {
    warningPercent: number;  // e.g., 70
    criticalPercent: number; // e.g., 90
  };
  successRate: {
    warningPercent: number;  // e.g., 85
    criticalPercent: number; // e.g., 70
  };
  queue: {
    maxPendingJobs: number;  // e.g., 50
    maxFailedJobs: number;   // e.g., 10
  };
  vendor: {
    maxHoursSinceLastScrape: number; // e.g., 24
  };
}

/**
 * Export types for data export functionality
 */
export interface MonitoringExport {
  format: 'csv' | 'json' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  sections: Array<keyof MonitoringStats>;
}