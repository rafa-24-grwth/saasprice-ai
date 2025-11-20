// src/app/api/vendor/[id]/settings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const vendorId = params.id;
    const body = await request.json();
    const { enabled, frequency } = body;

    const updates: any = {};
    if (typeof enabled === 'boolean') {
      updates.scraping_enabled = enabled;
    }
    if (frequency) {
      updates.scrape_frequency = frequency;
    }

    const { error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', vendorId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to update vendor settings:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor settings' },
      { status: 500 }
    );
  }
}