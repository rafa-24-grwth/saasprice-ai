/**
 * Core pricing type definitions for SaaSPrice.AI
 */

// Parse methods ordered by confidence (strongest to weakest)
export const PARSE_METHODS = [
  'api',
  'selector',
  'manual_reviewed',
  'firecrawl',
  'heuristic',
  'vision',  // Moved up (0.60 confidence)
  'manual'   // Moved down (0.50 confidence)
] as const;

export type ParseMethod = typeof PARSE_METHODS[number];

// Verification levels for trust indicators
export const VERIFICATION_LEVELS = ['API_VERIFIED', 'MONITORED', 'SELF_REPORTED'] as const;
export type VerificationLevel = typeof VERIFICATION_LEVELS[number];

// Unit types for pricing
export const UNIT_TYPES = ['seat', 'mau', 'event', 'gb', 'mixed'] as const;
export type UnitType = typeof UNIT_TYPES[number];

// Billing cadences
export const CADENCES = ['monthly', 'annual', 'quarterly'] as const;
export type Cadence = typeof CADENCES[number];

// Plan tiers
export const TIERS = ['entry', 'mid', 'enterprise'] as const;
export type PlanTier = typeof TIERS[number];

// Pricing models
export const PRICING_MODELS = ['simple', 'tiered', 'credit', 'contact'] as const;
export type PricingModel = typeof PRICING_MODELS[number];

// Price calculation modes (for UI display)
export type PriceMode = 'SEAT' | 'USAGE';

// Confidence mapping for parse methods (all as 0-1 ratios)
export const CONFIDENCE: Record<ParseMethod, number> = {
  api: 0.99,
  selector: 0.90,
  manual_reviewed: 0.85,
  firecrawl: 0.80,
  heuristic: 0.70,
  vision: 0.60,
  manual: 0.50,
};

// Map parse method to verification level
export const parseMethodToVerificationLevel = (method: ParseMethod): VerificationLevel => {
  if (method === 'api') return 'API_VERIFIED';
  if (['selector', 'firecrawl', 'manual_reviewed'].includes(method)) return 'MONITORED';
  return 'SELF_REPORTED';
};

// Tiered pricing structure
export interface PricingTier {
  upTo?: number;  // Upper bound (undefined = unlimited)
  unitPrice: number;
}

// Credit pack for credit-based pricing
export interface CreditPack {
  size: number;
  price: number;
}

// Price range for visualization
export interface PriceRange {
  label: string;   // Vendor/plan name
  low: number;     // Lowest price in currency units
  likely: number;  // Most likely price in currency units
  high: number;    // Highest price in currency units
  confidence: number;  // 0-1 ratio (1 = highest confidence)
  verificationLevel: VerificationLevel;
}

// Confidence calculation factors (all ratios are 0-1)
export interface ConfidenceFactors {
  verificationLevel: VerificationLevel;
  freshnessScore: number;     // 0-1 ratio (1 = just updated, 0 = very stale)
  sourceCount: number;        // Number of data sources (absolute count)
  sourceAgreement: number;    // 0-1 ratio (1 = all sources agree, 0 = no agreement)
  parseMethod?: ParseMethod;  // Optional parse method for additional context
}

// Trust metadata for pricing data
export interface TrustMetadata {
  verificationLevel: VerificationLevel;
  lastVerified: Date;
  confidence: number;          // 0-1 ratio (1 = highest confidence)
  confidenceLevel: 'high' | 'medium' | 'low';  // Derived from confidence ratio
  sourceCount: number;         // Number of data sources (absolute count)
  sourceAgreement: number;     // 0-1 ratio (1 = all sources agree)
  parseMethod?: ParseMethod;   // How the data was obtained
  methodology?: string;        // Optional description of calculation method
}

// Normalization specification
export interface NormalizationSpec {
  version: '2.0.0';
  billingPeriod: Cadence;
  unitBasis: UnitType;
  basePrice: number | null;
  unitsIncluded: number;
  overageUnit?: string;
  overagePrice: number | null;
  tiers?: PricingTier[];
  creditPacks?: CreditPack[];
  minimumCommitment: number | null;
  targetUnits: number;
  targetPeriod: 'monthly' | 'annual';
  normalizedValue: number | null;
  pricingModel: PricingModel;
  formula: string;
  assumptions: string[];
  confidence: number;  // 0-1 ratio
}

