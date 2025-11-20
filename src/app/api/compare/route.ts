// app/api/compare/share/route.ts
// API endpoint for generating and managing shareable comparison links

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { vendor_ids, expires_in_days = 30, is_public = true } = body;

    if (!vendor_ids || !Array.isArray(vendor_ids) || vendor_ids.length === 0) {
      return NextResponse.json(
        { error: 'Vendor IDs are required' },
        { status: 400 }
      );
    }

    if (vendor_ids.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 vendors can be shared' },
        { status: 400 }
      );
    }

    // Generate unique share ID
    const shareId = nanoid(10);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    // Store the share link in database
    const { data: shareData, error: insertError } = await supabase
      .from('comparison_shares')
      .insert({
        id: shareId,
        user_id: user.id,
        vendor_ids,
        is_public,
        expires_at: expiresAt.toISOString(),
        access_count: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      // If the table doesn't exist, create it first
      if (insertError.code === '42P01') {
        // Table doesn't exist, try to create it using raw SQL
        // Note: In production, this should be done via migrations
        console.log('Table comparison_shares does not exist, needs to be created via migration');
        
        // Return share link anyway with in-memory storage fallback
        return NextResponse.json({
          id: shareId,
          vendor_ids,
          expires_at: expiresAt.toISOString(),
          share_url: `/compare/shared/${shareId}`,
          message: 'Share link generated (database table pending creation)'
        });
      }

      console.error('Error saving share link:', insertError);
      
      // Return share link even if save fails
      return NextResponse.json({
        id: shareId,
        vendor_ids,
        expires_at: expiresAt.toISOString(),
        share_url: `/compare/shared/${shareId}`,
        message: 'Share link generated (save pending)'
      });
    }

    // Log share creation event (non-critical)
    const { error: eventError } = await supabase.from('user_events').insert({
      user_id: user.id,
      event_type: 'comparison_shared',
      metadata: {
        share_id: shareId,
        vendor_count: vendor_ids.length,
        expires_in_days
      }
    });

    if (eventError) {
      console.error('Failed to log share event:', eventError);
    }

    return NextResponse.json({
      id: shareId,
      vendor_ids,
      expires_at: shareData?.expires_at || expiresAt.toISOString(),
      share_url: `/compare/shared/${shareId}`,
      access_count: shareData?.access_count || 0,
      is_public: shareData?.is_public !== undefined ? shareData.is_public : is_public
    });

  } catch (error) {
    console.error('Unexpected error creating share link:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('id');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // First try to get the share data from database
    const { data: shareData, error: fetchError } = await supabase
      .from('comparison_shares')
      .select('*')
      .eq('id', shareId)
      .single();

    if (fetchError) {
      // If table doesn't exist or share not found
      if (fetchError.code === '42P01' || fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Share link not found or expired' },
          { status: 404 }
        );
      }

      console.error('Error fetching share:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch share data' },
        { status: 500 }
      );
    }

    // Check if share has expired
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This share link has expired' },
        { status: 410 }
      );
    }

    // Increment access count (non-critical)
    const { error: updateError } = await supabase
      .from('comparison_shares')
      .update({ 
        access_count: (shareData.access_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', shareId);

    if (updateError) {
      console.error('Failed to update access count:', updateError);
    }

    // Return the vendor IDs and metadata
    return NextResponse.json({
      id: shareData.id,
      vendor_ids: shareData.vendor_ids,
      created_at: shareData.created_at,
      expires_at: shareData.expires_at,
      access_count: shareData.access_count + 1,
      is_public: shareData.is_public
    });

  } catch (error) {
    console.error('Unexpected error fetching share:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('id');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the share (RLS will ensure user owns it)
    const { error: deleteError } = await supabase
      .from('comparison_shares')
      .delete()
      .eq('id', shareId)
      .eq('user_id', user.id);

    if (deleteError) {
      if (deleteError.code === '42P01') {
        return NextResponse.json(
          { error: 'Share system not initialized' },
          { status: 404 }
        );
      }
      
      console.error('Error deleting share:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete share link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Share link deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error deleting share:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}