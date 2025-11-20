/**
 * Chart Types for SaaSPrice.AI
 * Defines data structures for all visualization components
 */

import { PriceFact, Plan } from './pricing';

/**
 * Data point for range charts showing price uncertainty
 */
export interface RangeDataPoint {
  label: string;
  min: number;
  max: number;
  typical?: number;
  confidence: number; // 0-1 ratio
  verified: boolean;
  updatedAt: Date;
}

/**
 * Configuration for RangeChart component
 */
export interface RangeChartProps {
  data: RangeDataPoint[];
  height?: number;
  showConfidence?: boolean;
  showVerification?: boolean;
  currency?: string;
  className?: string;
}

/**
 * Data structure for comparison charts
 */
export interface ComparisonDataSet {
  vendorName: string;
  vendorLogo?: string;
  tiers: {
    name: string;
    price: number;
    confidence: number;
    features?: string[];
  }[];
  verified: boolean;
  lastUpdated: Date;
}

/**
 * Configuration for ComparisonChart component
 */
export interface ComparisonChartProps {
  datasets: ComparisonDataSet[];
  selectedTier?: string;
  height?: number;
  showFeatures?: boolean;
  currency?: string;
  className?: string;
  onVendorClick?: (vendorName: string) => void;
}

/**
 * Time series data point for trend charts
 */
export interface TrendDataPoint {
  date: Date;
  price: number;
  confidence: number;
  source?: string;
}

/**
 * Data structure for trend charts
 */
export interface TrendDataSet {
  vendorName: string;
  tier: string;
  dataPoints: TrendDataPoint[];
}

/**
 * Configuration for TrendChart component
 */
export interface TrendChartProps {
  datasets: TrendDataSet[];
  height?: number;
  period?: 'week' | 'month' | 'quarter' | 'year';
  showConfidence?: boolean;
  currency?: string;
  className?: string;
}

/**
 * Shared chart configuration
 */
export interface ChartConfig {
  theme?: 'light' | 'dark';
  animate?: boolean;
  responsive?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    warning?: string;
    error?: string;
  };
}

/**
 * Utility type for chart dimensions
 */
export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Event handlers for interactive charts
 */
export interface ChartInteractions {
  onDataPointClick?: (data: any) => void;
  onDataPointHover?: (data: any) => void;
  onLegendClick?: (label: string) => void;
  onZoom?: (range: { start: Date; end: Date }) => void;
}

/**
 * Format utilities for chart labels
 */
export interface ChartFormatters {
  priceFormatter?: (value: number) => string;
  dateFormatter?: (date: Date) => string;
  percentFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
}

/**
 * Chart export options
 */
export interface ChartExportOptions {
  format: 'png' | 'svg' | 'pdf';
  filename?: string;
  quality?: number;
  background?: string;
}

/**
 * Aggregation functions for data processing
 */
export type AggregationFunction = 'min' | 'max' | 'avg' | 'median' | 'sum';

/**
 * Statistical analysis of price data
 */
export interface PriceStatistics {
  min: number;
  max: number;
  median?: number;
  mean?: number;
  stdDev?: number;
  confidence: number;
}

// Note: All utility functions have been moved to @/utils/charts
// This file now contains only type definitions