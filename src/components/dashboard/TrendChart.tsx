'use client';

import React, { useCallback, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendChartProps, TrendDataSet } from '@/types/charts';
import { formatPrice, formatChartDate } from '@/utils/charts';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Calendar } from 'lucide-react';

/**
 * Get line color for vendor
 */
const getVendorColor = (index: number): string => {
  const colors = [
    'var(--sp-primary, #3b82f6)',
    'var(--sp-secondary, #10b981)',
    'var(--sp-tertiary, #f59e0b)',
    'var(--sp-quaternary, #ec4899)',
    'var(--sp-quinary, #8b5cf6)',
  ];
  return colors[index % colors.length];
};

/**
 * TrendChart Component
 * Displays historical pricing trends over time
 */
export default function TrendChart({
  datasets,
  height = 400,
  period: defaultPeriod = 'month',
  showConfidence = true,
  currency = 'USD',
  className,
}: TrendChartProps) {
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(
    new Set(datasets.map(d => d.vendorName))
  );
  // Fix: Ensure activePeriod is never undefined
  const [activePeriod, setActivePeriod] = useState<'week' | 'month' | 'quarter' | 'year'>(
    defaultPeriod || 'month'
  );

  // Prepare data for the chart
  const allDates = new Set<string>();
  datasets.forEach(dataset => {
    dataset.dataPoints.forEach(point => {
      allDates.add(formatChartDate(point.date, activePeriod as any));
    });
  });

  const sortedDates = Array.from(allDates).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  const chartData = sortedDates.map(dateStr => {
    const dataPoint: any = { date: dateStr };
    datasets.forEach((dataset, index) => {
      if (!selectedVendors.has(dataset.vendorName)) return;
      const point = dataset.dataPoints.find(
        p => formatChartDate(p.date, activePeriod as any) === dateStr
      );
      if (point) {
        dataPoint[`${dataset.vendorName}_price`] = point.price;
        dataPoint[`${dataset.vendorName}_confidence`] = point.confidence;
        dataPoint[`${dataset.vendorName}_source`] = point.source;
      }
    });
    return dataPoint;
  });

  const priceChanges = datasets
    .map(dataset => {
      if (!selectedVendors.has(dataset.vendorName)) return null;
      const points = dataset.dataPoints;
      if (points.length < 2) return null;
      const firstPrice = points[0].price;
      const lastPrice = points[points.length - 1].price;
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      return {
        vendor: dataset.vendorName,
        change,
        direction: change > 1 ? 'up' : change < -1 ? 'down' : 'stable' as const,
      };
    })
    .filter(Boolean);

  const CustomTooltip = useCallback(
    ({ active, payload, label }: any) => {
      if (!active || !payload || payload.length === 0) return null;
      return (
        <div className="bg-sp-midnight border border-sp-border rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              const vendorName = entry.dataKey.replace('_price', '');
              const confidence = entry.payload[`${vendorName}_confidence`];
              const source = entry.payload[`${vendorName}_source`];
              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="flex-1">
                    <span className="text-white text-sm">{vendorName}:</span>
                    <span className="text-white font-medium text-sm ml-1">
                      {formatPrice(entry.value, currency)}
                    </span>
                    {showConfidence && confidence && (
                      <span
                        className="text-xs ml-2"
                        style={{
                          color:
                            confidence >= 0.8
                              ? 'var(--sp-success, #10b981)'
                              : confidence >= 0.6
                              ? 'var(--sp-warning, #f59e0b)'
                              : 'var(--sp-error, #ef4444)',
                        }}
                      >
                        {Math.round(confidence * 100)}%
                      </span>
                    )}
                    {source && (
                      <span className="text-sp-muted text-xs ml-1">({source})</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
    [currency, showConfidence]
  );

  const toggleVendor = useCallback((vendorName: string) => {
    setSelectedVendors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vendorName)) {
        if (newSet.size > 1) {
          newSet.delete(vendorName);
        }
      } else {
        newSet.add(vendorName);
      }
      return newSet;
    });
  }, []);

  const CustomLegend = useCallback(() => {
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {datasets.map((dataset, index) => {
          const isSelected = selectedVendors.has(dataset.vendorName);
          const priceChange = priceChanges.find(p => p?.vendor === dataset.vendorName);
          return (
            <button
              key={dataset.vendorName}
              onClick={() => toggleVendor(dataset.vendorName)}
              className={cn(
                'flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all',
                isSelected
                  ? 'bg-sp-midnight border border-sp-border'
                  : 'bg-sp-midnight/30 opacity-50'
              )}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getVendorColor(index) }}
              />
              <span className="text-white">{dataset.vendorName}</span>
              {priceChange && isSelected && (
                <span className="flex items-center gap-1">
                  {priceChange.direction === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-sp-error" />
                  ) : priceChange.direction === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-sp-success" />
                  ) : (
                    <Minus className="w-3 h-3 text-sp-muted" />
                  )}
                  <span
                    className={cn(
                      'text-xs',
                      priceChange.change > 0 ? 'text-sp-error' : 'text-sp-success'
                    )}
                  >
                    {priceChange.change > 0 ? '+' : ''}
                    {priceChange.change.toFixed(1)}%
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }, [datasets, selectedVendors, priceChanges, toggleVendor]);

  const periods: Array<{ value: 'week' | 'month' | 'quarter' | 'year'; label: string }> = [
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
    { value: 'year', label: 'Yearly' },
  ];

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sp-muted" />
          <div className="flex gap-1">
            {periods.map(p => (
              <button
                key={p.value}
                className={cn(
                  'px-3 py-1 rounded-md text-sm transition-colors',
                  activePeriod === p.value
                    ? 'bg-sp-primary text-white'
                    : 'bg-sp-midnight text-sp-muted hover:bg-sp-midnight/80'
                )}
                onClick={() => setActivePeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {showConfidence && (
            <div className="flex items-center gap-2 text-xs">
                <span className="text-sp-muted">Confidence:</span>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--sp-success, #10b981)' }} />
                    <span className="text-sp-muted">High</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--sp-warning, #f59e0b)' }} />
                    <span className="text-sp-muted">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--sp-error, #ef4444)' }} />
                    <span className="text-sp-muted">Low</span>
                </div>
            </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--sp-border, #1e293b)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--sp-text-muted, #94a3b8)', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: 'var(--sp-text-muted, #94a3b8)', fontSize: 12 }}
            tickFormatter={value => formatPrice(value, currency)}
            width={80}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'var(--sp-border, #1e293b)' }}
          />
          {datasets.map((dataset, index) => {
            if (!selectedVendors.has(dataset.vendorName)) return null;
            return (
              <Line
                key={dataset.vendorName}
                type="monotone"
                dataKey={`${dataset.vendorName}_price`}
                name={dataset.vendorName}
                stroke={getVendorColor(index)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      <CustomLegend />

      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-sp-midnight/50 rounded-lg p-3">
            <p className="text-sp-muted text-xs mb-1">Data Points</p>
            <p className="text-white font-semibold">{sortedDates.length}</p>
        </div>
        <div className="bg-sp-midnight/50 rounded-lg p-3">
            <p className="text-sp-muted text-xs mb-1">Date Range</p>
            <p className="text-white font-semibold text-sm">
                {sortedDates[0]} - {sortedDates[sortedDates.length - 1]}
            </p>
        </div>
        <div className="bg-sp-midnight/50 rounded-lg p-3">
            <p className="text-sp-muted text-xs mb-1">Trending Up</p>
            <p className="text-sp-error font-semibold">
                {priceChanges.filter(p => p?.direction === 'up').length} vendors
            </p>
        </div>
        <div className="bg-sp-midnight/50 rounded-lg p-3">
            <p className="text-sp-muted text-xs mb-1">Trending Down</p>
            <p className="text-sp-success font-semibold">
                {priceChanges.filter(p => p?.direction === 'down').length} vendors
            </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for TrendChart
 */
export function TrendChartSkeleton({ 
  height = 400,
  className 
}: { 
  height?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-sp-midnight/50 rounded-md" />
            <div className="h-8 w-20 bg-sp-midnight/50 rounded-md" />
            <div className="h-8 w-20 bg-sp-midnight/50 rounded-md" />
          </div>
        </div>
        <div 
          className="bg-sp-midnight/50 rounded-lg"
          style={{ height }}
        />
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="h-16 bg-sp-midnight/50 rounded-lg" />
          <div className="h-16 bg-sp-midnight/50 rounded-lg" />
          <div className="h-16 bg-sp-midnight/50 rounded-lg" />
          <div className="h-16 bg-sp-midnight/50 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state for TrendChart
 */
export function TrendChartEmpty({ 
  height = 400,
  className,
  message = 'No historical data available'
}: { 
  height?: number;
  className?: string;
  message?: string;
}) {
  return (
    <div 
      className={cn(
        'w-full flex items-center justify-center bg-sp-midnight/30 rounded-lg border border-sp-border',
        className
      )}
      style={{ height }}
    >
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-sp-muted mx-auto mb-3" />
        <p className="text-sp-muted">{message}</p>
      </div>
    </div>
  );
}