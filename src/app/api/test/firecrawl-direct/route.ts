import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { VendorScrapeConfig } from '@/types/scraping';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const vendorSlug = body.vendor_slug || 'slack';
  
  // Get vendor
  const supabase = createClient();
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('slug', vendorSlug)
    .single();
    
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' });
  }
  
  // Direct test of Firecrawl
  const { default: FirecrawlScraper } = await import('@/lib/services/scrapers/firecrawl-scraper');
  
  const config: VendorScrapeConfig = {
    vendor_id: vendor.id,
    vendor_name: vendor.name,
    pricing_url: vendor.pricing_url,
    preferred_methods: ['firecrawl'],
    scrape_frequency: 'weekly',
    consecutive_failures: 0,
    max_failures_before_escalation: 3,
    estimated_cost_per_scrape: {
      playwright: 0,
      firecrawl: 0.01,
      vision: 0.02
    }
  };
  
  console.log('🔥 Testing Firecrawl directly for:', vendor.name);
  const result = await FirecrawlScraper.scrape(config);
  
  return NextResponse.json({
    success: result.status === 'success',
    vendor: vendor.name,
    result
  });
}