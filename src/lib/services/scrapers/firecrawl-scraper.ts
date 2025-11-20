// src/lib/services/scrapers/firecrawl-scraper.ts

import type { 
  VendorScrapeConfig, 
  ScrapeResult, 
  ScrapeStatus 
} from '@/types/scraping';
import SCRAPING_CONFIG from '@/config/scraping-budget';

/**
 * Firecrawl Scraper - Paid fallback for complex JavaScript-heavy sites
 * Costs $0.01 per page (1 credit)
 * 
 * Features:
 * - Handles complex JavaScript rendering
 * - Advanced anti-bot bypass
 * - LLM-powered data extraction
 * - Markdown and HTML extraction
 */

// Firecrawl API configuration
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v0'; // v0 is the stable API
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

// Retry configuration specific to Firecrawl
const RETRY_CONFIG = SCRAPING_CONFIG.retry.firecrawl;

/**
 * Firecrawl v0 API types
 */
interface FirecrawlScrapeRequest {
  url: string;
  pageOptions?: {
    includeMarkdown?: boolean;
    includeHtml?: boolean;
    onlyMainContent?: boolean;
    includeRawHtml?: boolean;
    screenshot?: boolean;
    waitFor?: number;
    removeTags?: string[];
    onlyIncludeTags?: string[];
  };
  extractorOptions?: {
    mode?: 'markdown' | 'llm-extraction' | 'llm-extraction-from-raw-html';
    extractionPrompt?: string;
    extractionSchema?: Record<string, any>;
  };
}

interface FirecrawlResponse {
  success: boolean;
  data?: {
    content?: string;
    markdown?: string;
    html?: string;
    rawHtml?: string;
    screenshot?: string;
    metadata?: {
      title?: string;
      description?: string;
      language?: string;
      ogLocaleAlternate?: string[];
      sourceURL?: string;
      statusCode?: number;
      error?: string;
    };
    llm_extraction?: Record<string, any>;
    extractedData?: any;
  };
  error?: string;
  warning?: string;
}

/**
 * Extract pricing data from Firecrawl response
 */
function extractPricingFromResponse(
  response: FirecrawlResponse
): Array<{
  name: string;
  price: number;
  price_model: 'per_month' | 'per_year' | 'one_time' | 'usage_based';
  features?: string[];
  confidence: number;
}> {
  const tiers: Array<{
    name: string;
    price: number;
    price_model: 'per_month' | 'per_year' | 'one_time' | 'usage_based';
    features?: string[];
    confidence: number;
  }> = [];
  
  // Check if we have LLM-extracted data
  const extractedData = response.data?.llm_extraction || response.data?.extractedData;
  if (extractedData?.pricing_plans) {
    for (const plan of extractedData.pricing_plans) {
      let priceModel: 'per_month' | 'per_year' | 'one_time' | 'usage_based' = 'per_month';
      if (plan.billing_period === 'yearly' || plan.billing_period === 'annual') {
        priceModel = 'per_year';
      } else if (plan.billing_period === 'one-time') {
        priceModel = 'one_time';
      } else if (plan.billing_period === 'usage-based') {
        priceModel = 'usage_based';
      }
      
      tiers.push({
        name: plan.name || 'Unknown Plan',
        price: plan.price || parsePrice(plan.price_display || plan.price_text || '0'),
        price_model: priceModel,
        features: plan.features || [],
        confidence: 0.9
      });
    }
    return tiers;
  }
  
  // Fallback to markdown parsing
  const markdown = response.data?.markdown || response.data?.content || '';
  if (markdown) {
    // Parse markdown for pricing patterns
    const priceRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
    const matches = [...markdown.matchAll(priceRegex)];
    
    // Look for section headers near prices
    const lines = markdown.split('\n');
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Track section headers
      if (line.startsWith('#')) {
        currentSection = line.replace(/^#+\s*/, '').trim();
      }
      
      // Look for price mentions
      const priceMatch = line.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(/,/g, ''));
        const name = currentSection || `Plan $${price}`;
        
        // Determine billing period from context
        let priceModel: 'per_month' | 'per_year' | 'one_time' | 'usage_based' = 'per_month';
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('year') || lowerLine.includes('annual')) {
          priceModel = 'per_year';
        } else if (lowerLine.includes('one-time') || lowerLine.includes('lifetime')) {
          priceModel = 'one_time';
        } else if (lowerLine.includes('usage') || lowerLine.includes('credit')) {
          priceModel = 'usage_based';
        }
        
        // Check if this price is already added (avoid duplicates)
        const exists = tiers.some(t => t.price === price && t.name === name);
        if (!exists) {
          tiers.push({
            name,
            price,
            price_model: priceModel,
            confidence: 0.6
          });
        }
      }
    }
  }
  
  return tiers;
}

/**
 * Parse price from text
 */
