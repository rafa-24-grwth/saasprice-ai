// src/app/api/vendors/[id]/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { ApiError, formatErrorResponse } from '@/utils/api-error';

// Add type definitions
interface PriceHistoryItem {
  date: string;
  price: number;
  tier: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Server Component boundary
            }
          },
        },
      }
    );

    const vendorId = params.id;

    if (!vendorId) {
      throw ApiError.validation('Vendor ID is required');
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // PUBLIC ACCESS - Limited data only
    if (!user) {
      // Only return basic vendor info for unauthenticated users
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select(`
          id,
          name,
          logo_url,
          category
        `)
        .eq('id', vendorId)
        .eq('is_active', true)
        .single();

      if (vendorError || !vendor) {
        throw ApiError.notFound('Vendor not found');
      }

      // Return minimal public data
      return NextResponse.json({
        id: vendor.id,
        name: vendor.name,
        logo_url: vendor.logo_url,
        category: vendor.category,
        limited: true,
        message: 'Sign in to view full vendor details and pricing'
      });
    }

    // AUTHENTICATED ACCESS - Full data
    // Fetch vendor details
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select(`
        id,
        name,
        logo_url,
        pricing_url,
        category,
        created_at,
        updated_at,
        is_active
      `)
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      throw ApiError.notFound('Vendor not found');
    }

    // Check user's subscription tier for data access levels
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();

    const subscriptionTier = userProfile?.subscription_tier || 'free';
    
    // FREE TIER - Limited pricing data
    if (subscriptionTier === 'free') {
      // Only show basic tier pricing, no historical data
      const { data: plans } = await supabase
        .from('plans')
        .select(`
          id,
          name,
          tier,
          display_name,
          price_facts (
            base_price,
            currency,
            cadence
          )
        `)
        .eq('vendor_id', vendorId)
        .in('tier', ['starter', 'basic', 'free'])  // Only show entry-level tiers
        .limit(3);

      const pricingTiers = plans?.map(plan => {
        const latestPrice = plan.price_facts?.[0];
        return {
          name: plan.display_name || plan.name || 'Basic',
          tier: plan.tier || 'basic',
          price: latestPrice?.base_price || null,
          billing_period: latestPrice?.cadence === 'yearly' ? 'annual' : 'monthly',
          currency: latestPrice?.currency || 'USD'
        };
      }) || [];

      return NextResponse.json({
        id: vendor.id,
        name: vendor.name,
        logo_url: vendor.logo_url,
        website: vendor.pricing_url,
        category: vendor.category,
        pricing_tiers: pricingTiers,
        limited: true,
        message: 'Upgrade to Pro for full pricing details and features'
      });
    }

    // PRO/ENTERPRISE TIER - Full data access
    // Fetch pricing plans with their price facts
    const { data: plans } = await supabase
      .from('plans')
      .select(`
        id,
        name,
        tier,
        description,
        display_name,
        position,
        price_facts (
          base_price,
          price_per_additional_seat,
          currency,
          cadence,
          pricing_model,
          confidence_score,
          created_at,
          effective_date
        )
      `)
      .eq('vendor_id', vendorId)
      .order('position', { ascending: true });

    // Get plan IDs
    const planIds = plans?.map(p => p.id) || [];

    // Fetch plan features separately
    const { data: planFeatures } = await supabase
      .from('plan_features')
      .select(`
        plan_id,
        feature_id,
        value,
        is_unlimited
      `)
      .in('plan_id', planIds);

    // Fetch feature details
    let featureDetails = new Map();
    if (planFeatures && planFeatures.length > 0) {
      const featureIds = [...new Set(planFeatures.map(pf => pf.feature_id).filter(Boolean))];
      if (featureIds.length > 0) {
        const { data: features } = await supabase
          .from('features')
          .select('id, name, display_name, description')
          .in('id', featureIds);
        
        if (features) {
          features.forEach(f => {
            featureDetails.set(f.id, f);
          });
        }
      }
    }

    // Process pricing tiers with full details
    const pricingTiers = plans?.map(plan => {
      const latestPrice = plan.price_facts?.[0];
      
      // Get features for this plan
      const planFeatureList = planFeatures
        ?.filter(pf => pf.plan_id === plan.id)
        .map(pf => {
          const feature = featureDetails.get(pf.feature_id);
          if (feature) {
            return feature.display_name || feature.name || `Feature ${pf.feature_id}`;
          }
          return pf.value || `Included feature`;
        })
        .filter(Boolean) || [];

      return {
        id: plan.id,
        name: plan.display_name || plan.name || plan.tier || 'Basic',
        tier: plan.tier || 'basic',
        price: latestPrice?.base_price || null,
        billing_period: latestPrice?.cadence === 'yearly' ? 'annual' : 'monthly',
        features: planFeatureList,
        pricing_model: latestPrice?.pricing_model || 'flat',
        currency: latestPrice?.currency || 'USD'
      };
    }) || [];

    // Calculate confidence score
    const allPriceFacts = plans?.flatMap(p => p.price_facts || []) || [];
    const confidenceScore = allPriceFacts.length > 0
      ? Math.round(
          allPriceFacts.reduce((sum, pf) => sum + (pf.confidence_score || 0), 0) / 
          allPriceFacts.length * 100
        )
      : 0;

    // Get last updated date
    const lastUpdated = allPriceFacts.length > 0
      ? allPriceFacts.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )[0]?.created_at
      : vendor.updated_at;

    // Find similar vendors (only for pro+ users)
    const { data: similarVendors } = await supabase
      .from('vendors')
      .select(`
        id,
        name,
        logo_url
      `)
      .eq('category', vendor.category)
      .neq('id', vendorId)
      .limit(4);

    // Process similar vendors with pricing
    const processedSimilar = [];
    for (const sv of similarVendors || []) {
      const { data: svPlans } = await supabase
        .from('plans')
        .select(`
          price_facts (
            base_price
          )
        `)
        .eq('vendor_id', sv.id)
        .limit(1);

      processedSimilar.push({
        id: sv.id,
        name: sv.name,
        logo_url: sv.logo_url,
        starting_price: svPlans?.[0]?.price_facts?.[0]?.base_price || null
      });
    }

    // Price history - only for enterprise users
    // FIX: Explicitly type processedHistory
    let processedHistory: PriceHistoryItem[] = [];
    
    if (subscriptionTier === 'enterprise') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: priceHistory } = await supabase
        .from('price_facts')
        .select(`
          base_price,
          created_at,
          plan_id
        `)
        .in('plan_id', planIds)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Map plan IDs to tiers
      const planTierMap = new Map(
        plans?.map(p => [p.id, p.tier || 'unknown']) || []
      );

      // Process price history with proper typing
      processedHistory = (priceHistory?.map(ph => ({
        date: new Date(ph.created_at || new Date()).toISOString(),
        price: ph.base_price || 0,
        tier: planTierMap.get(ph.plan_id) || 'unknown'
      })) || []) as PriceHistoryItem[];
    }

    // Build response based on subscription tier
    const vendorDetails = {
      id: vendor.id,
      name: vendor.name,
      logo_url: vendor.logo_url,
      website: vendor.pricing_url,
      category: vendor.category,
      description: null,
      last_updated: lastUpdated,
      confidence_score: confidenceScore,
      is_verified: confidenceScore >= 80,
      pricing_tiers: pricingTiers,
      similar_vendors: processedSimilar,
      price_history: processedHistory,
      subscription_tier: subscriptionTier
    };

    // Log access for analytics (but don't expose sensitive data)
    await supabase
      .from('api_access_logs')
      .insert({
        user_id: user.id,
        endpoint: `/api/vendors/${vendorId}`,
        subscription_tier: subscriptionTier,
        accessed_at: new Date().toISOString()
      })
      .select()
      .single();

    return NextResponse.json(vendorDetails);

  } catch (error) {
    console.error('API Error:', error);
    // Never expose internal error details
    if (error instanceof ApiError) {
      return formatErrorResponse(error, error.message);
    }
    return NextResponse.json(
      { error: 'An error occurred while fetching vendor details' },
      { status: 500 }
    );
  }
}