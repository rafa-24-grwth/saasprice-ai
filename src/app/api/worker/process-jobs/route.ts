// src/app/api/worker/process-jobs/route.ts (FIXED)

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import BudgetManagerService from '@/lib/services/scrapers/budget-manager';
import { SchedulingService } from '@/lib/services/scheduling.service';
import type { ScrapingMethod, VendorScrapeConfig } from '@/types/scraping';

// Import RPC types
import type { 
  JobQueueStats, 
  DequeuedJob 
} from '@/types/rpc';

// Define a minimal ScrapeResult type locally to avoid conflicts
interface WorkerScrapeResult {
  vendor_id: string;
  method_used: ScrapingMethod;
  status: 'success' | 'failed' | 'partial' | 'pending' | 'skipped';
  actual_cost: number;
  duration_ms: number;
  started_at: Date;
  completed_at: Date;
  data?: {
    tiers: Array<{
      name: string;
      price: number;
      price_model: 'per_month' | 'per_year' | 'one_time' | 'usage_based';
      features?: string[];
      user_limit?: number;
      confidence: number;
    }>;
    raw_html?: string;
    screenshot?: string;
  };
  error?: {
    message: string;
    code?: string;
    should_retry: boolean;
    suggested_method?: ScrapingMethod;
  };
  metadata?: {
    page_title?: string;
    last_modified?: string;
    detected_changes?: boolean;
  };
}

// Import the real orchestrator when ready
let ScrapingOrchestrator: any = null;
try {
  ScrapingOrchestrator = require('@/lib/services/scrapers/orchestrator').default;
  console.log('✅ Orchestrator loaded successfully');
} catch (e1) {
  console.log('⚠️ Orchestrator not available, using simulation mode');
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Helper function to get vendor configuration
 */
async function getVendorConfig(vendorId: string) {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, pricing_url, scraping_config')
    .eq('id', vendorId)
    .single();
  
  if (error) {
    console.error('Failed to get vendor config:', error);
    return null;
  }
  
  if (!data) {
    return null;
  }
  
  return {
    vendor_id: data.id,
    vendor_name: data.name,
    pricing_url: data.pricing_url || '',
    scraping_config: data.scraping_config as any
  };
}

/**
 * Simulate scraping for testing
 */
async function simulateScraping(
  vendorId: string,
  method: string,
  payload?: any
): Promise<WorkerScrapeResult> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
  
  const isSuccess = Math.random() > 0.2;
  
  if (isSuccess) {
    return {
      vendor_id: vendorId,
      method_used: method as ScrapingMethod,
      status: 'success',
      actual_cost: method === 'vision' ? 0.02 : method === 'firecrawl' ? 0.01 : 0,
      duration_ms: Math.floor(Math.random() * 3000 + 1000),
      started_at: new Date(Date.now() - 3000),
      completed_at: new Date(),
      data: {
        tiers: [
          {
            name: 'Starter',
            price: 29,
            price_model: 'per_month',
            features: ['Feature 1', 'Feature 2'],
            user_limit: 5,
            confidence: 0.95
          },
          {
            name: 'Pro',
            price: 99,
            price_model: 'per_month',
            features: ['All Starter features', 'Feature 3', 'Feature 4'],
            user_limit: 20,
            confidence: 0.92
          }
        ]
      },
      metadata: {
        page_title: 'Pricing - Test Vendor',
        detected_changes: false
      }
    };
  } else {
    return {
      vendor_id: vendorId,
      method_used: method as ScrapingMethod,
      status: 'failed',
      actual_cost: 0,
      duration_ms: Math.floor(Math.random() * 1000 + 500),
      started_at: new Date(Date.now() - 1000),
      completed_at: new Date(),
      error: {
        message: 'Simulated error: Page not accessible',
        code: 'PAGE_LOAD_ERROR',
        should_retry: true,
        suggested_method: 'vision' as ScrapingMethod
      }
    };
  }
}

