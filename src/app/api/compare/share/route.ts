// app/api/compare/share/route.ts
// API endpoint for creating and retrieving shareable comparison links

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { ApiError, formatErrorResponse } from '@/utils/api-error';
import { nanoid } from 'nanoid';

// Validation schemas
const createShareSchema = z.object({
  vendor_ids: z.array(z.string()).min(1).max(5),
  expires_in_days: z.number().min(1).max(90).default(30),
  is_public: z.boolean().default(true)
});

const getShareSchema = z.object({
  id: z.string().min(1)
});

// POST: Create a shareable link
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication (optional - you might want public sharing)
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await request.json();
    const validationResult = createShareSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw ApiError.validation(
        validationResult.error.errors[0].message,
        validationResult.error.errors
      );
    }
    
    const { vendor_ids, expires_in_days, is_public } = validationResult.data;
    
    // Generate unique share token
    const shareToken = nanoid(12);
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);
    
    // Create the share record
    const { data: share, error: shareError } = await supabase
      .from('comparison_shares')
      .insert({
        share_token: shareToken,
        comparison_id: vendor_ids.join(','), // Store vendor IDs as comparison_id
        created_by: user?.id || null,
        expires_at: expiresAt.toISOString(),
        view_count: 0
      })
      .select()
      .single();
    
    if (shareError) {
      console.error('Error creating share:', shareError);
      throw ApiError.database('Failed to create share link', shareError);
    }
    
    // Return the share ID and URL
    return NextResponse.json({
      id: share.share_token,
      url: `/compare/shared/${share.share_token}`,
      expires_at: share.expires_at,
      vendor_ids: vendor_ids
    });
    
  } catch (error) {
    console.error('Error in share POST:', error);
    return formatErrorResponse(error, 'Failed to create share link');
  }
}

// GET: Retrieve a shared comparison
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shareId = searchParams.get('id');
    
    if (!shareId) {
      throw ApiError.validation('Share ID is required');
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Fetch the share record
    const { data: share, error: shareError } = await supabase
      .from('comparison_shares')
      .select('*')
      .eq('share_token', shareId)
      .single();
    
    if (shareError || !share) {
      throw ApiError.notFound('Share link not found or expired');
    }
    
    // Check if share has expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      throw ApiError.forbidden('This share link has expired');
    }
    
    // Increment view count (fire and forget)
    void supabase
      .from('comparison_shares')
      .update({ view_count: (share.view_count || 0) + 1 })
      .eq('id', share.id);
    
    // Parse vendor IDs from comparison_id
    const vendorIds = share.comparison_id?.split(',').filter(Boolean) || [];
    
    return NextResponse.json({
      vendor_ids: vendorIds,
      created_at: share.created_at,
      expires_at: share.expires_at,
      view_count: share.view_count
    });
    
  } catch (error) {
    console.error('Error in share GET:', error);
    return formatErrorResponse(error, 'Failed to retrieve share');
  }
}

// DELETE: Delete a share link (owner only)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shareId = searchParams.get('id');
    
    if (!shareId) {
      throw ApiError.validation('Share ID is required');
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    // Check ownership and delete
    const { error: deleteError } = await supabase
      .from('comparison_shares')
      .delete()
      .eq('share_token', shareId)
      .eq('created_by', user.id);
    
    if (deleteError) {
      throw ApiError.database('Failed to delete share', deleteError);
    }
    
    return NextResponse.json({ message: 'Share deleted successfully' });
    
  } catch (error) {
    console.error('Error in share DELETE:', error);
    return formatErrorResponse(error, 'Failed to delete share');
  }
}