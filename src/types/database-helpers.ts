// src/types/database-helpers.ts
// Helper types that extend the generated database types
// Import this file instead of using database-custom.ts

import type { Database } from './database';

// Core vendor comparison types
export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type VendorInsert = Database['public']['Tables']['vendors']['Insert'];
export type VendorUpdate = Database['public']['Tables']['vendors']['Update'];

export type Plan = Database['public']['Tables']['plans']['Row'];
export type PlanInsert = Database['public']['Tables']['plans']['Insert'];
export type PlanUpdate = Database['public']['Tables']['plans']['Update'];

export type PriceFact = Database['public']['Tables']['price_facts']['Row'];
export type PriceFactInsert = Database['public']['Tables']['price_facts']['Insert'];
export type PriceFactUpdate = Database['public']['Tables']['price_facts']['Update'];

export type Feature = Database['public']['Tables']['features']['Row'];
export type FeatureInsert = Database['public']['Tables']['features']['Insert'];
export type FeatureUpdate = Database['public']['Tables']['features']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Lead management types
export type Lead = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export type LeadInteraction = Database['public']['Tables']['lead_interactions']['Row'];
export type LeadInteractionInsert = Database['public']['Tables']['lead_interactions']['Insert'];
export type LeadInteractionUpdate = Database['public']['Tables']['lead_interactions']['Update'];

// Comparison and sharing types
export type SavedComparison = Database['public']['Tables']['saved_comparisons']['Row'];
export type SavedComparisonInsert = Database['public']['Tables']['saved_comparisons']['Insert'];
export type SavedComparisonUpdate = Database['public']['Tables']['saved_comparisons']['Update'];

export type ComparisonShare = Database['public']['Tables']['comparison_shares']['Row'];
export type ComparisonShareInsert = Database['public']['Tables']['comparison_shares']['Insert'];
export type ComparisonShareUpdate = Database['public']['Tables']['comparison_shares']['Update'];

// Scraping and monitoring types
export type ScrapeJob = Database['public']['Tables']['scrape_jobs']['Row'];
export type ScrapeJobInsert = Database['public']['Tables']['scrape_jobs']['Insert'];
export type ScrapeJobUpdate = Database['public']['Tables']['scrape_jobs']['Update'];

export type ScrapeRun = Database['public']['Tables']['scrape_runs']['Row'];
export type ScrapeRunInsert = Database['public']['Tables']['scrape_runs']['Insert'];
export type ScrapeRunUpdate = Database['public']['Tables']['scrape_runs']['Update'];

export type ScrapeHistory = Database['public']['Tables']['scrape_history']['Row'];
export type ScrapeHistoryInsert = Database['public']['Tables']['scrape_history']['Insert'];
export type ScrapeHistoryUpdate = Database['public']['Tables']['scrape_history']['Update'];

// Price evidence for confidence scoring
export type PriceEvidence = Database['public']['Tables']['price_evidence']['Row'];
export type PriceEvidenceInsert = Database['public']['Tables']['price_evidence']['Insert'];
export type PriceEvidenceUpdate = Database['public']['Tables']['price_evidence']['Update'];

// System monitoring and settings
export type CronLog = Database['public']['Tables']['cron_logs']['Row'];
export type CronLogInsert = Database['public']['Tables']['cron_logs']['Insert'];
export type CronLogUpdate = Database['public']['Tables']['cron_logs']['Update'];

export type FeatureFlag = Database['public']['Tables']['feature_flags']['Row'];
export type FeatureFlagInsert = Database['public']['Tables']['feature_flags']['Insert'];
export type FeatureFlagUpdate = Database['public']['Tables']['feature_flags']['Update'];

export type AuditLog = Database['public']['Tables']['audit_log']['Row'];
export type AuditLogInsert = Database['public']['Tables']['audit_log']['Insert'];
export type AuditLogUpdate = Database['public']['Tables']['audit_log']['Update'];

export type BudgetAlert = Database['public']['Tables']['budget_alerts']['Row'];
export type BudgetAlertInsert = Database['public']['Tables']['budget_alerts']['Insert'];
export type BudgetAlertUpdate = Database['public']['Tables']['budget_alerts']['Update'];

export type BudgetTracking = Database['public']['Tables']['budget_tracking']['Row'];
export type BudgetTrackingInsert = Database['public']['Tables']['budget_tracking']['Insert'];
export type BudgetTrackingUpdate = Database['public']['Tables']['budget_tracking']['Update'];

// View types
export type ScrapingHealth = Database['public']['Views']['scraping_health']['Row'];
export type ExpiredShares = Database['public']['Views']['expired_shares']['Row'];

// ============================================
// Composite Types for Components
// ============================================

export type VendorWithPlans = Vendor & {
  plans: Plan[];
};

export type PlanWithPricing = Plan & {
  prices: PriceFact[];
  features?: Feature[];
};

export type VendorWithPricing = {
  vendor: Vendor;
  plans: (Plan & {
    prices: PriceFact[];
    features?: Feature[];
  })[];
};

export type ComparisonData = {
  vendors: Vendor[];
  plans: PlanWithPricing[];
  seats: number;
  billingPeriod: 'monthly' | 'annual';
};

export type VendorScrapingStatus = Vendor & {
  scrape_runs?: ScrapeRun[];
  pending_jobs?: ScrapeJob[];
};

export type DashboardMetrics = {
  totalVendors: number;
  activeVendors: number;
  staleData: number;
  recentScrapes: number;
  healthScore: number;
};

export type PlanWithDetails = Plan & {
  price_facts: PriceFact[];
  features: Feature[];
  vendor?: Vendor;
};

export type ComparisonResult = {
  vendor: Vendor;
  plans: PlanWithPricing[];
  totalCost?: number;
  confidence?: number;
};

export type SavedComparisonWithDetails = SavedComparison & {
  vendor_ids: string[];
  comparison_data: ComparisonData[];
  share?: ComparisonShare;
};