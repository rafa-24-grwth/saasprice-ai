// Export all trust components
export { VerificationBadge } from './VerificationBadge';
export { FreshnessStamp, FRESHNESS_WARN_DAYS, FRESHNESS_STALE_DAYS } from './FreshnessStamp';
export { ConfidenceIndicator } from './ConfidenceIndicator';
export { MethodologyPopover } from './MethodologyPopover';

// Re-export types and utilities from pricing.ts
export { 
  // Types
  type VerificationLevel, 
  type PriceMode, 
  type PriceRange,
  type ConfidenceFactors,
  type TrustMetadata,
  type PriceFactWithTrust,
  type ParseMethod,
  // Constants
  VERIFICATION_LEVELS,
  PARSE_METHODS,
  CONFIDENCE,
  // Utilities (only from pricing.ts to avoid duplicates)
  calculateConfidence,
  buildTrustMetadata,
  confidenceToPercentage,
  getConfidenceLevel,
  isHighConfidence,
  isMediumConfidence,
  isLowConfidence,
  parseMethodToVerificationLevel
} from '@/types/pricing';