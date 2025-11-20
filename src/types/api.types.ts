// API Request/Response Types
// Types for API endpoints - request bodies, query params, and responses

import type { DashboardData } from './domain.types';

// ============================================
// Vendor API Types
// ============================================

export interface VendorListResponse {
  vendors: VendorListItem[];
  total: number;
}

export interface VendorListItem {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  category: string | null;
  description: string | null;
  starting_price: number | null;
  currency: string;
  confidence_score: number;
  last_updated: string;
  plan_count: number;
  is_verified: boolean;
}

// ============================================
// Comparison API Types
// ============================================

export interface CompareVendorsRequest {
  vendor_ids: string[];
  plan_tiers?: string[];
  feature_categories?: string[];
}

export interface CompareVendorsOptions {
  planTiers?: string[];
  featureCategories?: string[];
}

// ============================================
// Dashboard API Types
// ============================================

export interface DashboardResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
  timestamp: string;
}

// ============================================
// Generic API Response Types
// ============================================

export interface ApiErrorResponse {
  error: string;
  status: number;
  timestamp?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  data?: T;
  timestamp: string;
}

