import { NextResponse } from 'next/server';

export async function GET() {
  const status: any = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      has_firecrawl_key: !!process.env.FIRECRAWL_API_KEY,
      has_openai_key: !!process.env.OPENAI_API_KEY,
    },
    scrapers: {
      playwright: false,
      firecrawl: false,
      vision: false,
      orchestrator: false
    },
    errors: []
  };

  // Test Playwright Scraper
  try {
    const PlaywrightScraper = await import('@/lib/services/scrapers/playwright-scraper');
    status.scrapers.playwright = !!PlaywrightScraper.default;
  } catch (e) {
    status.errors.push({
      scraper: 'playwright',
      error: e instanceof Error ? e.message : 'Unknown error'
    });
  }

  // Test Firecrawl Scraper
  try {
    const FirecrawlScraper = await import('@/lib/services/scrapers/firecrawl-scraper');
    status.scrapers.firecrawl = !!FirecrawlScraper.default;
  } catch (e) {
    status.errors.push({
      scraper: 'firecrawl',
      error: e instanceof Error ? e.message : 'Unknown error'
    });
  }

  // Test Vision Scraper
  try {
    const VisionScraper = await import('@/lib/services/scrapers/vision-scraper');
    status.scrapers.vision = !!VisionScraper.default;
  } catch (e) {
    status.errors.push({
      scraper: 'vision',
      error: e instanceof Error ? e.message : 'Unknown error'
    });
  }

  // Test Orchestrator
  try {
    const Orchestrator = await import('@/lib/services/scrapers/orchestrator');
    status.scrapers.orchestrator = !!Orchestrator.default;
    status.orchestrator_functions = Orchestrator.default ? Object.keys(Orchestrator.default) : [];
  } catch (e) {
    status.errors.push({
      scraper: 'orchestrator',
      error: e instanceof Error ? e.message : 'Unknown error'
    });
  }

  // Check for playwright package
  try {
    require.resolve('playwright');
    status.dependencies = { playwright: true };
  } catch {
    status.dependencies = { playwright: false };
  }

  return NextResponse.json(status);
}