// src/lib/services/scrapers/playwright-scraper.ts

import { chromium, firefox, webkit, Browser, Page, BrowserContext } from 'playwright';
import type { 
  VendorScrapeConfig, 
  ScrapeResult, 
  ScrapeStatus 
} from '@/types/scraping';
import SCRAPING_CONFIG from '@/config/scraping-budget';

// Access the retry config from the main config object
const RETRY_CONFIG = SCRAPING_CONFIG.retry;

/**
 * Playwright Scraper - FREE scraping using headless browsers
 * This is our primary scraping method that costs $0
 * 
 * Note: The confidence scores generated here represent data quality only.
 * The final trust score is calculated in the trust system by combining:
 * - Verification level (BASIC/MONITORED/VERIFIED)
 * - Data freshness
 * - Source count
 * - Data quality (from this scraper)
 */

// Browser pool for reusing instances
let browserPool: Map<string, Browser> = new Map();

/**
 * Get or create a browser instance
 */
async function getBrowser(browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium'): Promise<Browser> {
  const key = browserType;
  
  if (browserPool.has(key)) {
    const browser = browserPool.get(key)!;
    if (browser.isConnected()) {
      return browser;
    }
  }
  
  console.log(`🚀 Launching ${browserType} browser...`);
  
  // FIXED: Mac-compatible launch options
  const launchOptions: any = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled'
    ]
  };
  
  // Remove problematic args for Mac
  if (process.platform === 'darwin') {
    // Mac-specific configuration
    launchOptions.ignoreDefaultArgs = ['--enable-automation'];
    // Don't use single-process or no-zygote on Mac
  } else {
    // Keep original args for Linux/Docker
    launchOptions.args.push('--single-process', '--no-zygote');
  }
  
  let browser: Browser;
  
  try {
    switch (browserType) {
      case 'firefox':
        browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        browser = await webkit.launch(launchOptions);
        break;
      case 'chromium':
      default:
        browser = await chromium.launch(launchOptions);
        break;
    }
  } catch (error) {
    console.error(`Failed to launch ${browserType}, trying minimal config...`);
    // Fallback to minimal configuration
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu']
    });
  }
  
  browserPool.set(key, browser);
  return browser;
}

/**
 * Create a stealth browser context to avoid detection
 */
async function createStealthContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: getRandomUserAgent(),
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
    // Add more realistic browser properties
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
  });
  
  // Inject scripts to avoid detection
  await context.addInitScript(() => {
    // Override navigator.webdriver
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
    
    // Override plugins to look more realistic
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    
    // Override permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters: any) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: 'denied' } as PermissionStatus) :
        originalQuery(parameters)
    );
  });
  
  return context;
}

/**
 * Get a random user agent for stealth
 */
function getRandomUserAgent(): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];
  
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Wait for page to be ready
 */
async function waitForPageReady(page: Page, config: VendorScrapeConfig): Promise<void> {
  // Wait for specific selector if provided
  if (config.playwright?.wait_for) {
    await page.waitForSelector(config.playwright.wait_for, {
      timeout: config.playwright.timeout || 30000,
      state: 'visible',
    });
  } else {
    // Default wait strategies
    await Promise.race([
      page.waitForLoadState('networkidle'),
      page.waitForTimeout(5000), // Max 5 seconds
    ]);
  }
  
  // Additional wait for dynamic content
  if (config.playwright?.requires_javascript) {
    await page.waitForTimeout(2000);
  }
}

/**
 * Extract pricing data from the page
 */
