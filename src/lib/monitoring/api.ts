// src/lib/monitoring/api.ts
import type { MonitoringStats, MonitoringExport } from '@/lib/types/monitoring';

/**
 * Base API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const MONITORING_ENDPOINT = '/api/monitoring/stats';

/**
 * Fetch monitoring statistics from the API
 */
export async function fetchMonitoringStats(): Promise<MonitoringStats> {
  const response = await fetch(`${API_BASE_URL}${MONITORING_ENDPOINT}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Always fetch fresh data
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch monitoring stats: ${response.status}`);
  }

  const data = await response.json();
  return data as MonitoringStats;
}

/**
 * Export monitoring data in various formats
 */
export async function exportMonitoringData(options: MonitoringExport): Promise<Blob> {
  const params = new URLSearchParams({
    format: options.format,
    start: options.dateRange.start.toISOString(),
    end: options.dateRange.end.toISOString(),
    sections: options.sections.join(','),
  });

  const response = await fetch(`${API_BASE_URL}/api/monitoring/export?${params}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to export monitoring data');
  }

  return await response.blob();
}

/**
 * Trigger a manual refresh of monitoring data
 */
export async function refreshMonitoringData(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/monitoring/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to refresh monitoring data');
  }
}

/**
 * Get monitoring data for a specific time range
 */
export async function getHistoricalMonitoringData(
  startDate: Date,
  endDate: Date
): Promise<MonitoringStats[]> {
  const params = new URLSearchParams({
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/monitoring/historical?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch historical monitoring data');
  }

  return await response.json();
}

/**
 * Update monitoring configuration (e.g., thresholds)
 */
export async function updateMonitoringConfig(config: Record<string, any>): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/monitoring/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error('Failed to update monitoring configuration');
  }
}