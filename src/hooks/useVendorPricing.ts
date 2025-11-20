import { useState, useEffect } from 'react';
import type { Plan, PriceFact } from '@/types/database';

interface UseVendorPricingResult {
  plans: Array<Plan & { prices: PriceFact[] }>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch vendor pricing plans via API
 */
export function useVendorPricing(vendorId: string | null): UseVendorPricingResult {
  const [plans, setPlans] = useState<Array<Plan & { prices: PriceFact[] }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setPlans([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/vendors/${vendorId}/plans`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch plans' }));
          throw new Error(errorData.error || 'Failed to fetch plans');
        }

        const data = await response.json();
        setPlans(data.plans || []);
      } catch (err) {
        console.error('Error fetching vendor plans:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pricing');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [vendorId]);

  return { plans, loading, error };
}

