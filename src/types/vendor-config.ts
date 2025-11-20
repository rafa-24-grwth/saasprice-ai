/**
 * Vendor configuration schema using Zod for validation
 */

import { z } from 'zod';

/**
 * Schema for scrape hints
 */
const ScrapeHintsSchema = z.object({
  /** CSS selector for the pricing section */
  selector_base: z.string().min(1, 'Selector base is required'),
  
  /** Boolean flags - all required */
  has_tiers: z.boolean(),
  has_free_tier: z.boolean(),
  has_usage_based: z.boolean(),
  
  /** Default billing period */
  billing_default: z.enum(['monthly', 'annual', 'quarterly']),
  
  /** Unit type for pricing (seats, users, hosts, etc.) */
  units: z.string().min(1, 'Units specification is required'),
  
  /** Optional: Indicates complex pricing that may need manual review */
  complex_pricing: z.boolean().optional(),
});

/**
 * Schema for vendor configuration entry
 */
const VendorConfigSchema = z.object({
  /** Unique slug for URL and identification */
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  
  /** Display name */
  name: z.string().min(1, 'Name is required'),
  
  /** Category for grouping */
  category: z.string().min(1, 'Category is required'),
  
  /** Official pricing page URL */
  pricing_url: z.string().url('Invalid pricing URL'),
  
  /** Priority for scraping (1 = highest) */
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  
  /** Hints for the scraper */
  scrape_hints: ScrapeHintsSchema,
});

/**
 * Root configuration schema
 */
const VendorConfigYamlSchema = z.object({
  vendors: z.array(VendorConfigSchema),
});

/**
 * Inferred TypeScript types from schemas
 */
export type ScrapeHints = z.infer<typeof ScrapeHintsSchema>;
export type VendorConfig = z.infer<typeof VendorConfigSchema>;
export type VendorConfigYaml = z.infer<typeof VendorConfigYamlSchema>;

/**
 * Validate a single vendor config (type guard)
 */
export function isValidVendorConfig(config: unknown): config is VendorConfig {
  const result = VendorConfigSchema.safeParse(config);
  return result.success;
}

/**
 * Validate entire vendor configuration with detailed errors
 */
export function validateVendorConfig(config: unknown): { 
  valid: boolean; 
  errors: string[];
  data?: VendorConfigYaml;
} {
  const result = VendorConfigYamlSchema.safeParse(config);
  
  if (result.success) {
    return { 
      valid: true, 
      errors: [],
      data: result.data
    };
  }
  
  // Format Zod errors into readable messages
  const errors = result.error.errors.map(error => {
    const path = error.path.join('.');
    const vendorIndex = error.path[1] as number | undefined;
    
    if (typeof vendorIndex === 'number') {
      // Try to get vendor name for better error messages
      const vendors = (config as any)?.vendors;
      const vendorName = vendors?.[vendorIndex]?.name || vendors?.[vendorIndex]?.slug || `index ${vendorIndex}`;
      return `Vendor "${vendorName}" - ${path}: ${error.message}`;
    }
    
    return `${path}: ${error.message}`;
  });
  
  return {
    valid: false,
    errors
  };
}

/**
 * Parse and validate YAML config from string
 */
export function parseVendorConfig(yamlString: string): {
  valid: boolean;
  errors: string[];
  data?: VendorConfigYaml;
} {
  try {
    // This will be imported from js-yaml
    const yaml = require('js-yaml');
    const parsed = yaml.load(yamlString);
    return validateVendorConfig(parsed);
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Export schemas for reuse if needed
 */
export const schemas = {
  ScrapeHints: ScrapeHintsSchema,
  VendorConfig: VendorConfigSchema,
  VendorConfigYaml: VendorConfigYamlSchema,
} as const;