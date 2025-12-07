//src/app/api/scrape/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import BudgetManagerService from '@/lib/services/scrapers/budget-manager';
import type { ScrapingMethod } from '@/types/scraping';
import type { JobQueueStats } from '@/types/rpc';

export const dynamic = 'force-dynamic';

// Request validation schemas
const scrapeRequestSchema = z.object({
  vendor_id: z.string().min(1, 'vendor_id cannot be empty'),
  vendor_name: z.string().optional(),
  method: z.enum(['playwright', 'firecrawl', 'vision', 'manual']).optional(),
  force: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(50),
  callback_url: z.string().url().optional(),
});

const scrapeQuerySchema = z.object({
  job_id: z.string().optional(),
  vendor_id: z.string().optional()
}).refine(data => data.job_id || data.vendor_id, {
  message: 'Either job_id or vendor_id must be provided'
});

/**
 * POST /api/scrape
 * Creates a scraping job and adds it to the queue
 * Returns immediately with job_id (async pattern)
 * 
 * Request body:
 * {
 *   vendor_id: string (required)
 *   vendor_name?: string (optional)
 *   method?: ScrapingMethod (optional - defaults to firecrawl)
 *   force?: boolean (optional - ignore cache if true)
 *   priority?: number (optional - 0-100, default 50)
 *   callback_url?: string (optional - webhook for completion)
 * }
 * 
 * Response (202 Accepted):
 * {
 *   success: boolean
 *   job_id: string
 *   status: 'queued'
 *   message: string
 *   estimated_wait_time?: number (seconds)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body with Zod
    const validatedData = scrapeRequestSchema.parse(body);
    const { 
      vendor_id, 
      vendor_name,
      method, 
      force,
      priority,
      callback_url
    } = validatedData;
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Check budget status first
    const budgetStatus = await BudgetManagerService.getStatus();
    if (!budgetStatus) {
      return NextResponse.json(
        { success: false, error: 'Budget system unavailable' },
        { status: 503 }
      );
    }
    
    // CHANGED: Default to firecrawl instead of playwright
    let selectedMethod: ScrapingMethod = method || 'firecrawl';
    let estimatedCost = 0;
    
    if (!method) {
      // CHANGED: Start with firecrawl as the preferred method
      const preferredMethods: ScrapingMethod[] = ['firecrawl', 'playwright', 'vision'];
      
      // Check if we can afford firecrawl first
      const canAffordFirecrawl = await BudgetManagerService.canAfford('firecrawl');
      
      if (canAffordFirecrawl) {
        selectedMethod = 'firecrawl';
      } else {
        // Fall back to free playwright if budget is tight
        selectedMethod = 'playwright';
        console.log('Budget insufficient for firecrawl, falling back to playwright');
      }
    } else {
      // Check if we can afford the requested method
      const canAfford = await BudgetManagerService.canAfford(method);
      if (!canAfford) {
        // Fallback to free method instead of failing
        selectedMethod = 'playwright';
        console.log(`Budget insufficient for ${method}, falling back to playwright`);
      }
    }
    
    // Calculate estimated cost
    const methodCosts = { playwright: 0, firecrawl: 0.01, vision: 0.02, manual: 0 };
    estimatedCost = methodCosts[selectedMethod as keyof typeof methodCosts] || 0;
    
    // Pre-allocate budget (will be refunded if job fails)
    const allocation = await BudgetManagerService.allocate(
      selectedMethod,
      vendor_id
    );
    
    if (!allocation.success) {
      // If we can't afford any paid method, force playwright
      if (selectedMethod !== 'playwright') {
        console.log('Budget allocation failed, forcing playwright method');
        selectedMethod = 'playwright';
        estimatedCost = 0;
        
        // Try allocation again with free method
        const freeAllocation = await BudgetManagerService.allocate('playwright', vendor_id);
        if (!freeAllocation.success) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Unable to allocate budget even for free scraping',
              budget_remaining: freeAllocation.remaining 
            },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: allocation.message,
            budget_remaining: allocation.remaining 
          },
          { status: 402 } // Payment Required
        );
      }
    }
    
    // Generate job ID
    const jobId = `job_${vendor_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create job payload
    const jobPayload = {
      method: selectedMethod,
      force,
      budget_allocated: estimatedCost,
      budget_allocation_id: Date.now().toString()
    };
    
    // Insert job into queue
    const { error: queueError } = await supabase
      .from('scrape_jobs')
      .insert({
        id: jobId,
        vendor_id,
        vendor_name,
        method: selectedMethod,
        force_refresh: force,
        priority,
        status: 'queued',
        payload: jobPayload,
        allocated_cost: estimatedCost,
        callback_url,
        metadata: {
          requested_at: new Date().toISOString(),
          requested_method: method,
          auto_selected: !method,
          default_method: 'firecrawl' // Track that we default to firecrawl
        }
      });
    
    if (queueError) {
      // Refund the budget allocation if we couldn't queue the job
      console.error('Failed to queue job:', queueError);
      // TODO: Implement budget refund logic
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to queue scraping job',
          details: queueError.message 
        },
        { status: 500 }
      );
    }
    
    // Get queue statistics to estimate wait time
    // Using 'any' to bypass strict typing and handle the response manually
    const { data: rawStats, error: statsError } = await (supabase.rpc as any)('get_job_queue_stats');
    
    // Initialize safe defaults
    let queuedCount = 0;
    let processingCount = 0;
    
    // Flexible parsing to handle any response format
    if (rawStats && !statsError) {
      // Debug log to see what we're actually getting
      console.log('Raw stats response:', JSON.stringify(rawStats));
      
      // Handle various possible response formats
      if (Array.isArray(rawStats)) {
        // It's an array, take the first element
        const firstElement = rawStats[0];
        if (firstElement && typeof firstElement === 'object') {
          queuedCount = Number(firstElement.queued) || 0;
          processingCount = Number(firstElement.processing) || 0;
        }
      } else if (typeof rawStats === 'object') {
        // It's an object, extract values directly
        queuedCount = Number(rawStats.queued) || 0;
        processingCount = Number(rawStats.processing) || 0;
      }
    }
    
    // Calculate estimated wait time
    const estimatedWaitTime = queuedCount * 10 + processingCount * 30; // Rough estimate in seconds
    
    // Return 202 Accepted - job has been queued
    return NextResponse.json(
      {
        success: true,
        job_id: jobId,
        status: 'queued',
        vendor_id,
        method: selectedMethod,
        estimated_cost: `$${estimatedCost.toFixed(2)}`,
        message: `Scraping job for ${vendor_name || vendor_id} has been queued using ${selectedMethod}`,
        estimated_wait_time: estimatedWaitTime || 30,
        queue_position: queuedCount + 1,
        check_status_url: `/api/scrape?job_id=${jobId}`,
        note: selectedMethod === 'playwright' && !method ? 'Using free fallback due to budget constraints' : undefined
      },
      { status: 202 } // Accepted
    );
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body',
          details: error.flatten()
        },
        { status: 400 }
      );
    }
    
    console.error('Error creating scrape job:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create scraping job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scrape?job_id=xxx
 * Check status of a scraping job
 * Clients should poll this endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('job_id');
    const vendorId = searchParams.get('vendor_id');
    
    // Validate that at least one parameter is provided
    if (!jobId && !vendorId) {
      return NextResponse.json(
        { success: false, error: 'job_id or vendor_id required' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    if (jobId) {
      // Get specific job by ID
      const { data: job, error } = await supabase
        .from('scrape_jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error || !job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }
      
      // Format response based on job status
      const response: any = {
        success: true,
        job_id: job.id,
        vendor_id: job.vendor_id,
        status: job.status,
        created_at: job.created_at,
        started_at: job.started_at,
        completed_at: job.completed_at,
        duration_ms: job.duration_ms,
        attempt_count: job.attempt_count,
        max_attempts: job.max_attempts
      };
      
      // Add result if completed
      if (job.status === 'completed' && job.result) {
        response.result = job.result;
        response.actual_cost = job.actual_cost;
      }
      
      // Add error if failed
      if (job.status === 'failed' && job.error) {
        response.error = job.error;
      }
      
      // Add progress indicator for running jobs
      if (job.status === 'running' && job.started_at) {
        const runningTime = Date.now() - new Date(job.started_at).getTime();
        response.running_time_ms = runningTime;
        response.estimated_completion = runningTime > 30000 ? 'soon' : '30-60 seconds';
      }
      
      // Add queue position for queued jobs
      if (job.status === 'queued') {
        const { count } = await supabase
          .from('scrape_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'queued')
          .lt('created_at', job.created_at);
        
        response.queue_position = (count || 0) + 1;
        response.estimated_wait_time = (count || 0) * 30; // seconds
      }
      
      return NextResponse.json(response);
      
    } else if (vendorId) {
      // Get recent jobs for vendor
      const { data: jobs, error } = await supabase
        .from('scrape_jobs')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch jobs' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        vendor_id: vendorId,
        jobs: jobs || [],
        total: jobs?.length || 0
      });
    }
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: error.flatten()
        },
        { status: 400 }
      );
    }
    
    console.error('Error fetching job status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}