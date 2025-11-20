// src/components/compare/ComparisonResults.tsx
'use client';

import { useMemo } from 'react';
import { Vendor, Plan, PriceFact } from '@/types/database';
import { formatCurrency } from '@/utils/format';
import { NormalizationEngine } from '@/lib/normalization/engine';
import { EmailCaptureModal } from '@/components/shared/monetization/EmailCaptureModal';
import { useEmailCapture } from '@/hooks/useEmailCapture';
import { useVendorPricing } from '@/hooks/useVendorPricing';

interface ComparisonResultsProps {
  vendorA: Vendor;
  vendorB: Vendor;
  seats: number;
  billingPeriod: 'monthly' | 'annual';
}

interface VendorPricing {
  vendor: Vendor;
  plans: Array<Plan & { prices: PriceFact[] }>;
  loading: boolean;
  error: string | null;
}

// Reusable component for vendor cards to reduce duplication
function ComparisonCard({
  vendor,
  cost,
  plan,
  isLoading,
  isCheaper,
  seats,
  billingPeriod,
}: {
  vendor: Vendor;
  cost: number | null;
  plan?: Plan | null;
  isLoading: boolean;
  isCheaper: boolean;
  seats: number;
  billingPeriod: 'monthly' | 'annual';
}) {
  return (
    <div
      className={`bg-sp-surface-1 rounded-lg p-6 border-2 ${
        isCheaper ? 'border-sp-success/50' : 'border-sp-border'
      }`}
    >
      {isCheaper && (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-sp-success/20 text-sp-success text-xs font-semibold rounded-full mb-4">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Best Value
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        {vendor.logo_url && (
          <img src={vendor.logo_url} alt={`${vendor.name} logo`} className="w-10 h-10 object-contain" />
        )}
        <div>
          <h3 className="text-lg font-semibold text-sp-text-primary">
            {vendor.name}
          </h3>
          {vendor.category && (
            <span className="text-xs text-sp-text-muted">{vendor.category}</span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-9 w-32 bg-sp-surface-2 rounded mb-2"></div>
          <div className="h-4 w-24 bg-sp-surface-2 rounded"></div>
        </div>
      ) : cost !== null ? (
        <div>
          <div className="text-3xl font-bold text-sp-text-primary mb-1">
            {formatCurrency(cost)}
          </div>
          <div className="text-sm text-sp-text-secondary">
            per {billingPeriod} • {seats} seats
          </div>
        </div>
      ) : (
        <div className="text-sp-text-muted">Pricing not available</div>
      )}

      {plan && (
        <div className="mt-4 pt-4 border-t border-sp-border">
          <div className="text-xs text-sp-text-muted mb-2">Using plan:</div>
          <div className="text-sm text-sp-text-primary">{plan.name}</div>
        </div>
      )}
    </div>
  );
}

export default function ComparisonResults({
  vendorA,
  vendorB,
  seats,
  billingPeriod,
}: ComparisonResultsProps) {
  // Use custom hooks to fetch pricing data via API
  const { plans: plansA, loading: loadingA, error: errorA } = useVendorPricing(vendorA.id);
  const { plans: plansB, loading: loadingB, error: errorB } = useVendorPricing(vendorB.id);

  // Initialize email capture hook
  const {
    isModalOpen,
    openModal,
    closeModal,
    handleSubmit,
    isProcessing,
  } = useEmailCapture({
    vendorIds: [vendorA.id, vendorB.id],
    vendorNames: [vendorA.name, vendorB.name],
    seatCount: seats,
    billingPeriod,
    onSuccess: () => {
      // Could show a success toast here
      console.log('✅ Comparison report downloaded successfully!');
    },
    onError: (error, step) => {
      // Could show an error toast here
      console.error(`Error during ${step}:`, error);
    },
  });

  // Create pricing state objects from hook results
  const pricingA: VendorPricing = {
    vendor: vendorA,
    plans: plansA,
    loading: loadingA,
    error: errorA,
  };

  const pricingB: VendorPricing = {
    vendor: vendorB,
    plans: plansB,
    loading: loadingB,
    error: errorB,
  };

  // Use NormalizationEngine to calculate normalized costs
  const { costA, costB, planA, planB, savings, savingsPercent, cheaperVendor } =
    useMemo(() => {
      const engine = new NormalizationEngine();

      const findSuitablePlan = (plans: Array<Plan & { prices: PriceFact[] }>, seatCount: number) => {
        if (!plans || plans.length === 0) return null;
        
        // Since min_seats and max_seats don't exist in the Plan type,
        // we'll use tier-based logic or just return the first available plan
        // You may want to add custom logic here based on plan names or tiers
        
        // Check for tier-based selection (e.g., "Starter", "Growth", "Enterprise")
        const tierOrder = ['starter', 'basic', 'team', 'growth', 'business', 'enterprise'];
        
        // Try to find appropriate plan based on tier and seat count
        let suitablePlan = plans.find(plan => {
          const tierName = (plan.tier || plan.name || '').toLowerCase();
          
          // Simple heuristic: starter/basic for <10, team/growth for 10-50, enterprise for >50
          if (seatCount < 10 && (tierName.includes('starter') || tierName.includes('basic'))) {
            return true;
          }
          if (seatCount >= 10 && seatCount < 50 && (tierName.includes('team') || tierName.includes('growth'))) {
            return true;
          }
          if (seatCount >= 50 && (tierName.includes('enterprise') || tierName.includes('business'))) {
            return true;
          }
          return false;
        });
        
        // If no suitable plan found, return the first one
        return suitablePlan || plans[0];
      };

      const calculateVendorCost = (vendorPricing: VendorPricing): { cost: number | null; plan: Plan | null } => {
        if (vendorPricing.loading || vendorPricing.error || !vendorPricing.plans.length) {
          return { cost: null, plan: null };
        }

        const plan = findSuitablePlan(vendorPricing.plans, seats);
        if (!plan || !plan.prices || plan.prices.length === 0) {
          return { cost: null, plan: null };
        }

        const price = plan.prices.find(p => p.cadence === billingPeriod) || plan.prices[0];
        if (!price) {
          return { cost: null, plan: null };
        }
        
        // Create base plan without non-existent fields
        const basePlan: Plan = {
          id: plan.id,
          vendor_id: plan.vendor_id,
          name: plan.name,
          slug: plan.slug,
          tier: plan.tier,
          is_active: plan.is_active,
          created_at: plan.created_at,
          updated_at: plan.updated_at,
        };

        // Build raw data for normalization using correct field names
        const rawData = {
          base_price: price.base_price,
          included_units: price.included_units || 0,  // Use included_units instead of included_seats
          overage_price: price.overage_price || price.unit_price,  // Use overage_price or unit_price
          unit_price: price.unit_price,  // Add unit_price
          cadence: price.cadence,
          unit_type: price.unit_type || 'seat',
        };
        
        const evidence = {
          parse_method: 'selector' as const,
        };

        try {
          const spec = engine.normalize(rawData, evidence as any, seats, billingPeriod);
          let normalizedCost: number | null = spec.normalizedValue;

          // Adjust for billing period if necessary
          if (normalizedCost !== null && billingPeriod === 'monthly' && price.cadence === 'yearly') {
            normalizedCost = normalizedCost / 12;
          } else if (normalizedCost !== null && billingPeriod === 'annual' && price.cadence === 'monthly') {
            normalizedCost = normalizedCost * 12;
          }

          return { cost: normalizedCost, plan: basePlan };
        } catch (error) {
          console.error('Normalization error:', error);
          
          // Fallback to simple calculation with correct field names
          let simpleCost = price.base_price || 0;
          const includedUnits = price.included_units || 0;
          
          // Calculate overage if seats exceed included units
          if (seats > includedUnits) {
            const additionalSeats = seats - includedUnits;
            const perUnitPrice = price.unit_price || price.overage_price || 0;
            simpleCost += additionalSeats * perUnitPrice;
          }
          
          // Adjust for billing period
          if (billingPeriod === 'monthly' && price.cadence === 'yearly') {
            simpleCost = simpleCost / 12;
          } else if (billingPeriod === 'annual' && price.cadence === 'monthly') {
            simpleCost = simpleCost * 12;
          }
          
          return { cost: simpleCost, plan: basePlan };
        }
      };

      const resultA = calculateVendorCost(pricingA);
      const resultB = calculateVendorCost(pricingB);

      const costA = resultA.cost;
      const costB = resultB.cost;
      const savings = costA !== null && costB !== null ? Math.abs(costA - costB) : null;
      const savingsPercent = costA !== null && costB !== null && Math.min(costA, costB) > 0
          ? (savings! / Math.max(costA, costB)) * 100
          : null;
      const cheaperVendor = costA !== null && costB !== null
          ? (costA < costB ? vendorA : vendorB)
          : null;

      return { costA, costB, planA: resultA.plan, planB: resultB.plan, savings, savingsPercent, cheaperVendor };
    }, [pricingA, pricingB, seats, billingPeriod, vendorA, vendorB]);

  const isLoading = pricingA.loading || pricingB.loading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-sp-text-secondary">Loading pricing data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Box */}
      {cheaperVendor && savings !== null && (
        <div className="bg-sp-success/10 border border-sp-success/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-6 h-6 text-sp-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-sp-text-primary">
              {cheaperVendor.name} is cheaper
            </h2>
          </div>
          <p className="text-sp-text-primary text-lg">
            Save <strong>{formatCurrency(savings)}</strong> per {billingPeriod === 'annual' ? 'year' : 'month'}
            {savingsPercent !== null && (
              <span className="text-sp-text-secondary ml-2">
                ({savingsPercent.toFixed(0)}% savings)
              </span>
            )}
          </p>
        </div>
      )}

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ComparisonCard
          vendor={vendorA}
          cost={costA}
          plan={planA}
          isLoading={pricingA.loading}
          isCheaper={cheaperVendor?.id === vendorA.id}
          seats={seats}
          billingPeriod={billingPeriod}
        />
        <ComparisonCard
          vendor={vendorB}
          cost={costB}
          plan={planB}
          isLoading={pricingB.loading}
          isCheaper={cheaperVendor?.id === vendorB.id}
          seats={seats}
          billingPeriod={billingPeriod}
        />
      </div>

      {/* Export section with enhanced UI */}
      <div className="bg-sp-surface-1 rounded-lg p-6 border border-sp-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-sp-text-primary">
              Export Comparison Report
            </h3>
            <p className="mt-1 text-sm text-sp-text-secondary">
              Download a detailed CSV report of this pricing comparison
            </p>
          </div>
          
          <button
            onClick={openModal}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-sp-accent hover:bg-sp-accent-hover text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sp-accent focus:ring-offset-2 focus:ring-offset-sp-surface-0"
          >
            Export to CSV
          </button>
        </div>

        {/* Additional options */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <button
            onClick={() => window.print()}
            className="text-sp-text-secondary hover:text-sp-text-primary transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
          
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={() => {
                navigator.share({
                  title: `SaaSPrice Comparison: ${vendorA.name} vs ${vendorB.name}`,
                  text: `Compare pricing for ${seats} seats`,
                  url: window.location.href,
                });
              }}
              className="text-sp-text-secondary hover:text-sp-text-primary transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.024A9.663 9.663 0 0112 21c-2.29 0-4.393-.794-6.032-2.118m12.064 0a9.664 9.664 0 00.018-6.764m-.018 6.764A9.66 9.66 0 0118 12a9.66 9.66 0 00-.032-1.118m0 0A9.664 9.664 0 0012 3c-2.29 0-4.393.794-6.032 2.118" />
              </svg>
              Share Link
            </button>
          )}
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-xs text-sp-text-muted border-t border-sp-border pt-4">
          * Based on public list pricing. Enterprise discounts not included. Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        seatCount={seats}
        vendorNames={[vendorA.name, vendorB.name]}
      />
    </div>
  );
}