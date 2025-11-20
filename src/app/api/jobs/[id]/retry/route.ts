// src/app/api/jobs/[id]/retry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const jobId = params.id;

    // Get the failed job
    const { data: job, error: fetchError } = await supabase
      .from('scrape_jobs')
      .select('*')
      .eq('id', jobId)
      .in('status', ['failed', 'cancelled'])
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { error: 'Job not found or not in a retriable state' },
        { status: 404 }
      );
    }

    // Create a new job with same parameters
    const { data: newJob, error: insertError } = await supabase
      .from('scrape_jobs')
      .insert({
        vendor_id: job.vendor_id,
        vendor_name: job.vendor_name,
        method: job.method,
        priority: job.priority ?? 50,
        status: 'pending',
        source: 'retry',
        created_at: new Date().toISOString(), // Required field
        metadata: {
          ...(job.metadata as any || {}),
          retry_of: jobId,
          retried_at: new Date().toISOString(),
          original_error: job.error
        }
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Update the original job to indicate it was retried
    await supabase
      .from('scrape_jobs')
      .update({
        metadata: {
          ...(job.metadata as any || {}),
          retried_as: newJob?.id,
          retried_at: new Date().toISOString()
        },
        created_at: job.created_at // Keep original created_at
      })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      newJobId: newJob?.id,
      message: `Job ${jobId} retried as ${newJob?.id}`
    });

  } catch (error) {
    console.error('Failed to retry job:', error);
    return NextResponse.json(
      { error: 'Failed to retry job' },
      { status: 500 }
    );
  }
}