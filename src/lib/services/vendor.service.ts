// src/lib/services/vendor.service.ts (CORRECTED VERSION)

import { createClient } from '@/lib/db/client';
import type { Vendor, Plan, PriceFact } from '@/types/database';

// Create a single supabase client instance
const supabase = createClient();

/**
 * Get all active vendors
 */
export async function getAllVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching vendors:', error);
    throw new Error('Failed to fetch vendors');
  }

  return data || [];
}

/**
 * Internal function to fetch vendor with pricing using either slug or id
 * Eliminates code duplication between the two public functions
 */
async function _fetchVendorWithPricing(
  column: 'slug' | 'id',
  value: string
): Promise<{
  vendor: Vendor;
  plans: Array<Plan & { prices: PriceFact[] }>;
} | null> {
  const { data, error } = await supabase
    .from('vendors')
    .select(`
      *,
      plans!inner (
        *,
        price_facts!inner (*)
      )
    `)
    .eq(column, value)
    .eq('is_active', true)
    .eq('plans.is_active', true)
    .single();

  if (error) {
    console.error(`Error fetching vendor with pricing for ${column} "${value}":`, error);
    // Handle "not found" gracefully
    if (error.code === 'PGRST116') {
      return null;
    }
    return null;
  }

  if (!data) {
    return null;
  }

  // Cast to any to handle the nested structure from Supabase
  const result = data as any;
  
  // Extract vendor data without plans - FIXED: Removed duplicate pricing_url
  const vendorData: Vendor = {
    id: result.id,
    slug: result.slug,
    name: result.name,
    category: result.category,
    pricing_url: result.pricing_url, // Only one instance
    logo_url: result.logo_url,
    priority: result.priority,
    api_endpoint: result.api_endpoint,
    scrape_hints: result.scrape_hints,
    scrape_priority: result.scrape_priority,
    scraping_config: result.scraping_config,
    scrape_frequency_hours: result.scrape_frequency_hours,
    is_active: result.is_active,
    is_quarantined: result.is_quarantined,
    quarantine_reason: result.quarantine_reason,
    quarantine_until: result.quarantine_until,
    last_scraped_at: result.last_scraped_at,
    last_scrape_status: result.last_scrape_status,
    last_success_at: result.last_success_at,
    last_failed_at: result.last_failed_at,
    last_successful_method: result.last_successful_method,
    consecutive_failures: result.consecutive_failures,
    created_at: result.created_at,
    updated_at: result.updated_at
  };

  // Format plans with their nested price_facts renamed to prices
  const formattedPlans = (result.plans || []).map((plan: any) => ({
    id: plan.id,
    vendor_id: plan.vendor_id,
    name: plan.name,
    slug: plan.slug,
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
 * Get vendor with all plans and current pricing by slug
 */
export async function getVendorWithPricing(slug: string): Promise<{
  vendor: Vendor;
  plans: Array<Plan & { prices: PriceFact[] }>;
} | null> {
  return _fetchVendorWithPricing('slug', slug);
}

/**
 * Get vendor with pricing by ID
 */
export async function getVendorWithPricingById(vendorId: string): Promise<{
  vendor: Vendor;
  plans: Array<Plan & { prices: PriceFact[] }>;
} | null> {
  return _fetchVendorWithPricing('id', vendorId);
}

/**
 * Get a single vendor by slug (kept for backward compatibility)
 */
export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  const result = await getVendorWithPricing(slug);
  return result?.vendor || null;
}

/**
 * Get plans for a vendor with current pricing
 * Now uses the optimized nested query
 */
export async function getPlanWithPricing(vendorId: string): Promise<Array<Plan & { prices: PriceFact[] }>> {
  const result = await getVendorWithPricingById(vendorId);
  return result?.plans || [];
}

/**
 * Get comparison data for two vendors
 * Makes only 2 optimized queries total
 */
export async function getComparisonData(
  vendorASlug: string,
  vendorBSlug: string
): Promise<{
  vendorA: { vendor: Vendor; plans: Array<Plan & { prices: PriceFact[] }> } | null;
  vendorB: { vendor: Vendor; plans: Array<Plan & { prices: PriceFact[] }> } | null;
}> {
  const [vendorAData, vendorBData] = await Promise.all([
    getVendorWithPricing(vendorASlug),
    getVendorWithPricing(vendorBSlug)
  ]);

  return {
    vendorA: vendorAData,
    vendorB: vendorBData
  };
}

/**
 * Search vendors by name or category
 * Added to support the vendors/search route
 */
export async function searchVendors(query: string): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(10);

  if (error) {
    console.error('Error searching vendors:', error);
    return [];
  }

  return data || [];
}