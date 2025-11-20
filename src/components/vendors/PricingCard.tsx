// src/components/pricing/PricingCard.tsx
'use client';

import { formatCurrency, formatTimeAgo } from '@/utils/format';
import type { Database } from '@/types/database';

type Plan = Database['public']['Tables']['plans']['Row'];
type PriceFact = Database['public']['Tables']['price_facts']['Row'];

interface PricingCardProps {
  plan: {
    plan: Plan;
    prices: PriceFact[];
  };
}

export function PricingCard({ plan }: PricingCardProps) {
  // Find monthly and annual prices from the price facts
  const monthlyPrice = plan.prices.find(p => p.cadence === 'monthly');
  const annualPrice = plan.prices.find(p => p.cadence === 'annual');
  
  // Use the pre-calculated normalized_value from the database
  const normalizedValue = monthlyPrice?.normalized_value || annualPrice?.normalized_value;
  
  // Get display price (prefer monthly, fallback to annual/12)
  const displayPrice = monthlyPrice?.base_price ?? 
    (annualPrice?.base_price ? annualPrice.base_price / 12 : null);
  
  // Determine the unit type consistently
  const displayUnit = monthlyPrice?.unit_type ?? annualPrice?.unit_type ?? 'seat';
  
  // Get the most recent observation date
  const lastUpdated = plan.prices[0]?.observed_at;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="px-6 py-8 flex-1">
        {/* Plan Name */}
        <h3 className="text-2xl font-semibold text-gray-900">
          {plan.plan.name}
        </h3>
        
        {/* Main Price Display */}
        <div className="mt-4">
          <span className="text-4xl font-extrabold text-gray-900">
            {formatCurrency(displayPrice)}
          </span>
          {displayPrice !== null && (
            <span className="text-base font-medium text-gray-500">
              /month per {displayUnit}
            </span>
          )}
        </div>

        {/* Price Details */}
        <div className="mt-6 space-y-4">
          {monthlyPrice && (
            <PriceDetail 
              label="Monthly billing"
              price={monthlyPrice.base_price}
              period="mo"
            />
          )}
          
          {annualPrice && (
            <PriceDetail 
              label="Annual billing"
              price={annualPrice.base_price}
              period="yr"
              monthlyEquivalent={annualPrice.base_price ? annualPrice.base_price / 12 : null}
            />
          )}

          {/* Normalized Price - Uses pre-calculated value from database */}
          {normalizedValue !== null && (
            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <div>
                  <span className="text-sm text-gray-600">
                    For {monthlyPrice?.target_units || 10} {monthlyPrice?.unit_type || 'seats'}/month
                  </span>
                  {monthlyPrice?.confidence_score && (
                    <span className="block text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(monthlyPrice.confidence_score * 100)}%
                    </span>
                  )}
                </div>
                <span className="font-semibold text-lg text-gray-900">
                  {formatCurrency(normalizedValue)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        {lastUpdated && (
          <div className="mt-6 pt-4 border-t text-xs text-gray-500">
            Last updated: {formatTimeAgo(new Date(lastUpdated))}
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="px-6 pb-8">
        <button 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => {
            // TODO: Implement comparison logic
            console.log('Compare plan:', plan.plan.id);
          }}
        >
          Compare This Plan
        </button>
      </div>
    </div>
  );
}

// Helper component for price details
function PriceDetail({ 
  label, 
  price, 
  period, 
  monthlyEquivalent 
}: { 
  label: string;
  price: number | null;
  period: string;
  monthlyEquivalent?: number | null;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900">
        {formatCurrency(price)}/{period}
        {monthlyEquivalent !== undefined && monthlyEquivalent !== null && (
          <span className="text-gray-500 ml-1">
            ({formatCurrency(monthlyEquivalent)}/mo)
          </span>
        )}
      </span>
    </div>
  );
}