// src/utils/format.ts
import { formatDistanceToNow, format } from 'date-fns';

// Centralized constants for business rules
export const FRESHNESS_WARN_DAYS = 3;
export const FRESHNESS_STALE_DAYS = 7;

/**
 * Format a number as currency
 * @param value - The numeric value to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string or "Contact Sales" for null values
 */
export function formatCurrency(
  value: number | null | undefined, 
  currency: string = 'USD'
): string {
  if (value === null || value === undefined) {
    return 'Contact Sales';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: value < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param date - The date to format
 * @returns Formatted relative time string
 */
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a date as a standard date string
 * @param date - The date to format
 * @param formatStr - The format string (default: 'PPP' for "April 29, 2023")
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string, 
  formatStr: string = 'PPP'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a number with appropriate decimal places
 * @param value - The numeric value to format
 * @param decimals - Maximum decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  decimals: number = 2
): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Get freshness color class based on age in days
 * @param date - The date to check
 * @returns Tailwind color class
 */
export function getFreshnessColor(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  
  // Use centralized business logic constants
  if (diffInDays < FRESHNESS_WARN_DAYS) return 'text-green-600';  // Fresh
  if (diffInDays < FRESHNESS_STALE_DAYS) return 'text-yellow-600'; // Warning
  return 'text-red-600'; // Stale
}

/**
 * Convert annual price to monthly equivalent
 * @param annualPrice - Annual price
 * @returns Monthly equivalent
 */
export function annualToMonthly(annualPrice: number): number {
  return annualPrice / 12;
}

/**
 * Format confidence score as percentage
 * @param score - Confidence score (0-1)
 * @returns Formatted percentage string
 */
export function formatConfidence(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return 'Unknown';
  }
  return `${Math.round(score * 100)}%`;
}

/**
 * Check if pricing data is considered fresh
 * @param date - The date to check
 * @returns Boolean indicating if data is fresh
 */
export function isFresh(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays < FRESHNESS_WARN_DAYS;
}

/**
 * Check if pricing data is considered stale
 * @param date - The date to check
 * @returns Boolean indicating if data is stale
 */
export function isStale(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays >= FRESHNESS_STALE_DAYS;
}