async function extractPricingData(
  page: Page, 
  config: VendorScrapeConfig
): Promise<Array<{
  name: string;
  price: number;
  price_model: 'per_month' | 'per_year' | 'one_time' | 'usage_based';
  features?: string[];
  confidence: number;
}>> {
  const selectors = config.playwright?.selectors || {};
  const results = [];
  
  try {
    // If we have a container selector, find all pricing cards
    if (selectors.container) {
      const containers = await page.$$(selectors.container);
      
      for (const container of containers) {
        const tier: any = {};
        
        // Extract tier name
        if (selectors.tier_name) {
          const nameEl = await container.$(selectors.tier_name);
          if (nameEl) {
            tier.name = await nameEl.textContent();
            tier.name = tier.name?.trim() || 'Unknown';
          }
        }
        
        // Extract price
        if (selectors.price) {
          const priceEl = await container.$(selectors.price);
          if (priceEl) {
            const priceText = await priceEl.textContent();
            tier.price = extractPriceFromText(priceText || '');
            tier.price_model = detectPriceModel(priceText || '');
          }
        }
        
        // Extract features if available
        if (selectors.features) {
          const featureEls = await container.$$(selectors.features);
          tier.features = [];
          for (const featureEl of featureEls) {
            const text = await featureEl.textContent();
            if (text) tier.features.push(text.trim());
          }
        }
        
        // Calculate confidence based on data completeness
        // This is a data quality score that will be combined with our trust factors
        tier.confidence = calculateDataQualityConfidence(tier);
        
        if (tier.name && tier.price !== undefined) {
          results.push(tier);
        }
      }
    } else {
      // Fallback: Try to find pricing using common patterns
      const pricingData = await page.evaluate(() => {
        const prices: any[] = [];
        
        // Common pricing selectors
        const priceSelectors = [
          '[class*="price"]',
          '[class*="pricing"]',
          '[data-price]',
          '[class*="cost"]',
          '[class*="plan"]',
        ];
        
        for (const selector of priceSelectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el: any) => {
            const text = el.textContent || '';
            if (text.match(/\$|\€|\£|USD|EUR|GBP/)) {
              prices.push({
                text: text.trim(),
                html: el.innerHTML,
              });
            }
          });
        }
        
        return prices;
      });
      
      // Process found pricing data
      for (const data of pricingData) {
        const price = extractPriceFromText(data.text);
        if (price > 0) {
          results.push({
            name: 'Detected Plan',
            price,
            price_model: detectPriceModel(data.text),
            confidence: 0.5, // Lower confidence for auto-detected
          });
        }
      }
    }
  } catch (error) {
    console.error('Error extracting pricing data:', error);
  }
  
  return results;
}

/**
 * Extract price from text
 */
function extractPriceFromText(text: string): number {
  // Remove all spaces and normalize
  const normalized = text.replace(/\s/g, '').toUpperCase();
  
  // Match various price patterns
  const patterns = [
    /\$([0-9,]+\.?\d*)/,  // $99.99
    /([0-9,]+\.?\d*)\$/,  // 99.99$
    /USD\s*([0-9,]+\.?\d*)/, // USD 99.99
    /€([0-9,]+\.?\d*)/,   // €99.99
    /£([0-9,]+\.?\d*)/,   // £99.99
  ];
  
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const price = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(price)) return price;
    }
  }
  
  return 0;
}

/**
 * Detect pricing model from text
 */
function detectPriceModel(text: string): 'per_month' | 'per_year' | 'one_time' | 'usage_based' {
  const lower = text.toLowerCase();
  
  if (lower.includes('/mo') || lower.includes('month') || lower.includes('mensual')) {
    return 'per_month';
  }
  if (lower.includes('/yr') || lower.includes('year') || lower.includes('annual')) {
    return 'per_year';
  }
  if (lower.includes('one-time') || lower.includes('lifetime') || lower.includes('once')) {
    return 'one_time';
  }
  if (lower.includes('usage') || lower.includes('pay as') || lower.includes('credit')) {
    return 'usage_based';
  }
  
  return 'per_month'; // Default
}

/**
 * Calculate confidence score for extracted data using our trust system
 */
function calculateDataQualityConfidence(tier: any): number {
  // Calculate a data quality score (0-1) based on completeness
  let dataQuality = 0;
  
  // Has valid name (30% weight)
  if (tier.name && tier.name !== 'Unknown' && tier.name !== 'Detected Plan') {
    dataQuality += 0.3;
  }
  
  // Has valid price (40% weight - most important)
  if (tier.price && tier.price > 0 && tier.price < 100000) { // Sanity check on price
    dataQuality += 0.4;
  }
  
  // Has features (20% weight)
  if (tier.features && tier.features.length > 0) {
    dataQuality += 0.2;
  }
  
  // Has clear price model (10% weight)
  if (tier.price_model && tier.price_model !== 'per_month') { // per_month is default
    dataQuality += 0.1;
  }
  
  return dataQuality;
}

/**
 * Main scraping function using Playwright
 */
