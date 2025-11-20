// src/app/api/jobs/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const jobId = params.id;

    // Now with the correct generated types, this should work
    const { data, error } = await supabase
      .from('scrape_jobs')
      .update({ 
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        error: { message: 'Cancelled by user' },
        created_at: new Date().toISOString() // Required field in Update type
      })
      .eq('id', jobId)
      .in('status', ['pending', 'processing'])
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: `Job ${jobId} not found or already completed` },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Job ${jobId} cancelled`,
      job: data 
    });

  } catch (error) {
    console.error('Failed to cancel job:', error);
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    );
  }
}