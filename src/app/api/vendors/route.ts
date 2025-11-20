// src/app/api/vendors/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { vendorService } from '@/services/vendor/vendor.service';
import { ApiError, formatErrorResponse } from '@/utils/api-error';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw ApiError.unauthorized('Authentication required');
    }

    // Call service method with authenticated server client
    const result = await vendorService.getVendorsList(supabase);

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return formatErrorResponse(error, 'Failed to fetch vendors');
  }
}