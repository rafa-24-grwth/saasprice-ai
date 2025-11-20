// src/app/api/vendors/[id]/plans/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { vendorService } from '@/services/vendor/vendor.service';
import { ApiError, formatErrorResponse } from '@/utils/api-error';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const vendorId = params.id;

    if (!vendorId) {
      throw ApiError.validation('Vendor ID is required');
    }

    // Use the service to get vendor with pricing
    const result = await vendorService.getVendorWithPricingById(vendorId, supabase);

    if (!result) {
      throw ApiError.notFound('Vendor not found');
    }

    return NextResponse.json({
      plans: result.plans,
      vendor: result.vendor
    });

  } catch (error) {
    console.error('API Error:', error);
    return formatErrorResponse(error, 'Failed to fetch vendor plans');
  }
}

