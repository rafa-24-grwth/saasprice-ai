// Domain Types - Business Logic Types
// Organized by domain: Vendor, Comparison, Dashboard, Pricing

// ============================================
// Shared Base Types (used across domains)
// ============================================

export interface BaseVendorData {
  id: string;
  name: string;
  logo_url: string | null;
  website: string;
  category: string;
  description: string | null;
  updated_at: string;
}

// ============================================
// Vendor Domain Types
// ============================================

export namespace VendorTypes {
  // Use the shared base type
  export type VendorData = BaseVendorData;

  // Service response types
  export interface VendorSummary {
    id: string;
    name: string;
    logo?: string;
    category: string;
    startingPrice: number | null;
    currency: string;
    planCount: number;
    lastUpdated: string;
    dataConfidence: number;
    isWatched?: boolean;
  }
}

// ============================================
// Comparison Domain Types
// ============================================

export namespace ComparisonTypes {
  // Use the shared base type instead of duplicating
  export type VendorData = BaseVendorData;

  export interface PlanData {
    id: string;
    vendor_id: string;
    name: string;
    tier: 'starter' | 'professional' | 'enterprise' | 'custom';
    description: string | null;
    is_active: boolean;
  }

  export interface PriceData {
    plan_id: string;
    base_price: number | null;
    currency: string;
    cadence: 'monthly' | 'yearly' | 'one-time' | 'custom';
    unit: string | null;
    confidence_score: number;
    effective_date: string;
  }

  export interface FeatureData {
    plan_id: string;
    feature: string;
    included: boolean;
    limit: string | null;
    category: string;
  }
}

// ============================================
// Dashboard Domain Types
// ============================================

export namespace DashboardTypes {
  export interface DashboardMetrics {
    // Overview Metrics
    totalVendors: number;
    vendorsTracked: number;
    priceChangesThisMonth: number;
    averageSavings: number;
    
    // User Activity
    comparisonsThisWeek: number;
    watchlistCount: number;
    alertsTriggered: number;
    lastActivityDate: string | null;
    
    // Data Quality
    dataFreshness: {
      updated24h: number;
      updated7d: number;
      updated30d: number;
      stale: number;
    };
    
    // Subscription Info
    plan: 'free' | 'pro' | 'enterprise';
    usagePercentage: number;
    comparisonsUsed: number;
    comparisonsLimit: number;
  }

  export interface PriceChange {
    id: string;
    vendorId: string;
    vendorName: string;
    vendorLogo?: string;
    planName: string;
    oldPrice: number;
    newPrice: number;
    changeAmount: number;
    changePercentage: number;
    detectedAt: string;
    currency: string;
  }

  export interface VendorSummary {
    id: string;
    name: string;
    logo?: string;
    category: string;
    startingPrice: number | null;
    currency: string;
    planCount: number;
    lastUpdated: string;
    dataConfidence: number;
    isWatched?: boolean;
  }

  export interface RecentActivity {
    id: string;
    type: 'comparison' | 'watchlist_add' | 'alert_triggered' | 'export' | 'search';
    description: string;
    timestamp: string;
    metadata?: {
      vendorId?: string;
      vendorName?: string;
      searchQuery?: string;
      exportFormat?: string;
    };
  }

  export interface CategorySpend {
    category: string;
    spend: number;
    vendorCount: number;
    color: string;
  }

  export interface TrendData {
    period: string;
    priceChanges: number;
    newVendors: number;
    comparisons: number;
  }

  export interface DashboardData {
    metrics: DashboardMetrics;
    recentPriceChanges: PriceChange[];
    watchedVendors: VendorSummary[];
    recentActivity: RecentActivity[];
    categorySpend: CategorySpend[];
    trends: TrendData[];
    recommendations?: {
      type: 'savings' | 'comparison' | 'alert';
      title: string;
      description: string;
      actionUrl?: string;
    }[];
  }

  // Database response types
  export interface PriceFactRow {
    id: string;
    vendor_id: string;
    plan_name: string | null;
    price: number;
    currency: string | null;
    created_at: string;
    confidence_score: number | null;
    vendors: {
      name: string;
      logo_url: string | null;
      category: string | null;
    } | null;
  }

  export interface WatchlistRow {
    vendor_id: string;
    vendors: {
      id: string;
      name: string;
      logo_url: string | null;
      category: string | null;
      created_at: string;
    } | null;
  }

  export interface LeadRow {
    id: string;
    email: string;
    created_at: string;
    spend_analysis?: {
      vendors?: string[];
    } | null;
  }

  export interface VendorRow {
    category: string | null;
  }
}

// ============================================
// Pricing Domain Types
// ============================================

export namespace PricingTypes {
  // Pricing-related domain types can be added here
  // Most pricing types are already in pricing.ts
}

// Re-export commonly used types for convenience (without namespace prefix)
export type DashboardData = DashboardTypes.DashboardData;
export type DashboardMetrics = DashboardTypes.DashboardMetrics;
export type PriceChange = DashboardTypes.PriceChange;
export type VendorSummary = DashboardTypes.VendorSummary;
export type RecentActivity = DashboardTypes.RecentActivity;
export type CategorySpend = DashboardTypes.CategorySpend;