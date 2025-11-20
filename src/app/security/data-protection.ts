// src/lib/security/data-protection.ts

export const DataProtection = {
    // Only expose these fields publicly
    PUBLIC_VENDOR_FIELDS: ['id', 'name', 'logo_url', 'category'],
    
    // Never expose these fields publicly
    PRIVATE_FIELDS: ['pricing_url', 'scrape_config', 'api_keys', 'internal_notes'],
    
    // Rate limits per tier
    RATE_LIMITS: {
      public: { requests: 10, window: '1m' },
      authenticated: { requests: 100, window: '1m' },
      premium: { requests: 1000, window: '1m' }
    },
    
    // Data access levels by subscription
    SUBSCRIPTION_ACCESS: {
      free: {
        vendors: 20,
        comparisons: 10,
        priceHistory: false,
        features: false,
        tiers: ['free', 'starter', 'basic']
      },
      pro: {
        vendors: 'unlimited',
        comparisons: 100,
        priceHistory: false,
        features: true,
        tiers: 'all'
      },
      enterprise: {
        vendors: 'unlimited',
        comparisons: 'unlimited',
        priceHistory: true,
        features: true,
        tiers: 'all'
      }
    }
  };