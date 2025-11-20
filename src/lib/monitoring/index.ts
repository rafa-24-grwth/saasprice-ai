// src/lib/monitoring/index.ts

/**
 * Monitoring Module - Central export point for all monitoring utilities
 */

// Export all types from the existing types file
export * from '@/lib/types/monitoring';

// Export all hooks
export {
  useMonitoringStats,
  useMonitoringSection,
  useRealtimeMonitoring,
  useVendorHealth
} from './hooks';

// Export API functions
export {
  fetchMonitoringStats,
  exportMonitoringData,
  refreshMonitoringData,
  getHistoricalMonitoringData,
  updateMonitoringConfig
} from './api';

// Export utility functions
export {
  DEFAULT_THRESHOLDS,
  calculateSystemHealth,
  generateAlerts,
  calculateQueueMetrics,
  calculateVendorMetrics,
  formatStatsForExport,
  getTrendDirection,
  estimateTimeToExhaustion
} from './utils';