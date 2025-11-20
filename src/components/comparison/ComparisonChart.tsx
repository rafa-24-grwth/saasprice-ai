// src/components/comparison/ComparisonChart.tsx

'use client';

import React, { useCallback, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { ComparisonChartProps, ComparisonDataSet } from '@/types/charts';
import { formatPrice } from '@/utils/charts';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Get bar color based on vendor index
 */
const getVendorColor = (index: number): string => {
  const colors = [
    'var(--sp-primary, #3b82f6)',
    'var(--sp-secondary, #10b981)',
    'var(--sp-tertiary, #f59e0b)',
    'var(--sp-quaternary, #ec4899)',
  ];
  return colors[index % colors.length];
};

/**
 * ComparisonChart Component
 * Displays side-by-side comparison of vendor pricing
 */
export default function ComparisonChart({
  datasets,
  selectedTier: defaultSelectedTier = 'all',
  height = 400,
  showFeatures = false,
  currency = 'USD',
  className,
  onVendorClick
}: ComparisonChartProps) {
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState(defaultSelectedTier);

  // Filter and transform data based on selected tier
  const chartData = datasets.map((dataset, vendorIndex) => {
    const tiers = activeTier === 'all'
      ? dataset.tiers 
      : dataset.tiers.filter(t => t.name === activeTier);

    // Calculate average price if showing all tiers
    const avgPrice = tiers.reduce((sum, tier) => sum + tier.price, 0) / tiers.length;
    const avgConfidence = tiers.reduce((sum, tier) => sum + tier.confidence, 0) / tiers.length;

    return {
      vendor: dataset.vendorName,
      price: activeTier === 'all' ? avgPrice : tiers[0]?.price || 0,
      confidence: activeTier === 'all' ? avgConfidence : tiers[0]?.confidence || 0,
      verified: dataset.verified,
      lastUpdated: dataset.lastUpdated,
      tiers,
      logo: dataset.vendorLogo,
      index: vendorIndex
    };
  }).sort((a, b) => a.price - b.price);

  // Calculate price differences
  const lowestPrice = chartData[0]?.price || 0;
  const enrichedData = chartData.map(item => ({
    ...item,
    difference: item.price - lowestPrice,
    percentDiff: lowestPrice > 0 ? ((item.price - lowestPrice) / lowestPrice) * 100 : 0
  }));

  // Custom tooltip
  const CustomTooltip = useCallback(({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    
    return (
      <div className="bg-sp-midnight border border-sp-border rounded-lg p-4 shadow-xl max-w-sm">
        <div className="flex items-center gap-2 mb-3">
          {data.logo && (
            <img src={data.logo} alt={data.vendor} className="w-8 h-8 rounded" />
          )}
          <p className="text-white font-semibold">{data.vendor}</p>
        </div>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-sp-muted">Price: </span>
            <span className="text-white font-medium">
              {formatPrice(data.price, currency)}
            </span>
            {activeTier === 'all' && (
              <span className="text-sp-muted text-xs ml-1">(avg)</span>
            )}
          </div>

          {data.difference > 0 && (
            <div className="flex items-center gap-1">
              <ArrowUpIcon className="w-3 h-3 text-red-500" />
              <span className="text-red-500 text-xs">
                +{formatPrice(data.difference, currency)} ({data.percentDiff.toFixed(1)}%)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: data.confidence >= 0.8 
                  ? 'var(--sp-success, #10b981)' 
                  : data.confidence >= 0.6 
                  ? 'var(--sp-warning, #f59e0b)'
                  : 'var(--sp-error, #ef4444)'
              }}
            />
            <span className="text-sp-muted text-xs">
              {Math.round(data.confidence * 100)}% confidence
            </span>
          </div>

          {data.verified ? (
            <div className="flex items-center gap-1 text-green-500 text-xs">
              <CheckCircle className="w-3 h-3" />
              <span>API Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Monitored</span>
            </div>
          )}

          {showFeatures && data.tiers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-sp-border">
              <p className="text-sp-muted text-xs mb-1">Key features:</p>
              <ul className="text-xs space-y-1">
                {data.tiers[0].features?.slice(0, 3).map((feature: string, i: number) => (
                  <li key={i} className="text-sp-muted flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sp-muted text-xs pt-2">
            Updated: {new Date(data.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }, [showFeatures, currency, activeTier]);

  // Custom bar label - Returns ReactElement to match Recharts' ImplicitLabelType
  const renderCustomLabel = useCallback((props: any): React.ReactElement => {
    const { x, y, width, value, payload } = props;
    
    // Return empty group if payload is missing (instead of null to satisfy type requirements)
    if (!payload) {
      return <g />;
    }
    
    const isLowest = payload.difference === 0;
    
    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 20}
          fill="var(--sp-text-muted, #94a3b8)"
          textAnchor="middle"
          fontSize={12}
          fontWeight={isLowest ? 'bold' : 'normal'}
        >
          {formatPrice(value, currency)}
        </text>
        {isLowest && (
          <text
            x={x + width / 2}
            y={y - 5}
            fill="var(--sp-success, #10b981)"
            textAnchor="middle"
            fontSize={10}
          >
            LOWEST
          </text>
        )}
      </g>
    );
  }, [currency]);

  // Handle bar click
  const handleBarClick = useCallback((data: any) => {
    if (onVendorClick) {
      onVendorClick(data.vendor);
    }
  }, [onVendorClick]);

  return (
    <div className={cn('w-full', className)}>
      {/* Tier selector */}
      {datasets[0]?.tiers.length > 1 && (
        <div className="flex gap-2 mb-4">
          <button
            className={cn(
              'px-3 py-1 rounded-md text-sm transition-colors',
              activeTier === 'all'
                ? 'bg-sp-primary text-white'
                : 'bg-sp-midnight text-sp-muted hover:bg-sp-midnight/80'
            )}
            onClick={() => setActiveTier('all')}
          >
            All Tiers (Avg)
          </button>
          {datasets[0].tiers.map(tier => (
            <button
              key={tier.name}
              className={cn(
                'px-3 py-1 rounded-md text-sm transition-colors',
                activeTier === tier.name
                  ? 'bg-sp-primary text-white'
                  : 'bg-sp-midnight text-sp-muted hover:bg-sp-midnight/80'
              )}
              onClick={() => setActiveTier(tier.name)}
            >
              {tier.name}
            </button>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={enrichedData}
          margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--sp-border, #1e293b)"
            vertical={false}
          />
          <XAxis 
            dataKey="vendor"
            tick={{ fill: 'var(--sp-text-muted, #94a3b8)', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fill: 'var(--sp-text-muted, #94a3b8)', fontSize: 12 }}
            tickFormatter={(value) => formatPrice(value, currency)}
            width={80}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'var(--sp-hover, rgba(148, 163, 184, 0.05))' }}
          />
          
          <Bar 
            dataKey="price"
            label={renderCustomLabel}
            radius={[4, 4, 0, 0]}
            onClick={handleBarClick}
            onMouseEnter={(data: any) => setHoveredVendor(data.vendor)}
            onMouseLeave={() => setHoveredVendor(null)}
          >
            {enrichedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={getVendorColor(entry.index)}
                fillOpacity={hoveredVendor === entry.vendor ? 1 : 0.8}
                style={{ cursor: onVendorClick ? 'pointer' : 'default' }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-sp-midnight/50 rounded-lg p-3">
          <p className="text-sp-muted text-xs mb-1">Lowest Price</p>
          <p className="text-white font-semibold">
            {formatPrice(enrichedData[0]?.price || 0, currency)}
          </p>
          <p className="text-green-500 text-xs mt-1">{enrichedData[0]?.vendor}</p>
        </div>
        
        <div className="bg-sp-midnight/50 rounded-lg p-3">
          <p className="text-sp-muted text-xs mb-1">Price Range</p>
          <p className="text-white font-semibold">
            {formatPrice(
              (enrichedData[enrichedData.length - 1]?.price || 0) - (enrichedData[0]?.price || 0),
              currency
            )}
          </p>
          <p className="text-sp-muted text-xs mt-1">difference</p>
        </div>
        
        <div className="bg-sp-midnight/50 rounded-lg p-3">
          <p className="text-sp-muted text-xs mb-1">Average Price</p>
          <p className="text-white font-semibold">
            {formatPrice(
              enrichedData.reduce((sum, d) => sum + d.price, 0) / enrichedData.length,
              currency
            )}
          </p>
          <p className="text-sp-muted text-xs mt-1">
            {enrichedData.length} vendors
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for ComparisonChart
 */
export function ComparisonChartSkeleton({ 
  height = 400,
  className 
}: { 
  height?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      <div className="animate-pulse">
        <div className="flex gap-2 mb-4">
          <div className="h-8 w-24 bg-sp-midnight/50 rounded-md" />
          <div className="h-8 w-24 bg-sp-midnight/50 rounded-md" />
          <div className="h-8 w-24 bg-sp-midnight/50 rounded-md" />
        </div>
        <div 
          className="bg-sp-midnight/50 rounded-lg"
          style={{ height }}
        />
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="h-20 bg-sp-midnight/50 rounded-lg" />
          <div className="h-20 bg-sp-midnight/50 rounded-lg" />
          <div className="h-20 bg-sp-midnight/50 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state for ComparisonChart
 */
export function ComparisonChartEmpty({ 
  height = 400,
  className,
  message = 'No vendors to compare'
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