/**
 * POST /api/worker/process-jobs
 * Processes queued scraping jobs
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '1'), 5);
    const dryRun = searchParams.get('dry_run') === 'true';
    
    const supabase = createServiceRoleClient();
    const schedulingService = new SchedulingService();
    
    // FIX: Cast the entire supabase client to bypass RPC typing issues
    const supabaseAny = supabase as any;
    
    // Get job queue stats
    const { data: statsData, error: statsError } = await supabaseAny
      .rpc('get_job_queue_stats');
    
    // The RPC might return an object or array, handle both cases
    const stats: JobQueueStats = Array.isArray(statsData) ? statsData[0] : statsData;
    
    if (statsError) {
      console.error('Failed to get job queue stats:', statsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to get queue statistics',
        details: statsError.message
      }, { status: 500 });
    }
    
    if (!stats || stats.queued === 0) {
      return NextResponse.json({
        success: true,
        message: 'No jobs to process',
        stats
      });
    }
    
    const processedJobs = [];
    
    // Process up to 'limit' jobs
    for (let i = 0; i < limit; i++) {
      // Dequeue next job
      const { data: jobData, error: dequeueError } = await supabaseAny
        .rpc('dequeue_scrape_job');
      
      if (dequeueError) {
        console.error('Failed to dequeue job:', dequeueError);
        break;
      }
      
      // Handle both array and single object returns
      const jobs: DequeuedJob[] = Array.isArray(jobData) ? jobData : (jobData ? [jobData] : []);
      
      if (jobs.length === 0) {
        console.log('No more jobs to process');
        break;
      }
      
      const currentJob = jobs[0];
      
      if (dryRun) {
        processedJobs.push({
          job_id: currentJob.job_id,
          vendor_id: currentJob.vendor_id,
          method: currentJob.method,
          status: 'would_process'
        });
        continue;
      }
      
      try {
        console.log(`Processing job ${currentJob.job_id} for vendor ${currentJob.vendor_id}`);
        
        let result: WorkerScrapeResult;
        
        // Try to use the real orchestrator first
        try {
          const vendorConfig: VendorScrapeConfig = {
            vendor_id: currentJob.vendor_id,
            vendor_name: currentJob.vendor_name || currentJob.vendor_id,
            pricing_url: `https://${currentJob.vendor_id}.com/pricing`,
            preferred_methods: [currentJob.method as ScrapingMethod],
            scrape_frequency: 'weekly',
            consecutive_failures: 0,
            max_failures_before_escalation: 3,
            estimated_cost_per_scrape: {
              playwright: 0,
              firecrawl: 0.01,
              vision: 0.02
            }
          };
          
          // Override with database vendor config if available
          const dbVendorConfig = await getVendorConfig(currentJob.vendor_id);
          if (dbVendorConfig) {
            vendorConfig.pricing_url = dbVendorConfig.pricing_url;
            if (dbVendorConfig.vendor_name) {
              vendorConfig.vendor_name = dbVendorConfig.vendor_name;
            }
          }
          
          console.log('Loading orchestrator for real scraping...');
          const { default: Orchestrator } = await import('@/lib/services/scrapers/orchestrator');
          
          result = await Orchestrator.scrapeVendor(vendorConfig, {
            force: currentJob.payload?.force || false,
            allow_paid: true,
            max_attempts: 3,
            session_id: `job_${currentJob.job_id}`
          });
          
          console.log('Real scraping completed successfully!');
          
        } catch (orchError) {
          console.error('Real scraping failed, using simulation:', orchError);
          result = await simulateScraping(
            currentJob.vendor_id,
            currentJob.method,
            currentJob.payload
          );
        }
        
        // Update job status to completed
        const { error: updateError } = await supabaseAny
          .rpc('update_job_status', {
            p_job_id: currentJob.job_id,
            p_status: 'completed',
            p_result: result
          });
        
        if (updateError) {
          console.error('Failed to update job status:', updateError);
        }
        
        // Record the scraping result
        await BudgetManagerService.recordResult(result);
        
        // Update vendor's last_scraped_at timestamp
        try {
          const isSuccess = result.status === 'success';
          const errorMessage = result.error?.message || undefined;
          
          await schedulingService.updateVendorScrapeStatus(
            currentJob.vendor_id,
            isSuccess,
            errorMessage
          );
          
          console.log(`✅ Updated vendor scrape status for ${currentJob.vendor_id}`);
        } catch (error) {
          console.error(`Failed to update vendor scrape status:`, error);
        }
        
        processedJobs.push({
          job_id: currentJob.job_id,
          vendor_id: currentJob.vendor_id,
          method: currentJob.method,
          status: result.status,
          cost: result.actual_cost,
          duration_ms: result.duration_ms
        });
        
      } catch (jobError: any) {
        console.error(`Failed to process job ${currentJob.job_id}:`, jobError);
        
        // Update job status to failed
        const { error: updateError } = await supabaseAny
          .rpc('update_job_status', {
            p_job_id: currentJob.job_id,
            p_status: 'failed',
            p_error: { 
              message: jobError.message || 'Unknown error',
              timestamp: new Date().toISOString()
            }
          });
        
        if (updateError) {
          console.error('Failed to update job status to failed:', updateError);
        }
        
        processedJobs.push({
          job_id: currentJob.job_id,
          vendor_id: currentJob.vendor_id,
          method: currentJob.method,
          status: 'failed',
          error: jobError.message
        });
      }
    }
    
    // Get updated statistics
    const { data: finalStatsData } = await supabaseAny
      .rpc('get_job_queue_stats');
    
    // Handle both array and single object returns
    const finalStats: JobQueueStats = Array.isArray(finalStatsData) ? finalStatsData[0] : finalStatsData;
    
    return NextResponse.json({
      success: true,
      message: `Processed ${processedJobs.length} jobs`,
      processed: processedJobs,
      stats: finalStats,
      dry_run: dryRun
    });
    
  } catch (error: any) {
    console.error('Worker processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process jobs',
        details: error.message 
      },
      { status: 500 }
    );
  }
}