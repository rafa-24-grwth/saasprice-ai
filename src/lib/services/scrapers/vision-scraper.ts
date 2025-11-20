// src/services/scrapers/vision-scraper.ts

import type { 
    VendorScrapeConfig, 
    ScrapeResult, 
    ScrapeStatus 
  } from '@/types/scraping';
  import SCRAPING_CONFIG from '@/config/scraping-budget';
  import { BrowserContext, Page } from 'playwright';
  
  // Import browser management functions from playwright-scraper
  // We need to export these functions from playwright-scraper first
  import { getBrowser, createStealthContext } from './playwright-scraper';
  
  /**
   * Vision API Scraper - Ultimate fallback using GPT-4 Vision
   * Costs $0.02 per page (estimated based on image tokens)
   * 
   * This is the most expensive but most reliable method.
   * It takes a screenshot and uses AI vision to extract pricing data.
   * 
   * Features:
   * - Works on any visual layout
   * - Handles complex designs and non-standard HTML
   * - Can read text from images
   * - Understands context and relationships visually
   */
  
  // OpenAI API configuration
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  
  // Retry configuration
  const RETRY_CONFIG = SCRAPING_CONFIG.retry.vision;
  
  /**
   * OpenAI Vision API types
   */
  interface VisionAPIRequest {
    model: string;
    messages: Array<{
      role: 'system' | 'user';
      content: string | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: {
          url: string;
          detail?: 'low' | 'high' | 'auto';
        };
      }>;
    }>;
    max_tokens?: number;
    temperature?: number;
  }
  
  interface VisionAPIResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
    error?: {
      message: string;
      type: string;
      code: string;
    };
  }
  
  /**
   * Take a screenshot using Playwright with reusable browser pool
   */
  async function captureScreenshot(url: string, config: VendorScrapeConfig): Promise<string> {
    let context: BrowserContext | null = null;
    let page: Page | null = null;
    
    try {
      console.log(`📸 Capturing screenshot of ${url}`);
      
      // Reuse the pooled browser and stealth context
      const browser = await getBrowser('chromium');
      context = await createStealthContext(browser);
      
      // Create page with larger viewport for better capture
      page = await context.newPage();
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // Wait for any specific selector if configured
      if (config.playwright?.wait_for) {
        await page.waitForSelector(config.playwright.wait_for, {
          timeout: 10000,
          state: 'visible'
        }).catch(() => {
          console.log('Wait selector not found, continuing...');
        });
      }
      
      // Additional wait for dynamic content
      await page.waitForTimeout(3000);
      
      // Scroll to load lazy content
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await page.waitForTimeout(1000);
      
      // Take full page screenshot
      const screenshot = await page.screenshot({
        fullPage: true,
        type: 'png'
      });
      
      // Convert to base64
      const base64 = screenshot.toString('base64');
      
      console.log(`✅ Screenshot captured (${Math.round(base64.length / 1024)}KB)`);
      
      return base64;
      
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      throw error;
    } finally {
      // Only close the page and context, NOT the browser (it's pooled)
      if (page) await page.close();
      if (context) await context.close();
    }
  }
  
  /**
   * Build the prompt for GPT-4 Vision
   */
  function buildVisionPrompt(vendorName: string): string {
    return `You are an expert at extracting pricing information from websites.
    
  Analyze this screenshot of ${vendorName}'s pricing page and extract ALL pricing tiers/plans.
  
  For each pricing tier, provide:
  1. Tier name (e.g., Free, Pro, Enterprise)
  2. Price in USD (as a number, e.g., 29.99)
  3. Billing period (monthly, yearly, one-time, or usage-based)
  4. List of main features (up to 10 key features)
  5. User/seat limits if mentioned
  
  Return the data as valid JSON in this exact format:
  {
    "pricing_tiers": [
      {
        "name": "Tier Name",
        "price": 29.99,
        "price_text": "$29.99/month",
        "billing_period": "monthly",
        "features": ["Feature 1", "Feature 2"],
        "user_limit": "Up to 5 users"
      }
    ],
    "currency": "USD",
    "notes": "Any special notes about pricing"
  }
  
  Important:
  - If price is "Contact Sales" or custom, set price to -1
  - If a tier is free, set price to 0
  - Extract prices in USD if possible, convert if shown in other currencies
  - Include any special promotions or discounts as notes`;
  }
  
  /**
   * Parse the Vision API response
   */
  function parseVisionResponse(
    response: string
  ): Array<{
    name: string;
    price: number;
    price_model: 'per_month' | 'per_year' | 'one_time' | 'usage_based';
    features?: string[];
    user_limit?: number;
    confidence: number;
  }> {
    try {
      // Extract JSON from the response (GPT might include extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const data = JSON.parse(jsonMatch[0]);
      
      if (!data.pricing_tiers || !Array.isArray(data.pricing_tiers)) {
        throw new Error('Invalid response structure');
      }
      
      // Convert to our format
      return data.pricing_tiers.map((tier: any) => ({
        name: tier.name || 'Unknown',
        price: typeof tier.price === 'number' ? tier.price : 0,
        price_model: 
          tier.billing_period === 'yearly' ? 'per_year' as const :
          tier.billing_period === 'one-time' ? 'one_time' as const :
          tier.billing_period === 'usage-based' ? 'usage_based' as const :
          'per_month' as const,
        features: tier.features || [],
        user_limit: tier.user_limit ? parseInt(tier.user_limit.replace(/\D/g, '')) : undefined,
        confidence: 0.85 // High confidence for Vision API
      }));
      
    } catch (error) {
      console.error('Failed to parse Vision API response:', error);
      
      // Return a basic result if parsing fails
      return [{
        name: 'Detected Pricing',
        price: 0,
        price_model: 'per_month',
        confidence: 0.4
      }];
    }
  }
  
  /**
   * Call OpenAI Vision API
   */
  async function callVisionAPI(
    screenshot: string,
    vendorName: string
  ): Promise<string> {
    const request: VisionAPIRequest = {
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a pricing data extraction expert. Always return valid JSON.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: buildVisionPrompt(vendorName)
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${screenshot}`,
                detail: 'high' // High detail for better accuracy
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.1 // Low temperature for consistent extraction
    };
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }
    
    const data: VisionAPIResponse = await response.json();
    
    if (data.error) {
      throw new Error(`Vision API error: ${data.error.message}`);
    }
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Vision API');
    }
    
    return data.choices[0].message.content;
  }
  
  /**
   * Main scraping function using Vision API
   */
  export async function scrapeWithVision(
    config: VendorScrapeConfig
  ): Promise<ScrapeResult> {
    const startTime = Date.now();
    
    const result: ScrapeResult = {
      vendor_id: config.vendor_id,
      method_used: 'vision',
      status: 'pending' as ScrapeStatus,
      started_at: new Date(),
      completed_at: new Date(),
      duration_ms: 0,
      actual_cost: 0.02 // Estimated cost for Vision API
    };
    
    // Check if API key is configured
    if (!OPENAI_API_KEY) {
      result.status = 'failed';
      result.error = {
        message: 'OpenAI API key not configured',
        code: 'MISSING_API_KEY',
        should_retry: false
      };
      result.completed_at = new Date();
      result.duration_ms = Date.now() - startTime;
      return result;
    }
    
    try {
      console.log(`🤖 Using Vision API for ${config.vendor_name} (last resort)`);
      
      // Step 1: Capture screenshot
      const screenshot = await captureScreenshot(config.pricing_url, config);
      
      // Step 2: Send to Vision API with retries
      let lastError: Error | null = null;
      let retries = RETRY_CONFIG.max_attempts;
      let visionResponse: string | null = null;
      
      while (retries > 0 && !visionResponse) {
        try {
          visionResponse = await callVisionAPI(screenshot, config.vendor_name);
          console.log('Vision API response received');
        } catch (error) {
          lastError = error as Error;
          retries--;
          
          if (retries > 0) {
            console.log(`⚠️ Vision API retry ${RETRY_CONFIG.max_attempts - retries}/${RETRY_CONFIG.max_attempts}`);
            const delay = RETRY_CONFIG.delay_ms * Math.pow(
              RETRY_CONFIG.backoff_multiplier,
              RETRY_CONFIG.max_attempts - retries
            );
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      if (!visionResponse && lastError) {
        throw lastError;
      }
      
      // Step 3: Parse response
      const tiers = parseVisionResponse(visionResponse!);
      
      if (tiers.length > 0) {
        result.status = 'success';
        result.data = {
          tiers,
          screenshot: `data:image/png;base64,${screenshot.substring(0, 100)}...` // Truncated for storage
        };
        
        result.metadata = {
          page_title: config.vendor_name + ' Pricing',
          detected_changes: false
        };
        
        console.log(`✅ Vision API extracted ${tiers.length} pricing tiers from ${config.vendor_name}`);
      } else {
        throw new Error('No pricing data extracted from screenshot');
      }
      
    } catch (error) {
      console.error(`❌ Vision API failed for ${config.vendor_name}:`, error);
      
      result.status = 'failed';
      result.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'VISION_EXTRACTION_FAILED',
        should_retry: false, // Vision is our last resort
        suggested_method: 'manual' // Suggest manual review if Vision fails
      };
    } finally {
      result.completed_at = new Date();
      result.duration_ms = Date.now() - startTime;
    }
    
    return result;
  }
  
  /**
   * Test Vision scraper
   */
  export async function testVisionScraper(url: string = 'https://stripe.com/pricing'): Promise<void> {
    const testConfig: VendorScrapeConfig = {
      vendor_id: 'test-vision',
      vendor_name: 'Test Vendor',
      pricing_url: url,
      preferred_methods: ['vision'],
      scrape_frequency: 'monthly',
      consecutive_failures: 0,
      max_failures_before_escalation: 1,
      estimated_cost_per_scrape: {
        playwright: 0,
        firecrawl: 0.01,
        vision: 0.02
      }
    };
    
    const result = await scrapeWithVision(testConfig);
    console.log('Vision test result:', JSON.stringify(result, null, 2));
  }
  
  // Export for use in the scraping orchestrator
  export default {
    scrape: scrapeWithVision,
    test: testVisionScraper
  };