/**
 * Normalization Engine for SaaSPrice.AI
 * Converts various pricing models to comparable values
 */

import {
    NormalizationSpec,
    PricingTier,
    CreditPack,
    ParseMethod,
    VerificationLevel,
    CONFIDENCE,
    parseMethodToVerificationLevel,
    Cadence,
    UnitType,
    PricingModel,
    PriceFact,
    PriceEvidence
  } from '@/types/pricing';
  
  /**
   * Pricing model evaluators
   */
  export const PRICING_EVALUATORS = {
    /**
     * Simple pricing: base price + overage
     */
    simple: (spec: NormalizationSpec): number | null => {
      if (spec.basePrice === null) return null;
      
      // Convert to monthly if needed
      const monthlyBase = spec.billingPeriod === 'annual' 
        ? spec.basePrice / 12 
        : spec.billingPeriod === 'quarterly' 
        ? spec.basePrice / 3 
        : spec.basePrice;
      
      // Calculate overage for units beyond included
      const additional = Math.max(0, spec.targetUnits - spec.unitsIncluded);
      const overage = additional * (spec.overagePrice || 0);
      
      return monthlyBase + overage;
    },
  
    /**
     * Tiered pricing: progressive unit pricing
     */
    tiered: (units: number, tiers: PricingTier[]): number => {
      let cost = 0;
      let used = 0;
      
      for (const tier of tiers) {
        // Calculate units in this tier
        const tierCap = tier.upTo ? (tier.upTo - used) : (units - used);
        const unitsInTier = Math.min(Math.max(tierCap, 0), units - used);
        
        if (unitsInTier > 0) {
          cost += unitsInTier * tier.unitPrice;
          used += unitsInTier;
        }
        
        if (used >= units) break;
      }
      
      return cost;
    },
  
    /**
     * Credit-based pricing: optimal pack selection using dynamic programming
     */
    credit: (units: number, packs: CreditPack[]): number | null => {
      // Allow buying up to 2x needed units for bulk discount consideration
      const maxUnits = units * 2;
      const dp = Array(maxUnits + 1).fill(Infinity);
      dp[0] = 0;
      
      // Dynamic programming to find minimum cost
      for (let u = 1; u <= maxUnits; u++) {
        for (const pack of packs) {
          if (pack.size <= u) {
            dp[u] = Math.min(dp[u], dp[u - pack.size] + pack.price);
          }
        }
      }
      
      // Find minimum cost that covers required units
      let minCost = Infinity;
      for (let u = units; u <= maxUnits; u++) {
        minCost = Math.min(minCost, dp[u]);
      }
      
      return minCost === Infinity ? null : minCost;
    }
  };
  
  /**
   * Detect pricing model from specification
   */
  export function detectPricingModel(spec: NormalizationSpec): PricingModel {
    // No pricing information = contact sales
    if (spec.basePrice === null && !spec.tiers?.length && !spec.creditPacks?.length) {
      return 'contact';
    }
    
    // Has tiers = tiered pricing
    if (spec.tiers && spec.tiers.length > 0) {
      return 'tiered';
    }
    
    // Has credit packs = credit-based
    if (spec.creditPacks && spec.creditPacks.length > 0) {
      return 'credit';
    }
    
    // Default to simple
    return 'simple';
  }
  
  /**
   * Main normalization engine class
   */
  export class NormalizationEngine {
    /**
     * Build normalization specification from raw extracted data
     */
    buildSpec(
      rawData: any,
      targetUnits: number = 10,
      targetPeriod: 'monthly' | 'annual' = 'monthly'
    ): NormalizationSpec {
      // Extract basic pricing info
      const billingPeriod = (rawData.cadence || rawData.billing_period || 'monthly') as Cadence;
      const unitBasis = (rawData.unit_type || rawData.unitType || 'seat') as UnitType;
      
      // Parse pricing values
      const basePrice = this.parseNumber(rawData.base_price || rawData.basePrice);
      const unitsIncluded = this.parseNumber(rawData.included_units || rawData.includedUnits) || 0;
      const overagePrice = this.parseNumber(rawData.overage_price || rawData.overagePrice);
      
      // Parse tiers if present
      const tiers = this.parseTiers(rawData.tiers || rawData.pricing_tiers);
      
      // Parse credit packs if present
      const creditPacks = this.parseCreditPacks(rawData.credit_packs || rawData.creditPacks);
      
      // Build initial spec
      const spec: NormalizationSpec = {
        version: '2.0.0',
        billingPeriod,
        unitBasis,
        basePrice,
        unitsIncluded,
        overageUnit: rawData.overage_unit,
        overagePrice,
        tiers,
        creditPacks,
        minimumCommitment: this.parseNumber(rawData.minimum_commitment),
        targetUnits,
        targetPeriod,
        normalizedValue: null,
        pricingModel: 'simple',
        formula: '',
        assumptions: [],
        confidence: 0
      };
      
      // Detect and set pricing model
      spec.pricingModel = detectPricingModel(spec);
      
      return spec;
    }
  
    /**
     * Normalize pricing to target units and period
     */
    normalize(
      rawData: any,
      evidence: PriceEvidence,
      targetUnits: number = 10,
      targetPeriod: 'monthly' | 'annual' = 'monthly'
    ): NormalizationSpec {
      const spec = this.buildSpec(rawData, targetUnits, targetPeriod);
      
      // Calculate normalized value based on model
      let value: number | null = null;
      
      // Step 1: Calculate the raw value based on the model
      switch (spec.pricingModel) {
        case 'simple':
          // Simple evaluator already returns a monthly value
          value = PRICING_EVALUATORS.simple(spec);
          break;
        
        case 'tiered':
          if (spec.tiers) {
            value = PRICING_EVALUATORS.tiered(spec.targetUnits, spec.tiers);
          }
          break;
        
        case 'credit':
          if (spec.creditPacks) {
            value = PRICING_EVALUATORS.credit(spec.targetUnits, spec.creditPacks);
          }
          break;
        
        case 'contact':
          value = null;
          break;
      }
      
      // Step 2: Convert to monthly base (if not already)
      // Simple model already handles this internally
      if (value !== null && spec.pricingModel !== 'simple' && spec.pricingModel !== 'contact') {
        const periodDivisor = 
          spec.billingPeriod === 'annual' ? 12 : 
          spec.billingPeriod === 'quarterly' ? 3 : 
          1;
        value = value / periodDivisor;
      }
      
      // Step 3: Convert to target period if requested
      if (value !== null && targetPeriod === 'annual') {
        value = value * 12;
      }
      
      // Set normalized value and metadata
      spec.normalizedValue = value;
      spec.confidence = CONFIDENCE[evidence.parse_method];
      spec.formula = this.generateFormula(spec);
      spec.assumptions = this.generateAssumptions(spec);
      
      return spec;
    }
  
    /**
     * Generate human-readable formula
     */
    private generateFormula(spec: NormalizationSpec): string {
      switch (spec.pricingModel) {
        case 'simple':
          if (spec.basePrice === null) return 'Contact sales';
          const monthly = spec.billingPeriod === 'annual' ? `${spec.basePrice}/12` : `${spec.basePrice}`;
          if (spec.overagePrice && spec.targetUnits > spec.unitsIncluded) {
            const overage = spec.targetUnits - spec.unitsIncluded;
            return `${monthly} + (${overage} × ${spec.overagePrice})`;
          }
          return monthly;
        
        case 'tiered':
          return `Tiered: ${spec.tiers?.map(t => 
            `$${t.unitPrice}/unit${t.upTo ? ` up to ${t.upTo}` : ' (no limit)'}`
          ).join(', ')}`;
        
        case 'credit':
          return `Credit packs: ${spec.creditPacks?.map(p => 
            `${p.size} credits for $${p.price}`
          ).join(', ')}`;
        
        case 'contact':
          return 'Custom pricing - contact sales';
        
        default:
          return 'Unknown pricing model';
      }
    }
  
    /**
     * Generate assumptions list
     */
    private generateAssumptions(spec: NormalizationSpec): string[] {
      const assumptions: string[] = [];
      
      // Billing period conversion
      if (spec.billingPeriod === 'annual' && spec.targetPeriod === 'monthly') {
        assumptions.push('Annual price divided by 12 for monthly equivalent');
      } else if (spec.billingPeriod === 'quarterly' && spec.targetPeriod === 'monthly') {
        assumptions.push('Quarterly price divided by 3 for monthly equivalent');
      }
      
      // Unit assumptions with proper pluralization
      const unitLabel = spec.targetUnits === 1 ? spec.unitBasis : `${spec.unitBasis}s`;
      assumptions.push(`Based on ${spec.targetUnits} ${unitLabel}`);
      
      // Included units
      if (spec.unitsIncluded > 0) {
        const includedLabel = spec.unitsIncluded === 1 ? spec.unitBasis : `${spec.unitBasis}s`;
        assumptions.push(`Includes ${spec.unitsIncluded} ${includedLabel} in base price`);
      }
      
      // Overage
      if (spec.overagePrice && spec.targetUnits > spec.unitsIncluded) {
        assumptions.push(`Overage calculated at ${spec.overagePrice} per additional ${spec.unitBasis}`);
      }
      
      // Minimum commitment
      if (spec.minimumCommitment) {
        const commitLabel = spec.minimumCommitment === 1 ? spec.unitBasis : `${spec.unitBasis}s`;
        assumptions.push(`Minimum commitment: ${spec.minimumCommitment} ${commitLabel}`);
      }
      
      // Regional
      assumptions.push('USD pricing for global region');
      assumptions.push('Excludes taxes and enterprise discounts');
      
      return assumptions;
    }
  
    /**
     * Parse number from various formats
     */
    private parseNumber(value: any): number | null {
      if (value === null || value === undefined) return null;
      if (typeof value === 'number') return value;
      
      // Handle string formats like "$100", "100.50", etc.
      if (typeof value === 'string') {
        const cleaned = value.replace(/[$,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      }
      
      return null;
    }
  
    /**
     * Parse tiers from raw data
     */
    private parseTiers(rawTiers: any): PricingTier[] | undefined {
      if (!rawTiers || !Array.isArray(rawTiers)) return undefined;
      
      return rawTiers.map(tier => ({
        upTo: tier.up_to || tier.upTo || tier.max || undefined,
        unitPrice: this.parseNumber(tier.price || tier.unit_price || tier.unitPrice) || 0
      }));
    }
  
    /**
     * Parse credit packs from raw data
     */
    private parseCreditPacks(rawPacks: any): CreditPack[] | undefined {
      if (!rawPacks || !Array.isArray(rawPacks)) return undefined;
      
      return rawPacks.map(pack => ({
        size: this.parseNumber(pack.credits || pack.size || pack.units) || 0,
        price: this.parseNumber(pack.price || pack.cost) || 0
      }));
    }
  
    /**
     * Create a normalized price fact from raw data
     */
    createPriceFact(
      planId: string,
      rawData: any,
      evidence: PriceEvidence,
      scrapeRunId: string | null = null
    ): Partial<PriceFact> {
      const spec = this.normalize(rawData, evidence);
      const verificationLevel = parseMethodToVerificationLevel(evidence.parse_method);
      
      return {
        plan_id: planId,
        scrape_run_id: scrapeRunId,
        cadence: spec.billingPeriod,
        base_price: spec.basePrice,
        // Only set unit_price for simple pricing model
        unit_price: spec.pricingModel === 'simple' ? spec.overagePrice : null,
        currency_code: 'USD',
        region: 'global',
        included_units: spec.unitsIncluded,
        unit_type: spec.unitBasis,
        overage_price: spec.overagePrice,
        minimum_commitment: spec.minimumCommitment,
        normalized_value: spec.normalizedValue,
        target_units: spec.targetUnits,
        target_period: spec.targetPeriod,
        confidence_score: spec.confidence,
        verification_level: verificationLevel,
        valid_from: new Date(),
        valid_to: null,
        observed_at: new Date()
      };
    }
  }