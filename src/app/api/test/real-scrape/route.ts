import { NextResponse } from 'next/server';
import type { VendorScrapeConfig } from '@/types/scraping';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Create a test config for Stripe
    const testConfig: VendorScrapeConfig = {
      vendor_id: 'stripe',
      vendor_name: 'Stripe',
      pricing_url: 'https://stripe.com/pricing',
      preferred_methods: ['playwright'],
      scrape_frequency: 'weekly',
      consecutive_failures: 0,
      max_failures_before_escalation: 3,
      estimated_cost_per_scrape: {
        playwright: 0,
        firecrawl: 0.01,
        vision: 0.02
      }
    };

    console.log('Loading orchestrator...');
    const { default: Orchestrator } = await import('@/lib/services/scrapers/orchestrator');
    
    console.log('Starting real scrape test...');
    const result = await Orchestrator.scrapeVendor(testConfig, {
      force: false,
      allow_paid: true,
      max_attempts: 1,
      session_id: 'test_session'
    });
    
    console.log('Scrape completed!');
    
    return NextResponse.json({
      success: true,
      result
    });
    
  } catch (error) {
    console.error('Test scrape failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}