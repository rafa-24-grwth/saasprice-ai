// src/app/api/vendor/[id]/scrape/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const vendorId = params.id;

    // Get vendor details
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Create a high-priority scrape job
    const { data: job, error: jobError } = await supabase
      .from('scrape_jobs')
      .insert({
        vendor_id: vendorId,
        vendor_name: vendor.name,
        priority: 10, // High priority for manual scrapes
        status: 'pending',
        force_refresh: true,
        metadata: {
          triggered_by: 'manual',
          triggered_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (jobError) {
      throw jobError;
    }

    return NextResponse.json({ 
      success: true, 
      jobId: job.id,
      message: `Scrape job queued for ${vendor.name}`
    });

  } catch (error) {
    console.error('Failed to create scrape job:', error);
    return NextResponse.json(
      { error: 'Failed to create scrape job' },
      { status: 500 }
    );
  }
}