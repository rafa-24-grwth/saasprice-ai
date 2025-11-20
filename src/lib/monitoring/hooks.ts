// src/lib/monitoring/hooks.ts
import { useState, useEffect, useCallback } from 'react';
import type { MonitoringStats, MonitoringState } from '@/lib/types/monitoring';
import { fetchMonitoringStats } from './api';

interface UseMonitoringStatsOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: MonitoringStats) => void;
}

/**
 * Hook to fetch and manage monitoring statistics
 */
export function useMonitoringStats(options: UseMonitoringStatsOptions = {}) {
  const { 
    refreshInterval = 30000, // 30 seconds default
    enabled = true,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<MonitoringState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchStats = useCallback(async () => {
    try {
      setState((prev: MonitoringState) => ({ ...prev, loading: true, error: null }));
      
      const data = await fetchMonitoringStats();
      
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
      
      onSuccess?.(data);
      
    } catch (error) {
      console.error('Error fetching monitoring stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState((prev: MonitoringState) => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [onSuccess, onError]);

  // Initial fetch and interval setup
  useEffect(() => {
    if (!enabled) return;

    fetchStats();

    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval, enabled]);

  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    refresh,
    isStale: state.lastUpdated 
      ? Date.now() - state.lastUpdated.getTime() > refreshInterval * 2 
      : false
  };
}

/**
 * Hook for specific monitoring sections with memoization
 */
export function useMonitoringSection<T extends keyof MonitoringStats>(
  section: T,
  options?: UseMonitoringStatsOptions
) {
  const { data, ...rest } = useMonitoringStats(options);
  
  return {
    data: data?.[section] || null,
    ...rest
  };
}

/**
 * Hook for real-time monitoring with WebSocket support (future enhancement)
 */
export function useRealtimeMonitoring(options?: UseMonitoringStatsOptions) {
  // For now, this uses polling, but can be upgraded to WebSocket
  return useMonitoringStats({ 
    ...options, 
    refreshInterval: options?.refreshInterval || 5000 // More frequent for "real-time"
  });
}

/**
 * Hook to track specific vendor health
 */
export function useVendorHealth(vendorId?: string) {
  const { data, ...rest } = useMonitoringStats();
  
  const vendorHealth = vendorId && data?.vendors.list 
    ? data.vendors.list.find((v: any) => v.id === vendorId)
    : null;
    
  return {
    vendor: vendorHealth,
    overallHealth: data?.vendors || null,
    ...rest
  };
}