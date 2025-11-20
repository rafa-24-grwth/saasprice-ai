// src/utils/pricing-helpers.ts
import { PriceFact, Plan } from '@/types/database';

/**
 * Helper utilities for working with pricing data
 * Provides consistent access to price fields with proper fallbacks
 */

/**
 * Get normalized price display data from a PriceFact
 * Handles field mapping and provides sensible defaults
 */
export function getPriceDisplayData(price: PriceFact) {
  return {
    basePrice: price.base_price || 0,
    perUnitPrice: price.unit_price || price.overage_price || 0,
    overagePrice: price.overage_price || price.unit_price || 0,
    includedUnits: price.included_units || 0,
    unitType: price.unit_type || 'seat',
    cadence: price.cadence,
    currency: price.currency_code || 'USD',
    confidence: price.confidence_score || 0,
    minimumCommitment: price.minimum_commitment || null,
  };
}

/**
 * Calculate total cost for a given number of seats/units
 */
export function calculateTotalCost(
  price: PriceFact,
  units: number,
  targetBillingPeriod?: 'monthly' | 'annual'
): number {
  const data = getPriceDisplayData(price);
  
  // Start with base price
  let totalCost = data.basePrice;
  
  // Add cost for additional units beyond included
  if (units > data.includedUnits) {
    const additionalUnits = units - data.includedUnits;
    totalCost += additionalUnits * data.perUnitPrice;
  }
  
  // Apply minimum commitment if applicable
  if (data.minimumCommitment && totalCost < data.minimumCommitment) {
    totalCost = data.minimumCommitment;
  }
  
  // Convert billing period if needed
  if (targetBillingPeriod) {
    totalCost = convertBillingPeriod(totalCost, price.cadence, targetBillingPeriod);
  }
  
  return totalCost;
}

/**
 * Convert price between billing periods
 */
export function convertBillingPeriod(
  amount: number,
  fromPeriod: string,
  toPeriod: 'monthly' | 'annual'
): number {
  const isFromAnnual = ['annual', 'yearly', 'year'].includes(fromPeriod.toLowerCase());
  const isFromMonthly = ['monthly', 'month'].includes(fromPeriod.toLowerCase());
  
  if (toPeriod === 'monthly' && isFromAnnual) {
    return amount / 12;
  }
  
  if (toPeriod === 'annual' && isFromMonthly) {
    return amount * 12;
  }
  
  return amount;
}

/**
 * Find the most suitable plan for a given number of seats
 * Uses tier-based heuristics since min/max seats don't exist in the schema
 */
export function findSuitablePlan(
  plans: Array<Plan & { prices: PriceFact[] }>,
  seatCount: number
): (Plan & { prices: PriceFact[] }) | null {
  if (!plans || plans.length === 0) return null;
  
  // Define tier mappings with typical seat ranges
  const tierMappings = [
    { tiers: ['starter', 'basic', 'free'], maxSeats: 10 },
    { tiers: ['team', 'growth', 'professional'], minSeats: 10, maxSeats: 50 },
    { tiers: ['business', 'scale'], minSeats: 50, maxSeats: 200 },
    { tiers: ['enterprise', 'custom'], minSeats: 200 },
  ];
  
  // Try to find a plan matching the seat count
  for (const mapping of tierMappings) {
    const minSeats = mapping.minSeats || 0;
    const maxSeats = mapping.maxSeats || Infinity;
    
    if (seatCount >= minSeats && seatCount <= maxSeats) {
      const matchingPlan = plans.find(plan => {
        const tierName = (plan.tier || plan.name || '').toLowerCase();
        return mapping.tiers.some(tier => tierName.includes(tier));
      });
      
      if (matchingPlan) return matchingPlan;
    }
  }
  
  // Fallback: return the plan with the closest tier level
  const sortedPlans = [...plans].sort((a, b) => {
    const tierOrder = ['starter', 'basic', 'team', 'growth', 'professional', 'business', 'scale', 'enterprise'];
    const getTierIndex = (plan: Plan) => {
      const tierName = (plan.tier || plan.name || '').toLowerCase();
      const index = tierOrder.findIndex(tier => tierName.includes(tier));
      return index === -1 ? tierOrder.length : index;
    };
    
    return getTierIndex(a) - getTierIndex(b);
  });
  
  // Return the highest tier plan for large seat counts
  if (seatCount > 100) {
    return sortedPlans[sortedPlans.length - 1];
  }
  
  // Return the first available plan as last resort
  return sortedPlans[0];
}

/**
 * Format confidence score as percentage
 */
export function formatConfidence(score: number | null): string {
  if (score === null || score === undefined) return 'Unknown';
  return `${Math.round(score * 100)}%`;
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(score: number | null): {
  label: string;
  color: string;
  description: string;
} {
  if (score === null || score === undefined) {
    return {
      label: 'Unknown',
      color: 'gray',
      description: 'No confidence data available',
    };
  }
  
  if (score >= 0.9) {
    return {
      label: 'Very High',
      color: 'green',
      description: 'Pricing data is highly reliable',
    };
  }
  
  if (score >= 0.7) {
    return {
      label: 'High',
      color: 'blue',
      description: 'Pricing data is reliable',
    };
  }
  
  if (score >= 0.5) {
    return {
      label: 'Medium',
      color: 'yellow',
      description: 'Pricing data may have some uncertainty',
    };
  }
  
  return {
    label: 'Low',
    color: 'red',
    description: 'Pricing data should be verified',
  };
}

/**
 * Build comparison key for caching/memoization
 */
export function buildComparisonKey(
  vendorIds: string[],
  seats: number,
  billingPeriod: 'monthly' | 'annual'
): string {
  return `${vendorIds.sort().join('-')}_${seats}_${billingPeriod}`;
}

/**
 * Check if a price is valid and has required data
 */
export function isPriceValid(price: PriceFact): boolean {
  return !!(
    price &&
    (price.base_price !== null || price.unit_price !== null) &&
    price.cadence
  );
}

/**
 * Get display-friendly unit type label
 */
export function getUnitTypeLabel(unitType: string | null, plural: boolean = false): string {
  const labels: Record<string, { singular: string; plural: string }> = {
    seat: { singular: 'seat', plural: 'seats' },
    user: { singular: 'user', plural: 'users' },
    license: { singular: 'license', plural: 'licenses' },
    member: { singular: 'member', plural: 'members' },
    agent: { singular: 'agent', plural: 'agents' },
    api_call: { singular: 'API call', plural: 'API calls' },
    gb: { singular: 'GB', plural: 'GB' },
    tb: { singular: 'TB', plural: 'TB' },
  };
  
  const key = (unitType || 'seat').toLowerCase();
  const label = labels[key] || { singular: unitType || 'unit', plural: `${unitType || 'unit'}s` };
  
  return plural ? label.plural : label.singular;
}