// src/app/api/test/orchestrator/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { VendorScrapeConfig, ScrapingMethod } from '@/types/scraping';

export async function GET() {
  const results: any = {
    import_test: {},
    vendors_available: []
  };

  // Test imports
  try {
    const OrchestratorModule = await import('@/lib/services/scrapers/orchestrator');
    results.import_test.success = true;
    results.import_test.has_default = !!OrchestratorModule.default;
    results.import_test.has_scrapeVendor = !!(OrchestratorModule.default?.scrapeVendor);
  } catch (e) {
    results.import_test.success = false;
    results.import_test.error = e instanceof Error ? e.message : 'Unknown error';
  }

  // Get available vendors
  try {
    const supabase = createClient();
    const { data: vendors } = await supabase
      .from('vendors')
      .select('slug, name, is_active')
      .eq('is_active', true)
      .limit(10);
    
    results.vendors_available = vendors || [];
  } catch (e) {
    results.vendors_error = e instanceof Error ? e.message : 'Unknown error';
  }

  return NextResponse.json({
    ...results,
    instructions: "Use POST to actually run a scrape test",
    example: "curl -X POST /api/test/orchestrator -d '{\"vendor_slug\": \"slack\"}'",
    firecrawl_configured: !!process.env.FIRECRAWL_API_KEY
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const vendorSlug = body.vendor_slug || 'slack';
    const forceMethod = body.force_method as ScrapingMethod | undefined;
    
    console.log('🧪 Testing scraper with vendor:', vendorSlug);
    
    // Get vendor from database
    const supabase = createClient();
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('slug', vendorSlug)
      .single();
      
    if (vendorError || !vendor) {
      const { data: availableVendors } = await supabase
        .from('vendors')
        .select('slug, name')
        .eq('is_active', true)
        .limit(10);
        
      return NextResponse.json({
        success: false,
        error: `Vendor "${vendorSlug}" not found`,
        available_vendors: availableVendors || [],
        hint: "Try one of the available vendors listed above"
      }, { status: 404 });
    }
    
    // Determine which methods to use - properly typed
    let preferredMethods: ScrapingMethod[] = ['playwright', 'firecrawl'];
    if (forceMethod) {
      preferredMethods = [forceMethod];
    }
    
    // Create config for orchestrator
    const config: VendorScrapeConfig = {
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      pricing_url: vendor.pricing_url,
      preferred_methods: preferredMethods,
      scrape_frequency: 'weekly',
      consecutive_failures: vendor.consecutive_failures || 0,
      max_failures_before_escalation: 3,
      estimated_cost_per_scrape: {
        playwright: 0,
        firecrawl: 0.01,
        vision: 0.02
      },
      playwright: {
        selectors: {
          price: '[class*="price"], [data-price], .pricing',
          tier_name: '[class*="plan"], [class*="tier"], h3, h2',
          features: 'li, [class*="feature"]',
          container: '[class*="pricing-card"], [class*="plan-card"], [class*="price-box"]'
        },
        timeout: 30000,
        requires_javascript: true,
        wait_for: '[class*="pricing"], [class*="price"], main'
      }
    };
    
    // Import and run orchestrator
    const { default: Orchestrator } = await import('@/lib/services/scrapers/orchestrator');
    
    console.log('📦 Running orchestrator for:', vendor.name);
    console.log('🔗 URL:', vendor.pricing_url);
    console.log('🎯 Methods to try:', preferredMethods.join(' → '));
    
    // First attempt with Playwright (or forced method)
    let result = await Orchestrator.scrapeVendor(config, {
      force: true,
      allow_paid: forceMethod === 'firecrawl',
      max_attempts: 1
    });
    
    // If Playwright failed and we have Firecrawl configured, try it
    if (result.status === 'failed' && 
        result.error?.suggested_method === 'firecrawl' && 
        process.env.FIRECRAWL_API_KEY &&
        !forceMethod) {
      
      console.log('🔄 Playwright failed, trying Firecrawl fallback...');
      
      // Update config to use Firecrawl
      config.preferred_methods = ['firecrawl'] as ScrapingMethod[];
      
      // Try with Firecrawl
      result = await Orchestrator.scrapeVendor(config, {
        force: true,
        allow_paid: true,
        max_attempts: 1
      });
    }
    
    console.log('✨ Scrape completed with status:', result.status);
    
    // Log pricing if found
    if (result.status === 'success' && result.data?.tiers) {
      console.log(`📊 Found ${result.data.tiers.length} pricing tiers:`);
      result.data.tiers.forEach((tier: any) => {
        console.log(`   - ${tier.name}: $${tier.price} (${tier.price_model || 'per_month'})`);
      });
    }
    
    return NextResponse.json({
      success: result.status === 'success',
      vendor: {
        id: vendor.id,
        name: vendor.name,
        slug: vendor.slug,
        url: vendor.pricing_url
      },
      result: {
        status: result.status,
        method_used: result.method_used,
        duration_ms: result.duration_ms,
        cost: result.actual_cost,
        data: result.data,
        error: result.error
      },
      database_updated: result.status === 'success',
      timestamp: new Date().toISOString(),
      firecrawl_available: !!process.env.FIRECRAWL_API_KEY
    });
    
  } catch (error) {
    console.error('❌ Orchestrator test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      hint: "Check the terminal for more details"
    }, { status: 500 });
  }
}