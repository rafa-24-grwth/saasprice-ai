// src/app/api/vendors/search/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Import the actual types from database
import type { Vendor, Plan, PriceFact } from '@/types/database';

interface SearchFilters {
  query?: string;
  categories?: string[];
  priceRange?: { min: number | null; max: number | null };
  features?: string[];
  confidence?: number;
  billingPeriod?: string;
  vendorSize?: string[];
  integrations?: string[];
  sortBy?: string;
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const filters: SearchFilters = await request.json();
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Build query
    let vendorsQuery = supabase.from('vendors').select('*');
    
    // Add is_active filter
    vendorsQuery = vendorsQuery.eq('is_active', true);

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      vendorsQuery = vendorsQuery.in('category', filters.categories);
    }

    // Apply text search
    if (filters.query) {
      vendorsQuery = vendorsQuery.or(`name.ilike.%${filters.query}%,category.ilike.%${filters.query}%`);
    }

    // Execute vendors query with explicit type
    const { data: vendorsData, error: vendorsError } = await vendorsQuery.order('name');
    
    if (vendorsError) throw vendorsError;

    // Explicitly type the vendors array
    const vendors: Vendor[] = vendorsData || [];
    
    // Get vendor IDs
    const vendorIds = vendors.map(v => v.id);
    
    // Initialize processed vendors array
    let processedVendors: any[] = [];
    
    if (vendorIds.length > 0) {
      // Get plans for vendors with explicit type
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .in('vendor_id', vendorIds);

      if (plansError) throw plansError;
      
      const plans: Plan[] = plansData || [];
      const planIds = plans.map(p => p.id);
      
      // Initialize price data
      let priceData: PriceFact[] = [];
      
      if (planIds.length > 0) {
        // Get price facts with explicit type
        const { data: pricesData, error: pricesError } = await supabase
          .from('price_facts')
          .select('*')
          .in('plan_id', planIds)
          .order('created_at', { ascending: false });
        
        if (pricesError) throw pricesError;
        priceData = pricesData || [];
      }

      // Process vendors with pricing info
      processedVendors = vendors.map(vendor => {
        // Filter plans for this vendor
        const vendorPlans = plans.filter(p => p.vendor_id === vendor.id);
        
        // Get all prices for vendor's plans
        const vendorPrices = vendorPlans.flatMap(plan => 
          priceData.filter(price => price.plan_id === plan.id)
        );
        
        // Calculate lowest price
        let lowestPrice: number | null = null;
        const validPrices = vendorPrices
          .map(p => p.base_price)
          .filter((price): price is number => price !== null && price !== undefined);
        
        if (validPrices.length > 0) {
          lowestPrice = Math.min(...validPrices);
        }
        
        // Calculate highest confidence
        let highestConfidence = 0;
        const validConfidences = vendorPrices
          .map(p => p.confidence_score)
          .filter((conf): conf is number => conf !== null && conf !== undefined);
        
        if (validConfidences.length > 0) {
          highestConfidence = Math.max(...validConfidences);
        }
        
        // Get last updated date
        const lastUpdated = vendorPrices.length > 0 && vendorPrices[0].created_at
          ? vendorPrices[0].created_at
          : vendor.updated_at;

        return {
          id: vendor.id,
          name: vendor.name,
          logo_url: vendor.logo_url,
          category: vendor.category,
          starting_price: lowestPrice,
          currency: 'USD',
          confidence_score: highestConfidence,
          last_updated: lastUpdated,
          plan_count: vendorPlans.length,
          is_verified: highestConfidence >= 80,
          features: [] as string[],
          integrations: [] as string[]
        };
      });

      // Apply price range filter if specified
      if (filters.priceRange && (filters.priceRange.min !== null || filters.priceRange.max !== null)) {
        processedVendors = processedVendors.filter(v => {
          if (v.starting_price === null) return false;
          
          const min = filters.priceRange?.min;
          const max = filters.priceRange?.max;
          
          if (min !== null && min !== undefined && v.starting_price < min) return false;
          if (max !== null && max !== undefined && v.starting_price > max) return false;
          
          return true;
        });
      }

   // Apply confidence filter if specified
    if (typeof filters.confidence === 'number' && filters.confidence > 0) {
        const minConfidence = filters.confidence; // Store it in a const
            processedVendors = processedVendors.filter(v => 
                v.confidence_score >= minConfidence  // Use the const instead
            );
         }
      // No vendors found, return empty array
      processedVendors = [];
    }

    return NextResponse.json({
      vendors: processedVendors,
      total: processedVendors.length
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}