import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { ComparisonResponse, ComparisonData } from '@/types/comparison';
import type { CompareVendorsOptions } from '@/types/api.types';
import { ComparisonTypes } from '@/types/domain.types';

export class ComparisonService {
  private supabase: any; // Fixed: Added 'any' type to handle both client types

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Compare multiple vendors with their plans, prices, and features
   */
  async compareVendors(
    vendorIds: string[],
    options: CompareVendorsOptions = {},
    supabaseClient?: SupabaseClient<Database>
  ): Promise<ComparisonResponse> {
    const client = supabaseClient || this.supabase;
    const { planTiers = [], featureCategories = [] } = options;

    // Fetch vendor data
    const { data: vendors, error: vendorError } = await client
      .from('vendors')
      .select('*')
      .in('id', vendorIds);

    if (vendorError) {
      console.error('Error fetching vendors:', vendorError);
      throw new Error('Failed to fetch vendor data');
    }

    if (!vendors || vendors.length === 0) {
      throw new Error('No vendors found with provided IDs');
    }

    // Fetch plans for all vendors
    let plansQuery = client
      .from('plans')
      .select('*')
      .in('vendor_id', vendorIds)
      .eq('is_active', true);

    if (planTiers.length > 0) {
      plansQuery = plansQuery.in('tier', planTiers);
    }

    const { data: plans, error: plansError } = await plansQuery;

    if (plansError) {
      console.error('Error fetching plans:', plansError);
      throw new Error('Failed to fetch plan data');
    }

    const planIds = plans?.map((p: ComparisonTypes.PlanData) => p.id) || []; // Fixed: Added namespace

    // Fetch prices for all plans
    const { data: prices, error: pricesError } = await client
      .from('price_facts')
      .select('*')
      .in('plan_id', planIds)
      .order('effective_date', { ascending: false });

    if (pricesError) {
      console.error('Error fetching prices:', pricesError);
      throw new Error('Failed to fetch price data');
    }

    // Fetch features for all plans
    let featuresQuery = client
      .from('plan_features')
      .select('*')
      .in('plan_id', planIds);

    if (featureCategories.length > 0) {
      featuresQuery = featuresQuery.in('category', featureCategories);
    }

    const { data: features, error: featuresError } = await featuresQuery;

    if (featuresError) {
      console.error('Error fetching features:', featuresError);
      throw new Error('Failed to fetch feature data');
    }

    // Group prices by plan_id and get the most recent price for each
    const latestPrices = (prices as ComparisonTypes.PriceData[])?.reduce((acc: Record<string, ComparisonTypes.PriceData>, price: ComparisonTypes.PriceData) => {
      if (!acc[price.plan_id] || 
          new Date(price.effective_date) > new Date(acc[price.plan_id].effective_date)) {
        acc[price.plan_id] = price;
      }
      return acc;
    }, {} as Record<string, ComparisonTypes.PriceData>);

    // Calculate normalized monthly prices
    const pricesWithNormalized = Object.values(latestPrices || {}).map((price: ComparisonTypes.PriceData) => {
      const normalizedMonthlyPrice = this.normalizePrice(price.base_price, price.cadence);

      return {
        ...price,
        normalized_monthly_price: normalizedMonthlyPrice
      };
    });

    // Build comparison data for each vendor
    const comparisons: ComparisonData[] = (vendors as ComparisonTypes.VendorData[]).map((vendor: ComparisonTypes.VendorData) => {
      const vendorPlans = (plans as ComparisonTypes.PlanData[])?.filter((p: ComparisonTypes.PlanData) => p.vendor_id === vendor.id) || [];
      const vendorPlanIds = vendorPlans.map((p: ComparisonTypes.PlanData) => p.id);
      const vendorPrices = pricesWithNormalized.filter((p) => vendorPlanIds.includes(p.plan_id));
      const vendorFeatures = (features as ComparisonTypes.FeatureData[])?.filter((f: ComparisonTypes.FeatureData) => vendorPlanIds.includes(f.plan_id)) || [];

      return {
        vendor,
        plans: vendorPlans,
        prices: vendorPrices,
        features: vendorFeatures
      };
    });

    // Generate metadata
    const metadata = this.generateMetadata(pricesWithNormalized, features as ComparisonTypes.FeatureData[], vendors.length); // Fixed: Added namespace

    return {
      comparisons,
      metadata
    };
  }

  /**
   * Create a shareable comparison link
   */
  async createShareLink(
    vendorIds: string[],
    expiresInDays: number = 30,
    userId?: string
  ): Promise<{ id: string; url: string; expires_at: string }> {
    const { nanoid } = await import('nanoid');
    const shareToken = nanoid(12);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    const { data, error } = await this.supabase
      .from('comparison_shares')
      .insert({
        share_token: shareToken,
        comparison_id: vendorIds.join(','),
        created_by: userId || null,
        expires_at: expiresAt.toISOString(),
        view_count: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: shareToken,
      url: `/compare/shared/${shareToken}`,
      expires_at: data.expires_at
    };
  }

  /**
   * Get shared comparison data
   */
  async getSharedComparison(shareToken: string): Promise<{
    vendor_ids: string[];
    expires_at: string | null;
    view_count: number;
  }> {
    const { data, error } = await this.supabase
      .from('comparison_shares')
      .select('*')
      .eq('share_token', shareToken)
      .single();
    
    if (error) throw error;
    
    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      throw new Error('Share link has expired');
    }
    
    // Increment view count
    await this.supabase
      .from('comparison_shares')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id);
    
    return {
      vendor_ids: data.comparison_id?.split(',') || [],
      expires_at: data.expires_at,
      view_count: data.view_count || 0
    };
  }

  /**
   * Normalize price to monthly based on billing period
   */
  private normalizePrice(price: number | null, period: string): number | null {
    if (price === null) return null;

    switch (period) {
      case 'monthly':
        return price;
      case 'yearly':
        return price / 12;
      case 'one-time':
        // Assume 24-month amortization for one-time fees
        return price / 24;
      default:
        return price;
    }
  }

  /**
   * Generate comparison metadata
   */
  private generateMetadata(
    pricesWithNormalized: Array<ComparisonTypes.PriceData & { normalized_monthly_price: number | null }>,
    features: ComparisonTypes.FeatureData[], // Fixed: Added namespace
    totalVendors: number
  ) {
    const allPrices = pricesWithNormalized
      .map((p) => p.normalized_monthly_price)
      .filter((p): p is number => p !== null);
    
    const priceRange = {
      min: allPrices.length > 0 ? Math.min(...allPrices) : null,
      max: allPrices.length > 0 ? Math.max(...allPrices) : null,
      currency: 'USD'
    };

    const uniqueCategories = Array.from(
      new Set(features?.map((f: ComparisonTypes.FeatureData) => f.category).filter(Boolean) || [])
    ) as string[];

    return {
      generated_at: new Date().toISOString(),
      total_vendors: totalVendors,
      feature_categories: uniqueCategories,
      price_range: priceRange
    };
  }
}

export const comparisonService = new ComparisonService();