import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
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

    // Get search filters from request body
    const filters = await request.json();
    const {
      query,
      categories,
      priceRange,
      features,
      confidence,
      billingPeriod,
      vendorSize,
      integrations,
      sortBy
    } = filters;

    // Start building the query
    let vendorQuery = supabase
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
          cadence,
          created_at
        ),
        plans (
          id,
          name,
          tier
        )
      `)
      .eq('is_active', true);

    // Apply category filter
    if (categories && categories.length > 0) {
      vendorQuery = vendorQuery.in('category', categories);
    }

    // Apply text search
    if (query) {
      vendorQuery = vendorQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Fetch vendors
    const { data: vendors, error } = await vendorQuery;

    if (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vendors' },
        { status: 500 }
      );
    }

    // Process and filter vendors in memory for complex filters
    let processedVendors = vendors?.map(vendor => {
      // Get the lowest price from price_facts
      const prices = vendor.price_facts || [];
      
      // Filter by billing period if specified
      const relevantPrices = billingPeriod === 'both' 
        ? prices 
        : prices.filter(p => {
            const cadence = p.cadence || 'monthly';
            return billingPeriod === 'monthly' 
              ? cadence === 'monthly' 
              : cadence === 'annual';
          });

      const lowestPrice = relevantPrices.length > 0
        ? Math.min(...relevantPrices.filter(p => p.base_price).map(p => p.base_price))
        : null;
      
      // Get the highest confidence score
      const highestConfidence = relevantPrices.length > 0
        ? Math.max(...relevantPrices.filter(p => p.confidence_score).map(p => p.confidence_score))
        : 0;

      // Get the most recent update
      const lastUpdated = relevantPrices.length > 0
        ? relevantPrices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
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
        is_verified: highestConfidence >= 80,
        // These would need to be fetched from additional tables
        features: [],
        integrations: []
      };
    }) || [];

    // Apply price range filter
    if (priceRange) {
      if (priceRange.min !== null) {
        processedVendors = processedVendors.filter(v => 
          v.starting_price !== null && v.starting_price >= priceRange.min
        );
      }
      if (priceRange.max !== null) {
        processedVendors = processedVendors.filter(v => 
          v.starting_price !== null && v.starting_price <= priceRange.max
        );
      }
    }

    // Apply confidence filter
    if (confidence && confidence > 0) {
      processedVendors = processedVendors.filter(v => 
        v.confidence_score >= confidence
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        processedVendors.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_low':
        processedVendors.sort((a, b) => 
          (a.starting_price ?? Infinity) - (b.starting_price ?? Infinity)
        );
        break;
      case 'price_high':
        processedVendors.sort((a, b) => 
          (b.starting_price ?? -Infinity) - (a.starting_price ?? -Infinity)
        );
        break;
      case 'newest':
        processedVendors.sort((a, b) => 
          new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
        );
        break;
      case 'confidence':
        processedVendors.sort((a, b) => 
          b.confidence_score - a.confidence_score
        );
        break;
      default:
        // relevance - maintain original order or implement scoring
        break;
    }

    return NextResponse.json({
      vendors: processedVendors,
      total: processedVendors.length
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}