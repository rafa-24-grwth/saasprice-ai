'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardData, TimePeriod } from '@/types/dashboard';

interface UseDashboardOptions {
  period?: TimePeriod;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  period: TimePeriod;
  setPeriod: (period: TimePeriod) => void;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const {
    period: initialPeriod = '30d',
    autoRefresh = false,
    refreshInterval = 60000 // 1 minute default
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<TimePeriod>(initialPeriod);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to view your dashboard');
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Failed to load dashboard');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Initial fetch and period change
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  const refresh = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    period,
    setPeriod,
    refresh,
    lastUpdated,
  };
}

// Additional helper hooks for specific dashboard sections

export function useDashboardMetrics(period: TimePeriod = '30d') {
  const { data, loading, error } = useDashboard({ period });
  return {
    metrics: data?.metrics || null,
    loading,
    error
  };
}

export function usePriceChanges(period: TimePeriod = '30d') {
  const { data, loading, error, refresh } = useDashboard({ period });
  return {
    priceChanges: data?.recentPriceChanges || [],
    loading,
    error,
    refresh
  };
}

export function useWatchlist() {
  const { data, loading, error, refresh } = useDashboard({ period: '30d' });
  return {
    watchlist: data?.watchedVendors || [],
    loading,
    error,
    refresh
  };
}

export function useActivityFeed() {
  const { data, loading, error } = useDashboard({ 
    period: '7d',
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  });
  
  return {
    activities: data?.recentActivity || [],
    loading,
    error
  };
}

// Format helpers
export function formatMetricValue(value: number, type: 'currency' | 'percentage' | 'number' = 'number'): string {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
}

export function getMetricTrend(current: number, previous: number): {
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
  isPositive: boolean;
} {
  if (previous === 0) {
    return { direction: 'neutral', percentage: 0, isPositive: true };
  }

  const percentage = ((current - previous) / previous) * 100;
  const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
  
  // For some metrics, down is good (e.g., costs)
  // For others, up is good (e.g., savings)
  const isPositive = direction === 'up'; // Simplified, can be customized per metric

  return {
    direction,
    percentage: Math.abs(percentage),
    isPositive
  };
}