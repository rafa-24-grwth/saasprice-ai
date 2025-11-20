// src/components/comparison/RangeChart.tsx

'use client';

import React, { useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ErrorBar,
  Cell,
} from 'recharts';
import { RangeChartProps, RangeDataPoint } from '@/types/charts';
import { formatPrice } from '@/utils/charts';
import { cn } from '@/lib/utils';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Get confidence color based on level (moved outside component for performance)
 * Using CSS variables for theme consistency
 */
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'var(--sp-success, #10b981)';
  if (confidence >= 0.6) return 'var(--sp-warning, #f59e0b)';
  return 'var(--sp-error, #ef4444)';
};

/**
 * RangeChart Component
 * Displays price ranges with confidence bands and verification status
 */
export default function RangeChart({
  data,
  height = 400,
  showConfidence = true,
  showVerification = true,
  currency = 'USD',
  className,
}: RangeChartProps) {
  // Transform data for Recharts with CORRECTED error range calculation
  const chartData = data.map(point => {
    const value = point.typical || (point.min + point.max) / 2;
    const errorRange: [number, number] = [value - point.min, point.max - value];
    return {
      ...point,
      value,
      errorRange,
    };
  });

  // Custom tooltip - memoized with useCallback for performance
  const CustomTooltip = useCallback(
    ({ active, payload }: any) => {
      if (!active || !payload || !payload[0]) return null;

      const data = payload[0].payload as RangeDataPoint & { value: number };

      return (
        <div className="bg-sp-midnight border border-sp-border rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold mb-2">{data.label}</p>

          <div className="space-y-1 text-sm">
            <p className="text-sp-muted">
              Range: {formatPrice(data.min, currency)} - {formatPrice(data.max, currency)}
            </p>
            {data.typical && (
              <p className="text-white">
                Typical: {formatPrice(data.typical, currency)}
              </p>
            )}

            {showConfidence && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getConfidenceColor(data.confidence) }}
                  />
                  <span className="text-sp-muted">
                    {Math.round(data.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            )}

            {showVerification && (
              <div className="flex items-center gap-1 text-sp-muted">
                {data.verified ? (
                  <>
                    <CheckCircle className="w-3 h-3" style={{ color: 'var(--sp-success, #10b981)' }} />
                    <span>API Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" style={{ color: 'var(--sp-warning, #f59e0b)' }} />
                    <span>Monitored</span>
                  </>
                )}
              </div>
            )}

            <p className="text-sp-muted text-xs mt-2">
              Updated: {new Date(data.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      );
    },
    [showConfidence, showVerification, currency]
  );

  // Custom label for bars - memoized with useCallback
  const renderCustomLabel = useCallback(
    (props: any) => {
      const { x, y, width, value } = props;
      return (
        <text
          x={x + width / 2}
          y={y - 5}
          fill="var(--sp-text-muted, #94a3b8)"
          textAnchor="middle"
          fontSize={12}
        >
          {formatPrice(value, currency)}
        </text>
      );
    },
    [currency]
  );

  // Legend content - memoized with useCallback
  const renderLegend = useCallback(() => {
    if (!showConfidence && !showVerification) return null;

    return (
      <div className="flex justify-center gap-6 mt-4">
        {showConfidence && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-sp-muted">Confidence:</span>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--sp-success, #10b981)' }}
              />
              <span className="text-sp-muted">High (≥80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--sp-warning, #f59e0b)' }}
              />
              <span className="text-sp-muted">Medium (60-80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--sp-error, #ef4444)' }}
              />
              <span className="text-sp-muted">Low (&lt;60%)</span>
            </div>
          </div>
        )}

        {showVerification && showConfidence && (
          <div className="w-px h-4 bg-sp-border" />
        )}

        {showVerification && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-sp-muted">Verification:</span>
            <div className="flex items-center gap-1">
              <CheckCircle
                className="w-4 h-4"
                style={{ color: 'var(--sp-success, #10b981)' }}
              />
              <span className="text-sp-muted">API Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield
                className="w-4 h-4"
                style={{ color: 'var(--sp-info, #3b82f6)' }}
              />
              <span className="text-sp-muted">Monitored</span>
            </div>
          </div>
        )}
      </div>
    );
  }, [showConfidence, showVerification]);

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--sp-border, #1e293b)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--sp-text-muted, #94a3b8)', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          {/* Corrected YAxis component to resolve syntax error */}
          <YAxis
            tick={{ fill: 'var(--sp-text-muted, #94a3b8)', fontSize: 12 }}
            tickFormatter={value => formatPrice(value, currency)}
            width={80}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'var(--sp-hover, rgba(148, 163, 184, 0.05))' }}
          />

          <Bar dataKey="value" label={renderCustomLabel} radius={[4, 4, 0, 0]}>
            {/* Color bars based on confidence */}
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getConfidenceColor(entry.confidence)}
                fillOpacity={0.8}
              />
            ))}

            {/* Error bars showing the range */}
            <ErrorBar
              dataKey="errorRange"
              width={4}
              stroke="var(--sp-text-muted, #64748b)"
              strokeWidth={1.5}
              opacity={0.8}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {renderLegend()}
    </div>
  );
}

/**
 * Loading skeleton for RangeChart
 */
export function RangeChartSkeleton({
  height = 400,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full animate-pulse', className)}>
      <div
        className="bg-sp-surface-1/50 rounded-lg" // Adjusted color for better theme fit
        style={{ height }}
      />
    </div>
  );
}

/**
 * Empty state for RangeChart
 */
export function RangeChartEmpty({
  height = 400,
  className,
  message = 'No pricing data available',
}: {
  height?: number;
  className?: string;
  message?: string;
}) {
  return (
    <div
      className={cn(
        'w-full flex items-center justify-center bg-sp-surface-1/30 rounded-lg border border-sp-border',
        className
      )}
      style={{ height }}
    >
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-sp-text-muted mx-auto mb-3" />
        <p className="text-sp-text-muted">{message}</p>
      </div>
    </div>
  );
}