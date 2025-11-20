// app/api/monitoring/stats/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Single database call that returns all aggregated stats
    const { data: stats, error } = await supabase
      .rpc('get_monitoring_stats');
    
    if (error) {
      console.error('Error fetching monitoring stats:', error);
      throw error;
    }

    // Stats are already formatted by the database function
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error in monitoring stats endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch monitoring stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}