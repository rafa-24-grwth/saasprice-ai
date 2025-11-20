// types/comparison.ts
// TypeScript interfaces for the comparison tool feature

export interface ComparisonVendor {
    id: string;
    name: string;
    logo_url: string | null;
    website: string;
    category: string;
    description: string | null;
    updated_at: string;
  }
  
  export interface ComparisonPlan {
    id: string;
    vendor_id: string;
    name: string;
    tier: 'starter' | 'professional' | 'enterprise' | 'custom';
    description: string | null;
    is_active: boolean;
  }
  
  export interface ComparisonPrice {
    plan_id: string;
    base_price: number | null;
    currency: string;
    cadence: 'monthly' | 'yearly' | 'one-time' | 'custom';
    unit: string | null;
    confidence_score: number;
    effective_date: string;
    normalized_monthly_price: number | null;
  }
  
  export interface ComparisonFeature {
    plan_id: string;
    feature: string;
    included: boolean;
    limit: string | null;
    category: string;
  }
  
  export interface ComparisonData {
    vendor: ComparisonVendor;
    plans: ComparisonPlan[];
    prices: ComparisonPrice[];
    features: ComparisonFeature[];
  }
  
  export interface ComparisonRequest {
    vendor_ids: string[];
    plan_tiers?: ('starter' | 'professional' | 'enterprise' | 'custom')[];
    feature_categories?: string[];
  }
  
  export interface ComparisonResponse {
    comparisons: ComparisonData[];
    metadata: {
      generated_at: string;
      total_vendors: number;
      feature_categories: string[];
      price_range: {
        min: number | null;
        max: number | null;
        currency: string;
      };
    };
  }
  
  export interface ComparisonShareData {
    id: string;
    vendor_ids: string[];
    created_by: string;
    created_at: string;
    expires_at: string | null;
    access_count: number;
    is_public: boolean;
  }
  
  export interface ComparisonExportOptions {
    format: 'csv' | 'pdf' | 'json';
    includeFeatures: boolean;
    includePricing: boolean;
    includeMetadata: boolean;
    filename?: string;
  }
  
  export interface ComparisonFilter {
    priceRange?: {
      min: number;
      max: number;
    };
    features?: string[];
    tiers?: string[];
    categories?: string[];
  }
  
  export interface ComparisonSortOptions {
    field: 'price' | 'name' | 'tier' | 'features';
    direction: 'asc' | 'desc';
  }
  
  // Feature comparison matrix types
  export interface FeatureMatrix {
    features: string[];
    vendors: {
      [vendorId: string]: {
        [feature: string]: boolean | string | null;
      };
    };
  }
  
  // Comparison state management
  export interface ComparisonState {
    selectedVendors: string[];
    comparisonData: ComparisonData[] | null;
    isLoading: boolean;
    error: string | null;
    filters: ComparisonFilter;
    sortBy: ComparisonSortOptions;
  }
  
  // Action types for comparison reducer if using useReducer
  export type ComparisonAction =
    | { type: 'ADD_VENDOR'; payload: string }
    | { type: 'REMOVE_VENDOR'; payload: string }
    | { type: 'SET_VENDORS'; payload: string[] }
    | { type: 'SET_DATA'; payload: ComparisonData[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_FILTER'; payload: Partial<ComparisonFilter> }
    | { type: 'SET_SORT'; payload: ComparisonSortOptions }
    | { type: 'CLEAR_COMPARISON' };