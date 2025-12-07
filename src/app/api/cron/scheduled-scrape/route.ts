// src/app/api/cron/scheduled-scrape/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { SchedulingService } from '@/lib/services/scheduling.service';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const schedulingService = new SchedulingService();

  try {
    // Verify this is a legitimate cron request from Vercel
    if (process.env.NODE_ENV === 'production') {
      const authHeader = headers().get('authorization');
      
      // Vercel sends the cron secret as Bearer token
      if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error('Unauthorized cron request - invalid or missing CRON_SECRET');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('🕐 Starting scheduled scrape job...');

    // Get vendors that need scraping using the service
    let vendors: any[] = [];
    try {
      vendors = await schedulingService.getVendorsForScheduledScrape();
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // If RPC doesn't exist, return success with 0 vendors
      return NextResponse.json({ 
        success: true,
        message: 'Scheduling not configured yet',
        vendors_scraped: 0
      });
    }

    if (vendors.length === 0) {
      console.log('No vendors need scraping at this time');
      
      try {
        await schedulingService.logCronExecution(
          '/api/cron/scheduled-scrape',
          'success',
          { vendors_queued: 0, vendors_failed: 0, message: 'No vendors need scraping' }
        );
      } catch (logError) {
        console.log('Could not log cron execution:', logError);
      }

      return NextResponse.json({ 
        success: true,
        message: 'No vendors need scraping',
        vendors_scraped: 0
      });
    }
    
    console.log(`Found ${vendors.length} vendors to scrape:`, 
      vendors.map((v: any) => v.name).join(', '));

    // Queue scraping jobs for each vendor
    let results: any[] = [];
    try {
      results = await schedulingService.queueScrapeJobs(vendors, 'scheduled');
    } catch (error) {
      console.error('Error queueing jobs:', error);
      return NextResponse.json({ 
        success: false,
        message: 'Failed to queue scraping jobs',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    // Trigger the worker to start processing
    // This is a fire-and-forget call to avoid timeout
    if (successCount > 0) {
      console.log('Triggering worker to process queued jobs...');
      
      // Use fetch with no await to make it non-blocking
      const workerUrl = new URL('/api/worker/process-jobs', request.url);
      fetch(workerUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          source: 'cron',
          max_jobs: successCount 
        })
      }).catch(err => {
        console.error('Failed to trigger worker (non-critical):', err);
      });
    }

    // Log the cron execution
    const duration = Date.now() - startTime;
    try {
      await schedulingService.logCronExecution(
        '/api/cron/scheduled-scrape',
        'success',
        {
          vendors_queued: successCount,
          vendors_failed: failureCount,
          results,
          duration_ms: duration
        }
      );
    } catch (logError) {
      console.log('Could not log cron execution:', logError);
    }

    return NextResponse.json({
      success: true,
      message: `Scheduled scrape completed in ${duration}ms`,
      vendors_queued: successCount,
      vendors_failed: failureCount,
      results
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    
    // Log the failure
    try {
      await schedulingService.logCronExecution(
        '/api/cron/scheduled-scrape',
        'error',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          duration_ms: Date.now() - startTime
        },
        error instanceof Error ? error.message : 'Unknown error'
      );
    } catch (logError) {
      console.log('Could not log error:', logError);
    }

    return NextResponse.json({ 
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}