// src/app/api/vendors/filters/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

type Vendor = Database['public']['Tables']['vendors']['Row'];
type PriceFact = Database['public']['Tables']['price_facts']['Row'];
type Feature = Database['public']['Tables']['features']['Row'];

export async function GET() {
  try {
    const cookieStore = cookies();
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

    // Get unique categories from vendors - explicitly type the result
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null)
      .returns<Pick<Vendor, 'category'>[]>();

    if (vendorsError) throw vendorsError;

    // Extract unique categories
    const categories = Array.from(new Set(
      (vendors || [])
        .map(v => v.category)
        .filter((cat): cat is string => cat !== null && cat !== undefined)
    ));

    // Get price range from price_facts - explicitly type the result
    const { data: priceData, error: priceError } = await supabase
      .from('price_facts')
      .select('base_price')
      .not('base_price', 'is', null)
      .order('base_price', { ascending: true })
      .returns<Pick<PriceFact, 'base_price'>[]>();

    if (priceError) throw priceError;

    const prices = (priceData || [])
      .map(p => p.base_price)
      .filter((price): price is number => price !== null && price !== undefined);
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

    // Get unique features from features table - explicitly type the result
    const { data: features, error: featuresError } = await supabase
      .from('features')
      .select('feature')
      .limit(50)
      .returns<Pick<Feature, 'feature'>[]>();

    if (featuresError) throw featuresError;

    const uniqueFeatures = Array.from(new Set(
      (features || [])
        .map(f => f.feature)
        .filter((feat): feat is string => feat !== null && feat !== undefined)
    ));

    // Return filter options for the frontend
    return NextResponse.json({
      categories: categories.sort(),
      features: uniqueFeatures.sort(),
      vendorSizes: [
        { value: 'startup', label: 'Startup (1-50 employees)' },
        { value: 'smb', label: 'SMB (51-500 employees)' },
        { value: 'enterprise', label: 'Enterprise (500+ employees)' }
      ],
      integrations: [], // You can populate this from your data if needed
      priceRange: { 
        min: Math.floor(minPrice), 
        max: Math.ceil(maxPrice) 
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}