export async function scrapeWithPlaywright(
  config: VendorScrapeConfig
): Promise<ScrapeResult> {
  const startTime = Date.now();
  
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  
  const result: ScrapeResult = {
    vendor_id: config.vendor_id,
    method_used: 'playwright',
    status: 'pending' as ScrapeStatus,
    started_at: new Date(),
    completed_at: new Date(),
    duration_ms: 0,
    actual_cost: 0, // Always free!
  };
  
  try {
    // Get browser (prefer Chromium for compatibility)
    browser = await getBrowser('chromium');
    
    // Create stealth context
    context = await createStealthContext(browser);
    
    // Create page
    page = await context.newPage();
    
    // Block unnecessary resources to speed up loading
    await page.route('**/*', (route: any) => {
      const blockedTypes = ['image', 'media', 'font', 'other'];
      if (blockedTypes.includes(route.request().resourceType())) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    console.log(`🔍 Scraping ${config.vendor_name} at ${config.pricing_url}`);
    
    // Navigate to the page with retry logic
    let retries = RETRY_CONFIG.playwright.max_attempts;
    let lastError: Error | null = null;
    
    while (retries > 0) {
      try {
        await page.goto(config.pricing_url, {
          waitUntil: 'domcontentloaded',
          timeout: RETRY_CONFIG.playwright.timeout_ms,
        });
        
        // Wait for page to be ready
        await waitForPageReady(page, config);
        
        // Extract pricing data
        const tiers = await extractPricingData(page, config);
        
        if (tiers.length > 0) {
          // Success!
          result.status = 'success';
          result.data = {
            tiers,
            raw_html: await page.content(),
          };
          
          // Add metadata
          result.metadata = {
            page_title: await page.title(),
            detected_changes: false, // TODO: Implement change detection
          };
          
          console.log(`✅ Successfully scraped ${config.vendor_name}: Found ${tiers.length} pricing tiers`);
          break;
        } else {
          throw new Error('No pricing data found');
        }
      } catch (error) {
        lastError = error as Error;
        retries--;
        
        if (retries > 0) {
          console.log(`⚠️ Retry ${RETRY_CONFIG.playwright.max_attempts - retries}/${RETRY_CONFIG.playwright.max_attempts} for ${config.vendor_name}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.playwright.delay_ms));
        }
      }
    }
    
    // If all retries failed
    if (result.status !== 'success' && lastError) {
      throw lastError;
    }
    
  } catch (error) {
    console.error(`❌ Failed to scrape ${config.vendor_name}:`, error);
    
    result.status = 'failed';
    result.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error ? error.name : 'UNKNOWN',
      should_retry: true,
      suggested_method: 'firecrawl', // Suggest escalation
    };
  } finally {
    // Cleanup
    if (page) await page.close();
    if (context) await context.close();
    // Don't close browser - keep it in pool for reuse
    
    result.completed_at = new Date();
    result.duration_ms = Date.now() - startTime;
  }
  
  return result;
}

/**
 * Clean up browser pool
 */
export async function cleanupBrowsers(): Promise<void> {
  console.log('🧹 Cleaning up browser pool...');
  
  for (const [key, browser] of browserPool.entries()) {
    try {
      await browser.close();
    } catch (error) {
      console.error(`Error closing browser ${key}:`, error);
    }
  }
  
  browserPool.clear();
}

/**
 * Test scraper with a specific vendor
 */
export async function testPlaywrightScraper(vendorId: string = 'test'): Promise<void> {
  const testConfig: VendorScrapeConfig = {
    vendor_id: vendorId,
    vendor_name: 'Test Vendor',
    pricing_url: 'https://example.com/pricing',
    preferred_methods: ['playwright'],
    scrape_frequency: 'daily',
    consecutive_failures: 0,
    max_failures_before_escalation: 3,
    estimated_cost_per_scrape: {
      playwright: 0,
      firecrawl: 0.01,
      vision: 0.02,
    },
    playwright: {
      selectors: {
        container: '.pricing-card',
        tier_name: '.plan-name',
        price: '.price',
        features: '.feature-item',
      },
      wait_for: '.pricing-container',
      timeout: 30000,
      requires_javascript: true,
    },
  };
  
  const result = await scrapeWithPlaywright(testConfig);
  console.log('Test result:', JSON.stringify(result, null, 2));
}

// Export for use in other scrapers (like vision-scraper)
export { getBrowser, createStealthContext };

// Export for use in the scraping orchestrator
export default {
  scrape: scrapeWithPlaywright,
  cleanup: cleanupBrowsers,
  test: testPlaywrightScraper,
};