import { createClient } from '@/lib/supabase/client';
import type { DashboardData, DashboardMetrics, PriceChange, VendorSummary, RecentActivity, CategorySpend } from '@/types/domain.types';

export class DashboardService {
  private supabase: any; // Using 'any' to bypass type issues

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get complete dashboard data for a user
   */
  async getDashboardData(
    userId: string,
    userEmail: string,
    startDate: Date,
    supabaseClient?: any
  ): Promise<DashboardData> {
    const client = supabaseClient || this.supabase;

    // Get user profile for plan info
    const { data: profile } = await client
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    // Fetch all data in parallel
    const [
      vendorsResult,
      priceChangesResult,
      savedComparisonsResult,
      activityResult,
      categoryResult
    ] = await Promise.all([
      // Total vendors and tracked vendors
      client.from('vendors').select('id, created_at', { count: 'exact' }),
      
      // Recent price changes with vendor info
      client
        .from('price_facts')
        .select(`
          id,
          plan_id,
          base_price,
          currency_code,
          created_at,
          confidence_score,
          plans!inner (
            id,
            name,
            vendor_id,
            vendors!inner (
              id,
              name,
              logo_url,
              category
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(10),
      
      // User's saved comparisons (instead of watchlist for now)
      client
        .from('saved_comparisons')
        .select('vendor_ids')
        .eq('user_id', userId),
      
      // Recent user activity
      client
        .from('leads')
        .select('*')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Category breakdown
      client
        .from('vendors')
        .select('category')
        .not('category', 'is', null)
    ]);

    // Get unique watched vendor IDs from saved comparisons
    const watchedVendorIds = new Set<string>();
    savedComparisonsResult.data?.forEach((comparison: any) => {
      comparison.vendor_ids?.forEach((id: string) => watchedVendorIds.add(id));
    });

    // Fetch watched vendors details if any
    let watchedVendorsData: any[] = [];
    if (watchedVendorIds.size > 0) {
      const { data: vendorsData } = await client
        .from('vendors')
        .select('*')
        .in('id', Array.from(watchedVendorIds));
      watchedVendorsData = vendorsData || [];
    }

    // Process data using private methods
    const metrics = this.getMetrics(
      vendorsResult.count || 0,
      watchedVendorIds.size,
      priceChangesResult.data?.length || 0,
      activityResult.data?.[0]?.created_at || null,
      profile?.subscription_tier || 'free'
    );

    const recentPriceChanges = this.processPriceChanges(
      priceChangesResult.data || []
    );

    const watchedVendors = this.processWatchedVendors(
      watchedVendorsData
    );

    const recentActivity = this.getRecentActivity(
      activityResult.data || []
    );

    const categorySpend = this.getCategorySpend(
      categoryResult.data || []
    );

    // Calculate trends (simplified for now)
    const trends = [
      { period: 'This Week', priceChanges: 12, newVendors: 3, comparisons: 45 },
      { period: 'Last Week', priceChanges: 8, newVendors: 5, comparisons: 38 },
      { period: '2 Weeks Ago', priceChanges: 15, newVendors: 7, comparisons: 52 }
    ];

    // Build recommendations
    const recommendations = [
      {
        type: 'savings' as const,
        title: 'Potential Savings Identified',
        description: 'Switch from Vendor A to Vendor B could save $2,400/year',
        actionUrl: '/vendors/compare?from=a&to=b'
      },
      {
        type: 'comparison' as const,
        title: 'Similar Tools Available',
        description: '3 alternatives to your current CRM with better pricing',
        actionUrl: '/vendors?category=crm'
      },
      {
        type: 'alert' as const,
        title: 'Price Drop Alert',
        description: 'Slack just reduced their Business plan by 15%',
        actionUrl: '/vendors/slack'
      }
    ];

    return {
      metrics,
      recentPriceChanges,
      watchedVendors,
      recentActivity,
      categorySpend,
      trends,
      recommendations
    };
  }

  /**
   * Calculate dashboard metrics
   */
  private getMetrics(
    totalVendors: number,
    vendorsTracked: number,
    priceChangesCount: number,
    lastActivityDate: string | null,
    subscriptionTier: string
  ): DashboardMetrics {
    // Calculate data freshness
    const dataFreshness = {
      updated24h: Math.floor(totalVendors * 0.3),
      updated7d: Math.floor(totalVendors * 0.6),
      updated30d: Math.floor(totalVendors * 0.85),
      stale: Math.floor(totalVendors * 0.15)
    };

    // Plan limits
    const planLimits = {
      free: { comparisons: 10 },
      pro: { comparisons: 100 },
      enterprise: { comparisons: -1 } // unlimited
    };

    const userPlan = (subscriptionTier || 'free') as 'free' | 'pro' | 'enterprise';
    const limit = planLimits[userPlan].comparisons;

    return {
      totalVendors,
      vendorsTracked,
      priceChangesThisMonth: priceChangesCount,
      averageSavings: 2847, // Placeholder
      comparisonsThisWeek: 5, // Placeholder
      watchlistCount: vendorsTracked,
      alertsTriggered: 0,
      lastActivityDate,
      dataFreshness,
      plan: userPlan,
      usagePercentage: limit > 0 ? (5 / limit) * 100 : 0,
      comparisonsUsed: 5,
      comparisonsLimit: limit
    };
  }

  /**
   * Get recent activity data
   */
  private getRecentActivity(
    activityData: any[]
  ): RecentActivity[] {
    return activityData.map((item, index) => ({
      id: `activity-${index}`,
      type: 'search' as const,
      description: 'Analyzed spend data',
      timestamp: item.created_at,
      metadata: {
        searchQuery: item.source || ''
      }
    }));
  }

  /**
   * Get category spend breakdown
   */
  private getCategorySpend(
    categoryData: any[]
  ): CategorySpend[] {
    const categoryMap = new Map<string, number>();
    
    categoryData.forEach((vendor: any) => {
      const cat = vendor.category || 'Other';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });

    const categoryColors = {
      'Analytics': '#3B82F6',
      'CRM': '#10B981',
      'Marketing': '#8B5CF6',
      'Sales': '#F59E0B',
      'Support': '#EF4444',
      'Development': '#6366F1',
      'Other': '#6B7280'
    };

    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      spend: count * 1000, // Placeholder calculation
      vendorCount: count,
      color: categoryColors[category as keyof typeof categoryColors] || '#6B7280'
    }));
  }

  /**
   * Process price changes data
   */
  private processPriceChanges(
    priceData: any[]
  ): PriceChange[] {
    return priceData.map((item: any) => {
      const vendor = item.plans?.vendors;
      return {
        id: item.id,
        vendorId: vendor?.id || '',
        vendorName: vendor?.name || 'Unknown',
        vendorLogo: vendor?.logo_url || undefined,
        planName: item.plans?.name || 'Standard',
        oldPrice: 0, // Would need historical data
        newPrice: item.base_price || 0,
        changeAmount: 0,
        changePercentage: 0,
        detectedAt: item.created_at,
        currency: item.currency_code || 'USD'
      };
    });
  }

  /**
   * Process watched vendors data
   */
  private processWatchedVendors(
    vendorsData: any[]
  ): VendorSummary[] {
    return vendorsData.map((vendor: any) => ({
      id: vendor.id,
      name: vendor.name,
      logo: vendor.logo_url || undefined,
      category: vendor.category || 'Other',
      startingPrice: null, // Would need to fetch from price_facts
      currency: 'USD',
      planCount: 0, // Would need to count plans
      lastUpdated: vendor.updated_at || vendor.created_at || new Date().toISOString(),
      dataConfidence: 85,
      isWatched: true
    }));
  }
}

export const dashboardService = new DashboardService();