// Database types (matching schema)
export interface Vendor {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  pricing_url: string;
  priority: number;
  api_endpoint: string | null;
  scrape_hints: Record<string, any> | null;
  is_active: boolean;  // For soft deletes
  is_quarantined: boolean;
  quarantine_reason: string | null;
  quarantine_until: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Plan {
  id: string;
  vendor_id: string;
  name: string;
  slug: string;
  tier: PlanTier | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  vendor?: Vendor; // For joins
}

export interface PriceFact {
  id: string;
  plan_id: string;
  scrape_run_id: string | null;  // Links to the scrape that created this fact
  cadence: Cadence;
  base_price: number | null;
  unit_price: number | null;
  currency_code: string;
  region: string;
  included_units: number | null;
  unit_type: UnitType | null;
  overage_price: number | null;
  minimum_commitment: number | null;
  normalized_value: number | null;
  target_units: number;
  target_period: string;
  confidence_score: number;  // 0-1 ratio
  verification_level: VerificationLevel;
  valid_from: Date;
  valid_to: Date | null;
  observed_at: Date;
  created_at: Date;
  plan?: Plan; // For joins
  evidence?: PriceEvidence[]; // For joins
}

// Extended price fact with trust data
export interface PriceFactWithTrust extends PriceFact {
  trust: TrustMetadata;
}

export interface PriceEvidence {
  id: string;
  price_fact_id: string;
  source_url: string;
  screenshot_url: string | null;
  screenshot_expires_at: Date | null;
  html_sha256: string | null;
  markdown_content: string | null;
  parse_method: ParseMethod;
  parser_version: string | null;
  evidence_strength: number;  // 0-1 ratio
  raw_extracted_data: Record<string, any> | null;
  observed_at: Date;
  created_at: Date;
}

export interface ScrapeRun {
  id: string;
  vendor_id: string;
  bucket: Date;
  status: 'pending' | 'success' | 'failed' | 'quarantined';
  failure_count: number;
  cost_usd: number | null;
  error_message: string | null;
  created_at: Date;
}

// Comparison types
export interface ComparisonInput {
  vendorA: string;
  vendorB: string;
  seats: number;
  period: 'monthly' | 'annual';
  includeOverage?: boolean;
}

export interface ComparisonResult {
  input: ComparisonInput;
  vendorA: VendorComparison;
  vendorB: VendorComparison;
  winner?: 'A' | 'B' | 'tie';
  savingsAmount?: number;
  savingsPercent?: number;
  generatedAt: Date;
}

export interface VendorComparison {
  vendor: Vendor;
  plan: Plan;
  priceFact: PriceFact;
  normalizedCost: number;
  confidence: number;  // 0-1 ratio
  verificationLevel: VerificationLevel;
  formula: string;
  assumptions: string[];
  lastUpdated: Date;
}

// ============================================
// Helper functions for confidence and trust
// ============================================

// Type guards for confidence levels
export const isHighConfidence = (confidence: number): boolean => confidence >= 0.8;
export const isMediumConfidence = (confidence: number): boolean => confidence >= 0.5 && confidence < 0.8;
export const isLowConfidence = (confidence: number): boolean => confidence < 0.5;

// Utility to convert confidence ratio to percentage for display
export const confidenceToPercentage = (confidence: number): number => Math.round(confidence * 100);

// Utility to determine confidence level from ratio
export const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
  if (isHighConfidence(confidence)) return 'high';
  if (isMediumConfidence(confidence)) return 'medium';
  return 'low';
};

// Calculate confidence score from multiple factors
export const calculateConfidence = (
  verificationLevel: VerificationLevel,
  daysSinceUpdate: number,
  sourceCount: number = 1,
  sourceAgreementRate: number = 1,  // 0-1 ratio
  parseMethod?: ParseMethod
): number => {
  // Base confidence from verification level or parse method
  let baseConfidence: number;
  
  if (parseMethod && CONFIDENCE[parseMethod]) {
    baseConfidence = CONFIDENCE[parseMethod];
  } else {
    baseConfidence = {
      'API_VERIFIED': 0.95,
      'MONITORED': 0.75,
      'SELF_REPORTED': 0.50
    }[verificationLevel];
  }

  // Freshness multiplier (lose up to 20% for stale data)
  // Data older than 30 days gets maximum penalty
  const freshnessMultiplier = Math.max(0.8, 1 - (daysSinceUpdate / 30) * 0.2);

  // Source bonus (up to 10% boost for multiple sources)
  // Caps at 5 sources for maximum bonus
  const sourceBonus = Math.min(0.1, (sourceCount - 1) * 0.025);

  // Agreement penalty (lose up to 15% if sources disagree)
  const agreementMultiplier = 0.85 + (sourceAgreementRate * 0.15);

  // Calculate final confidence as a ratio
  const confidence = (baseConfidence + sourceBonus) * freshnessMultiplier * agreementMultiplier;

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, confidence));
};

// Build trust metadata from price fact and evidence
export const buildTrustMetadata = (
  priceFact: PriceFact,
  evidence?: PriceEvidence[]
): TrustMetadata => {
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(priceFact.observed_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const sourceCount = evidence?.length || 1;
  const parseMethod = evidence?.[0]?.parse_method;
  
  // Calculate source agreement (simplified - you may want more sophisticated logic)
  const sourceAgreement = sourceCount > 1 ? 0.9 : 1; // Assume 90% agreement for multiple sources
  
  const confidence = calculateConfidence(
    priceFact.verification_level,
    daysSinceUpdate,
    sourceCount,
    sourceAgreement,
    parseMethod
  );
  
  return {
    verificationLevel: priceFact.verification_level,
    lastVerified: priceFact.observed_at,
    confidence,
    confidenceLevel: getConfidenceLevel(confidence),
    sourceCount,
    sourceAgreement,
    parseMethod,
    methodology: 'Normalized to monthly cost for standard usage'
  };
};