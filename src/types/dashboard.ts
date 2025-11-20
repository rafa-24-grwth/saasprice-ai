// Dashboard Types and Interfaces
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

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
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

// Response types for API
export interface DashboardResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
  timestamp: string;
}

// Filter and period types
export type TimePeriod = '24h' | '7d' | '30d' | '90d' | 'all';
export type MetricType = 'vendors' | 'pricing' | 'activity' | 'savings';

// Chart configuration
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  dataKey: string;
  color?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
}