function parsePrice(text: string): number {
  if (!text) return 0;
  
  // Remove currency symbols and extract number
  const cleaned = text.replace(/[^\d.,]/g, '');
  const price = parseFloat(cleaned.replace(/,/g, ''));
  
  return isNaN(price) ? 0 : price;
}

/**
 * Main scraping function using Firecrawl
 */
export async function scrapeWithFirecrawl(
  config: VendorScrapeConfig,
  useStealthMode: boolean = false
): Promise<ScrapeResult> {
  const startTime = Date.now();
  
  const result: ScrapeResult = {
    vendor_id: config.vendor_id,
    method_used: 'firecrawl',
    status: 'pending' as ScrapeStatus,
    started_at: new Date(),
    completed_at: new Date(),
    duration_ms: 0,
    actual_cost: 0.01,
  };
  
  // Check if API key is configured
  if (!FIRECRAWL_API_KEY) {
    result.status = 'failed';
    result.error = {
      message: 'Firecrawl API key not configured. Get one at https://firecrawl.dev',
      code: 'MISSING_API_KEY',
      should_retry: false
    };
    result.completed_at = new Date();
    result.duration_ms = Date.now() - startTime;
    return result;
  }
  
  try {
    console.log(`🔥 Scraping ${config.vendor_name} with Firecrawl`);
    console.log(`📍 URL: ${config.pricing_url}`);
    
    // Build request - simpler format for v0 API
    const requestBody: FirecrawlScrapeRequest = {
      url: config.pricing_url,
      pageOptions: {
        includeMarkdown: true,
        includeHtml: false,
        onlyMainContent: true,
        waitFor: 3000,
        screenshot: false
      },
      extractorOptions: {
        mode: 'llm-extraction',
        extractionPrompt: `Extract all pricing plans from this page. For each plan include:
          - Plan name (e.g., Free, Pro, Enterprise)
          - Price as a number
          - Price display text (e.g., "$29/month")
          - Billing period (monthly, yearly, one-time, usage-based)
          - List of features
          - Any limitations or user limits
          Return as structured JSON with a 'pricing_plans' array.`,
        extractionSchema: {
          type: 'object',
          properties: {
            pricing_plans: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' },
                  price_display: { type: 'string' },
                  billing_period: { type: 'string' },
                  features: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  user_limit: { type: 'string' }
                }
              }
            }
          }
        }
      }
    };
    
    // Make API request
    const response = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseText = await response.text();
    let data: FirecrawlResponse;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse Firecrawl response: ${responseText.substring(0, 200)}`);
    }
    
    if (!response.ok) {
      throw new Error(`Firecrawl API error (${response.status}): ${data.error || responseText.substring(0, 200)}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Firecrawl scraping failed');
    }
    
    // Extract pricing data
    const tiers = extractPricingFromResponse(data);
    
    // Even if no structured data, we got markdown content
    if (tiers.length > 0 || data.data?.markdown) {
      result.status = 'success';
      result.data = {
        tiers,
        raw_html: data.data?.html
      };
      
      result.metadata = {
        page_title: data.data?.metadata?.title,
        detected_changes: false
      };
      
      if (tiers.length > 0) {
        console.log(`✅ Firecrawl found ${tiers.length} pricing tiers for ${config.vendor_name}`);
        tiers.forEach(tier => {
          console.log(`   - ${tier.name}: $${tier.price} (${tier.price_model})`);
        });
      } else {
        console.log(`⚠️ Firecrawl got content but couldn't extract structured pricing for ${config.vendor_name}`);
        console.log(`   Content length: ${data.data?.markdown?.length || 0} characters`);
      }
    } else {
      throw new Error('No content retrieved from page');
    }
    
  } catch (error) {
    console.error(`❌ Firecrawl failed for ${config.vendor_name}:`, error);
    
    result.status = 'failed';
    result.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error ? error.name : 'UNKNOWN',
      should_retry: true,
      suggested_method: 'vision'
    };
  } finally {
    result.completed_at = new Date();
    result.duration_ms = Date.now() - startTime;
  }
  
  return result;
}

/**
 * Test Firecrawl scraper
 */
export async function testFirecrawlScraper(url: string = 'https://stripe.com/pricing'): Promise<void> {
  const testConfig: VendorScrapeConfig = {
    vendor_id: 'test-firecrawl',
    vendor_name: 'Test Vendor',
    pricing_url: url,
    preferred_methods: ['firecrawl'],
    scrape_frequency: 'weekly',
    consecutive_failures: 0,
    max_failures_before_escalation: 2,
    estimated_cost_per_scrape: {
      playwright: 0,
      firecrawl: 0.01,
      vision: 0.02
    }
  };
  
  const result = await scrapeWithFirecrawl(testConfig, false);
  console.log('Firecrawl test result:', JSON.stringify(result, null, 2));
}

// Export for use in the scraping orchestrator
export default {
  scrape: scrapeWithFirecrawl,
  test: testFirecrawlScraper
};