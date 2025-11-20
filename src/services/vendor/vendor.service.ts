import { createClient } from '@/lib/supabase/client';
import type { VendorListResponse } from '@/types/api.types';

export class VendorService {
  private supabase: any; // Using 'any' to bypass type issues

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get vendor with pricing by ID
   */
  async getVendorWithPricingById(
    vendorId: string,
    supabaseClient?: any
  ): Promise<{
    vendor: {
      id: string;
      name: string;
      logo_url: string | null;
      website: string | null;
      category: string | null;
      description: string | null;
      updated_at: string;
    };
    plans: Array<{
      id: string;
      vendor_id: string;
      name: string;
      tier: string | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      prices: Array<{
        id: string;
        plan_id: string;
        base_price: number | null;
        currency_code: string;
        cadence: string;
        confidence_score: number;
        created_at: string;
        included_units?: number | null;
        unit_price?: number | null;
        overage_price?: number | null;
        unit_type?: string | null;
      }>;
    }>;
  } | null> {
    const client = supabaseClient || this.supabase;

    const { data, error } = await client
      .from('vendors')
      .select(`
        id,
        name,
        logo_url,
        website,
        category,
        description,
        updated_at,
        plans!inner (
          id,
          vendor_id,
          name,
          tier,
          is_active,
          created_at,
          updated_at,
          price_facts!inner (
            id,
            plan_id,
            base_price,
            currency_code,
            cadence,
            confidence_score,
            created_at,
            included_units,
            unit_price,
            overage_price,
            unit_type
          )
        )
      `)
      .eq('id', vendorId)
      .eq('is_active', true)
      .eq('plans.is_active', true)
      .single();

    if (error) {
      console.error('Error fetching vendor with pricing:', error);
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error('Failed to fetch vendor data');
    }

    if (!data) {
      return null;
    }

    const result = data as any;

    const vendorData = {
      id: result.id,
      name: result.name,
      logo_url: result.logo_url,
      website: result.website,
      category: result.category,
      description: result.description,
      updated_at: result.updated_at,
    };

    const formattedPlans = (result.plans || []).map((plan: any) => ({
      id: plan.id,
      vendor_id: plan.vendor_id,
      name: plan.name,
      tier: plan.tier,
      is_active: plan.is_active,
      created_at: plan.created_at,
      updated_at: plan.updated_at,
      prices: plan.price_facts || []
    }));

    return {
      vendor: vendorData,
      plans: formattedPlans
    };
  }

  /**
   * Get all vendors with pricing info and calculated fields
   * Accepts optional supabase client for server-side routes with authentication
   */
  async getVendorsList(
    supabaseClient?: any
  ): Promise<VendorListResponse> {
    const client = supabaseClient || this.supabase;

    // Fetch vendors with their latest pricing info
    const { data: vendors, error } = await client
      .from('vendors')
      .select(`
        id,
        name,
        logo_url,
        website,
        category,
        description,
        created_at,
        updated_at,
        is_active,
        price_facts (
          id,
          base_price,
          currency_code,
          confidence_score,
          created_at
        ),
        plans (
          id,
          name,
          tier
        )
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching vendors:', error);
      throw new Error('Failed to fetch vendors');
    }

    // Process vendors to include calculated fields with explicit types
    const processedVendors = vendors?.map((vendor: any) => {
      // Get the lowest price from price_facts
      const prices = vendor.price_facts || [];
      const lowestPrice = prices.length > 0
        ? Math.min(...prices.filter((p: any) => p.base_price).map((p: any) => p.base_price))
        : null;
      
      // Get the highest confidence score
      const highestConfidence = prices.length > 0
        ? Math.max(...prices.filter((p: any) => p.confidence_score).map((p: any) => p.confidence_score))
        : 0;

      // Get the most recent update
      const lastUpdated = prices.length > 0
        ? prices.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : vendor.updated_at;

      return {
        id: vendor.id,
        name: vendor.name,
        logo_url: vendor.logo_url,
        website: vendor.website,
        category: vendor.category,
        description: vendor.description,
        starting_price: lowestPrice,
        currency: 'USD',
        confidence_score: highestConfidence,
        last_updated: lastUpdated,
        plan_count: vendor.plans?.length || 0,
        is_verified: highestConfidence >= 80
      };
    }) || [];

    return {
      vendors: processedVendors,
      total: processedVendors.length
    };
  }
}

export const vendorService = new VendorService();