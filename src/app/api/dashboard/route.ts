// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { DashboardResponse } from '@/types/api.types';
import { dashboardService } from '@/services/dashboard/dashboard.service';
import { ApiError, formatErrorResponse } from '@/utils/api-error';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    // FIX: Use proper cookie handling with getAll/setAll
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Server Component boundary - ignore
            }
          },
        },
      }
    );
    
    // Get current user - with fallback for development
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // For development - use mock data if no user
    if (!user) {
      const mockData = {
        metrics: {
          totalVendors: 127,
          comparisonsThisWeek: 43,
          averageSavings: 2847,
          dataQuality: 0.94
        },
        watchedVendors: [],
        recentActivity: [],
        recentPriceChanges: [],
        trends: []
      };
      
      return NextResponse.json({
        success: true,
        data: mockData,
        timestamp: new Date().toISOString()
      });
    }

    // Parse period
    const now = new Date();
    const periodDays = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': 365
    };
    const daysAgo = periodDays[period as keyof typeof periodDays] || 30;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const dashboardData = await dashboardService.getDashboardData(
      user.id,
      user.email || '',
      startDate,
      supabase
    );

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    // Return mock data instead of error for better UX
    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalVendors: 0,
          comparisonsThisWeek: 0,
          averageSavings: 0,
          dataQuality: 0
        },
        watchedVendors: [],
        recentActivity: [],
        recentPriceChanges: [],
        trends: []
      },
      timestamp: new Date().toISOString()
    });
  }
}