/**
 * Chart Utility Functions
 * Helper functions for data transformation and formatting
 */

import { 
  RangeDataPoint, 
  PriceStatistics,
  TrendDataPoint 
} from '@/types/charts';
import { PriceFact, Plan } from '@/types/pricing';
import { 
  getISOWeek, 
  getQuarter, 
  addDays, 
  addWeeks, 
  addMonths,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  format
} from 'date-fns';

/**
 * Helper function to convert price fact and plan to range data point
 */
export function priceFactToRangePoint(
  priceFact: PriceFact,
  plan: Plan
): RangeDataPoint {
  const basePrice = priceFact.base_price || 0;
  const uncertainty = 1 - priceFact.confidence_score;
  
  // Calculate min/max based on confidence
  const min = Math.max(0, basePrice * (1 - uncertainty * 0.2));
  const max = basePrice * (1 + uncertainty * 0.2);
  
  return {
    label: plan.name,
    min,
    max,
    typical: basePrice,
    confidence: priceFact.confidence_score,
    verified: priceFact.verification_level === 'API_VERIFIED',
    updatedAt: new Date(priceFact.observed_at)
  };
}

/**
 * Helper to calculate price statistics
 */
export function calculatePriceStats(prices: number[]): PriceStatistics {
  if (prices.length === 0) {
    return { min: 0, max: 0, confidence: 0 };
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  const variance = prices.reduce((acc, price) => 
    acc + Math.pow(price - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  
  // Confidence based on standard deviation relative to mean
  const relativeStdDev = mean > 0 ? stdDev / mean : 1;
  const confidence = Math.max(0, Math.min(1, 1 - relativeStdDev));
  
  return { min, max, median, mean, stdDev, confidence };
}

/**
 * Format price for display
 */
export function formatPrice(
  price: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format date for chart display
 */
export function formatChartDate(
  date: Date,
  period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'
): string {
  // Special handling for quarter
  if (period === 'quarter') {
    const quarter = getQuarter(date);
    return `Q${quarter} ${date.getFullYear()}`;
  }
  
  const formatMap = {
    day: { day: 'numeric' as const, month: 'short' as const },
    week: { day: 'numeric' as const, month: 'short' as const },
    month: { month: 'short' as const, year: 'numeric' as const },
    year: { year: 'numeric' as const }
  };
  
  const options = formatMap[period as keyof typeof formatMap];
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Generate mock trend data for testing
 */
export function generateMockTrendData(
  basePrice: number,
  months: number = 6
): TrendDataPoint[] {
  const points: TrendDataPoint[] = [];
  const now = new Date();
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Add some random variation
    const variation = (Math.random() - 0.5) * 0.1;
    const price = basePrice * (1 + variation);
    const confidence = 0.7 + Math.random() * 0.3;
    
    points.push({
      date,
      price,
      confidence,
      source: i === 0 ? 'API' : 'SCRAPER'
    });
  }
  
  return points;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Format percentage for display
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Get trend direction from percentage change
 */
export function getTrendDirection(change: number): 'up' | 'down' | 'stable' {
  if (Math.abs(change) < 1) return 'stable';
  return change > 0 ? 'up' : 'down';
}

/**
 * Interpolate missing data points in a time series
 */
export function interpolateTimeSeries(
  dataPoints: TrendDataPoint[],
  interval: 'day' | 'week' | 'month' = 'month'
): TrendDataPoint[] {
  if (dataPoints.length < 2) return dataPoints;

  const sorted = [...dataPoints].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );
  
  const result: TrendDataPoint[] = [];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    result.push(sorted[i]);
    
    const current = sorted[i];
    const next = sorted[i + 1];
    
    // Calculate the number of intervals between dates using date-fns
    let intervalsCount = 0;
    switch (interval) {
      case 'day':
        intervalsCount = differenceInDays(next.date, current.date) - 1;
        break;
      case 'week':
        intervalsCount = differenceInWeeks(next.date, current.date) - 1;
        break;
      case 'month':
        intervalsCount = differenceInMonths(next.date, current.date) - 1;
        break;
    }
    
    // Add interpolated points
    for (let j = 1; j <= intervalsCount; j++) {
      let interpolatedDate: Date;
      
      // Use date-fns for accurate date arithmetic
      switch (interval) {
        case 'day':
          interpolatedDate = addDays(current.date, j);
          break;
        case 'week':
          interpolatedDate = addWeeks(current.date, j);
          break;
        case 'month':
          interpolatedDate = addMonths(current.date, j);
          break;
      }
      
      // Linear interpolation for price and confidence
      const ratio = j / (intervalsCount + 1);
      const interpolatedPrice = current.price + 
        (next.price - current.price) * ratio;
      const interpolatedConfidence = current.confidence + 
        (next.confidence - current.confidence) * ratio;
      
      result.push({
        date: interpolatedDate,
        price: interpolatedPrice,
        confidence: interpolatedConfidence,
        source: 'INTERPOLATED'
      });
    }
  }
  
  result.push(sorted[sorted.length - 1]);
  return result;
}

/**
 * Group data points by time period
 */
export function groupByPeriod<T extends { date: Date }>(
  data: T[],
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  
  data.forEach(item => {
    const key = getPeriodKey(item.date, period);
    const existing = grouped.get(key) || [];
    grouped.set(key, [...existing, item]);
  });
  
  return grouped;
}

/**
 * Get period key for grouping
 */
function getPeriodKey(date: Date, period: string): string {
  switch (period) {
    case 'day':
      return format(date, 'yyyy-MM-dd');
    case 'week':
      const weekNum = getISOWeek(date);
      return `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
    case 'month':
      return format(date, 'yyyy-MM');
    case 'quarter':
      const quarter = getQuarter(date);
      return `${date.getFullYear()}-Q${quarter}`;
    case 'year':
      return date.getFullYear().toString();
    default:
      return format(date, 'yyyy-MM');
  }
}

/**
 * Get week number for a date (using date-fns for accuracy)
 */
function getWeekNumber(date: Date): number {
  return getISOWeek(date);
}